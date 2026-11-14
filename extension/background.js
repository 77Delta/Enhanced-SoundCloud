const bridge = 'ws://127.0.0.1:8765';

let socket = null, retryAt = 0, owner = null;

const connect = () => {
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) return;
    if (Date.now() < retryAt) return;
    retryAt = Date.now() + 5000;
    const current = socket = new WebSocket(bridge);
    current.onclose = current.onerror = () => { if (socket === current) socket = null; };
};

const send = text => {
    if (socket?.readyState === WebSocket.OPEN) { socket.send(text); return; }
    if (text === 'null') return;
    connect();
    if (socket?.readyState === WebSocket.CONNECTING) {
        const waiting = socket;
        waiting.onopen = () => waiting.send(latest);
    }
};

let latest = 'null';

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type !== 'esc-presence') return;
    const tabID = sender.tab?.id;
    if (message.data === null) {
        if (owner === tabID) { owner = null; latest = 'null'; send('null'); }
        return;
    }
    owner = tabID;
    latest = JSON.stringify(message.data);
    send(latest);
});

chrome.tabs.onRemoved.addListener(tabID => {
    if (tabID === owner) { owner = null; latest = 'null'; send('null'); }
});
