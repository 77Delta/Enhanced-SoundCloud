'use strict';

const net = require('net');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const { WebSocketServer } = require('ws');
const appID = '1567115240699731979';
const port = 8765;
const origin = /^(?:https:\/\/(?:[\w-]+\.)?soundcloud\.com|(?:chrome|moz)-extension:\/\/[\w-]+)$/;
const log = (...parts) => console.log(new Date().toLocaleTimeString(), ...parts);

const ipcPaths = index => {
    if (process.platform === 'win32') return [`\\\\?\\pipe\\discord-ipc-${index}`];
    const bases = [...new Set([process.env.XDG_RUNTIME_DIR, process.env.TMPDIR, process.env.TMP, process.env.TEMP, os.tmpdir(), '/tmp'].filter(Boolean))];
    const list = [];
    for (const base of bases) {
        list.push(path.join(base, `discord-ipc-${index}`));
        if (process.platform === 'linux') {
            list.push(
                path.join(base, 'app/com.discordapp.Discord', `discord-ipc-${index}`),
                path.join(base, 'app/com.discordapp.DiscordCanary', `discord-ipc-${index}`),
                path.join(base, 'snap.discord', `discord-ipc-${index}`)
            );
        }
    }
    return list;
};

const encode = (opcode, data) => {
    const body = Buffer.from(JSON.stringify(data));
    const head = Buffer.alloc(8);
    head.writeInt32LE(opcode, 0);
    head.writeInt32LE(body.length, 4);
    return Buffer.concat([head, body]);
};

const openSocket = target => new Promise((resolve, reject) => {
    const socket = net.createConnection(target);
    socket.once('connect', () => resolve(socket));
    socket.once('error', reject);
});

let socket = null, ready = false, connecting = false, buffer = Buffer.alloc(0);
let wanted = null, lastSent = '', lastSendTime = 0, sendTimer = null;

const onFrame = (opcode, payload) => {
    if (opcode === 1 && payload.evt === 'READY') {
        ready = true;
        log('Discord connected as', payload.data?.user?.username ?? 'unknown');
        lastSent = '';
        flush();
    } else if (opcode === 1 && payload.evt === 'ERROR') {
        log('Discord error:', payload.data?.message ?? 'unknown');
    } else if (opcode === 3) {
        socket?.write(encode(4, payload));
    } else if (opcode === 2) {
        socket?.destroy();
    }
};

const connectDiscord = async () => {
    if (socket || connecting) return;
    connecting = true;
    let found = null;
    for (let index = 0; index < 10 && !found; index++) {
        for (const target of ipcPaths(index)) {
            try { found = await openSocket(target); break; } catch {}
        }
    }
    connecting = false;
    if (!found) return;
    socket = found; buffer = Buffer.alloc(0); ready = false;
    found.on('error', () => {});
    found.on('data', chunk => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length >= 8) {
            const length = buffer.readInt32LE(4);
            if (buffer.length < 8 + length) break;
            const opcode = buffer.readInt32LE(0);
            let payload = {};
            try { payload = JSON.parse(buffer.subarray(8, 8 + length).toString()); } catch {}
            buffer = buffer.subarray(8 + length);
            onFrame(opcode, payload);
        }
    });
    found.on('close', () => {
        if (socket === found) { socket = null; ready = false; log('Discord disconnected'); }
    });
    found.write(encode(0, { v: 1, client_id: appID }));
};

const sendActivity = () => {
    if (!socket || !ready) return;
    const text = JSON.stringify(wanted);
    if (text === lastSent) return;
    lastSent = text; lastSendTime = Date.now();
    socket.write(encode(1, {
        cmd: 'SET_ACTIVITY',
        args: { pid: process.pid, activity: wanted || undefined },
        nonce: randomUUID()
    }));
};
const flush = () => {
    clearTimeout(sendTimer);
    const wait = 2000 - (Date.now() - lastSendTime);
    if (wait > 0) sendTimer = setTimeout(sendActivity, wait);
    else sendActivity();
};

const setActivity = activity => {
    wanted = activity;
    connectDiscord();
    flush();
};

setInterval(connectDiscord, 5000);
connectDiscord();

const clean = (value, fallback) => {
    let text = String(value ?? '').replace(/\s+/g, ' ').trim() || fallback;
    if (text.length > 128) text = text.slice(0, 125) + '...';
    return text.padEnd(2, '\u200b');
};

const build = data => {
    const start = Number.isFinite(data.start) ? Math.round(data.start) : Date.now();
    const end = Number.isFinite(data.end) && data.end > start ? Math.round(data.end) : 0;
    const art = typeof data.art === 'string' && /^https:\/\/[\w.-]+\.sndcdn\.com\//.test(data.art) ? data.art : null;
    const url = typeof data.url === 'string' && /^https:\/\/soundcloud\.com\//.test(data.url) && data.url.length < 512 ? data.url : null;
    return {
        type: 2,
        status_display_type: 1,
        details: clean(data.title, 'Unknown track'),
        state: clean(data.artist, 'Unknown artist'),
        timestamps: end ? { start, end } : { start },
        assets: art ? { large_image: art } : undefined,
        buttons: url ? [{ label: 'Listen on SoundCloud', url }] : undefined,
        instance: false
    };
};

const wss = new WebSocketServer({
    host: '127.0.0.1',
    port: port,
    maxPayload: 16 * 1024,
    verifyClient: info => !info.origin || origin.test(info.origin)
});

wss.on('error', error => {
    if (error.code === 'EADDRINUSE') { log(`Port ${port} busy. Bridge already running?`); process.exit(0); }
    log('Server error:', error.message);
});

wss.on('listening', () => log(`Bridge listening on ws://127.0.0.1:${port}`));

let owner = null;

wss.on('connection', ws => {
    log('Browser connected');
    ws.on('message', raw => {
        let data;
        try { data = JSON.parse(raw.toString()); } catch { return; }
        if (data === null) {
            if (owner === ws) { owner = null; log('Paused / stopped'); setActivity(null); }
            return;
        }
        if (typeof data !== 'object') return;
        owner = ws;
        const activity = build(data);
        if (activity.details !== wanted?.details) log('Now playing:', activity.state, '-', activity.details);
        setActivity(activity);
    });
    ws.on('close', () => { if (owner === ws) { owner = null; setActivity(null); } });
    ws.on('error', () => {});
});

const quit = () => {
    if (socket && ready) socket.write(encode(1, { cmd: 'SET_ACTIVITY', args: { pid: process.pid }, nonce: randomUUID() }));
    setTimeout(() => process.exit(0), 150);
};
process.on('SIGINT', quit);
process.on('SIGTERM', quit);
