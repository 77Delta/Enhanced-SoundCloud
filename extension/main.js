(() => {
    'use strict';

    const databaseLink = 'https://raw.githubusercontent.com/77Delta/Enhanced-SoundCloud/main/tracks.json';
    const lyricsMinimum = 60;
    const videoMinimum = 40;
    const piped = ['https://pipedapi.kavin.rocks', 'https://api.piped.private.coffee', 'https://pipedapi.adminforge.de'];
    const invidious = ['https://inv.nadeko.net', 'https://yewtu.be', 'https://invidious.nerdvpn.de'];
    const top = window === window.top;
    const defaults = { speed: true, download: true, lyrics: true, video: true, blur: 5.5, brightness: 75, accent: true, debloat: true };
    const settingsKey = 'esc:settings';
    const settings = { ...defaults };
    const loadSettings = () => { try { Object.assign(settings, JSON.parse(localStorage.getItem(settingsKey)) || {}); } catch {} };
    const saveSettings = () => { try { localStorage.setItem(settingsKey, JSON.stringify(settings)); } catch {} };

    loadSettings();

    const currentSpeed = () => settings.speed ? speed : 1;

    const frameStyle = `
    :root,body{color-scheme:normal!important;background:transparent!important;--mui-palette-background-default:transparent!important;--mui-palette-background-paper:transparent!important}
    #__next,#navigation-shell-right-side-container,#main,main,aside,section,.MuiStack-root,.MuiBox-root,.MuiPaper-root{background:transparent!important;background-image:none!important}
    .MuiTooltip-tooltip,.MuiPopover-paper.MuiPaper-root,.MuiMenu-paper.MuiPaper-root,.MuiPopper-root .MuiPaper-root{background:rgba(15,15,15,.95)!important;backdrop-filter:blur(8px)}
    .MuiTooltip-arrow{color:rgba(15,15,15,.95)!important}
    html.esc-download div[title="Download track"]:not(.cobalt-mui){display:none!important}
    html.esc-debloat .mui-1pq3j80,.mui-1n42n8{display:none!important}`;

    const topStyle = `
    .speed{position:relative;display:flex;align-items:center;height:100%;margin:0 8px 0 0}
    .speed>button{all:unset;cursor:pointer;width:48px;height:24px;line-height:24px;text-align:center;font-size:12px;font-variant-numeric:tabular-nums;color:var(--primary-color);background:rgba(0,0,0,.3);border-radius:4px}
    .speed>button:hover{background:rgba(0,0,0,.45)}
    .speed__p{display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;width:170px;padding:14px 16px;background:var(--surface-color);border:1px solid rgba(var(--primary-rgb),.15);border-radius:4px;z-index:99}
    .speed.open .speed__p{display:block}
    .speed__slider{position:relative;height:16px;margin:0 8px 14px;cursor:pointer;touch-action:none}
    .speed__bg,.speed__fill{position:absolute;top:6px;height:4px}
    .speed__bg{left:0;right:0;background:var(--highlight-color)}
    .speed__fill{left:0;background:var(--primary-color)}
    .speed__handle{position:absolute;top:0;width:16px;height:16px;margin-left:-8px;box-sizing:border-box;border-radius:100%;border:1.5px solid var(--primary-color);background:var(--surface-color)}
    html.esc-download .moreActions .sc-button-download{display:none}
    html.esc-no-speed .speed{display:none}
    html.esc-debloat :is(.header__upsellWrapper,.homeCreditTracker,.velvetCakeModule,.artistConnectItem__upsell,.header__forArtistsButton,a[href*="checkout.soundcloud.com/artist"],a[href*="/you/insights"],a[href*="/you/subscriptions?ref=t2207"],a[href*="vinyl-store"],a[href*="/benefits"],.newUploadBanner,.velvetCakeIframe,.m-promotion,.esc-bloat,.spotlight.isMine,.quotaMeter__upsellText){display:none!important}
    .profileHeaderBackground,.profileHeaderBackground__visual{border-radius:16px!important;overflow:hidden!important}
    #video-background{display:none;position:fixed;inset:0;z-index:-1;overflow:hidden;background:#000;pointer-events:none}
    #esc-video{position:absolute;inset:0;filter:blur(var(--esc-blur,5.5px)) brightness(var(--esc-bright,.75)) saturate(1.3);transform:scale(1.25)}
    #esc-video iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);border:0;transform:translate(-50%,-50%);pointer-events:none}
    #video-shade{position:absolute;inset:0;background:rgba(0,0,0,.55)}
    html.video-background-on{
        background:#000;
        & #video-background{display:block}
        & body{--background-surface-color:transparent!important;color-scheme:normal!important}
        & :where(body,#app,#content,.l-content,.l-container,.l-inner-fullwidth,.l-fluid-fixed,.l-fixed-fluid,.l-three-column,.l-search,.l-main,.l-sidebar-left,.l-sidebar-right,.l-product-banners,.l-hero-banner,.sidebarModule,.searchTitle,.l-listen-wrapper,.l-listen-hero,.l-listen__mainContent,.l-about-top,.l-about-main,.l-about-left,.l-about-right,.listen-content,.listenContent,.listenHero,.listen-about,.fullHero,.fullHero__foreground,.fullHero__playerArea,.systemPlaylistHero,.systemPlaylistHero__foreground,.genericTrackCount,.listenEngagement,.listenDetails,.listenArtistInfo,.soundBadge:not(:hover),iframe.webiIframe){background:transparent!important}
        & :is(.fullHero,.l-listen-hero) .backgroundGradient,
 & :is(.listenArtworkWrapper__backdrop,.heroBackground,.fullHero__backgroundImage){display:none!important}
 & .fullHero{text-shadow:0 1px 6px rgba(0,0,0,.7)}
 & :is(.g-type-shrinkwrap-inline,.g-type-shrinkwrap-block){background:rgba(0,0,0,.55)!important}
 & :is(.g-type-shrinkwrap-inline,.g-type-shrinkwrap-block)::before{background:transparent!important}
 & :is(.sc-button-secondary:not(.moreActions__button, .moreActions__link),.sc-input,.sc-tag){background:rgba(0,0,0,.55)!important}
 & :is(.sc-button-secondary.sc-button-icon, .moreActions__button, .moreActions__link){background:transparent!important}
 & .tileGallery__sliderButton.sc-button-secondary{background:rgba(0,0,0,.55)!important}
 & :is(.header,.playControls__inner,.playControls__bg){background:rgba(0,0,0,.55)!important;backdrop-filter:blur(4px)}
 & .dropdownMenu{background:rgba(15,15,15,.95)!important;backdrop-filter:blur(8px);border-radius:4px}
 & .dropbar{background:rgba(0,0,0,.55)!important;backdrop-filter:blur(4px);border-radius:4px!important;border:1px solid rgba(255,255,255,.1)!important}
 & .artistConnectItem{background:rgba(15,15,15,.95)!important;backdrop-filter:blur(8px)}
 & :is(.dropbar__content,.userDropbar){background:transparent!important;border-color:rgba(255,255,255,.1)!important}
    }
    #lyrics{display:none;position:fixed;top:58px;bottom:calc(var(--play-controls-height,48px) + 12px);width:min(320px,28vw);min-width:320px;z-index:200;overflow:hidden}
    html.lyrics-on #lyrics{display:block}
    .lyrics-scroll{position:absolute;inset:0;overflow-y:auto;padding:38% 20px;box-sizing:border-box;scrollbar-width:none;mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent)}
    .lyrics-scroll::-webkit-scrollbar{display:none}
    .lyrics-line{color:#fff;font:700 clamp(17px,1.5vw,24px)/1.3 var(--font-main,system-ui,sans-serif);margin:.55em 0;opacity:.28;cursor:pointer;transform-origin:left center;transition:opacity .35s,transform .35s}
    .lyrics-line:hover{opacity:.7}
    .lyrics-line.near{opacity:.5}
    .lyrics-line.active{opacity:1;transform:scale(1.03)}
    .lyrics-scroll.plain{padding-top:10%}
    .lyrics-scroll.plain .lyrics-line{opacity:.9;cursor:default;transform:none;font-weight:600}
    .lyrics-scroll.plain .lyrics-line:empty{height:.6em}
    #esc-gear{position:fixed;right:30px;bottom:calc(var(--play-controls-height,68px) + 10px);z-index:300;font:13px var(--font-main,system-ui,sans-serif)}
    #esc-gear>button{all:unset;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;background:rgba(0,0,0,.55);backdrop-filter:blur(4px)}
    #esc-gear>button:hover{background:rgba(0,0,0,.8)}
    .esc-panel{display:none;position:absolute;right:0;bottom:42px;width:270px;padding:8px 14px;color:#fff;background:rgba(15,15,15,.95);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);border-radius:4px}
    #esc-gear.open .esc-panel{display:block}
    .esc-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;cursor:pointer}
    .esc-slide{display:block;margin:10px 0}
    .esc-slide>span{display:flex;justify-content:space-between;margin-bottom:4px}
    .esc-panel input{accent-color:var(--special-color,#f50);cursor:pointer}
    .esc-slide input{width:100%;margin:0}
    .esc-reset{all:unset;display:block;width:100%;box-sizing:border-box;margin:12px 0 6px;padding:6px 0;text-align:center;cursor:pointer;border-radius:4px;background:rgba(255,255,255,.1)}
    .esc-reset:hover{background:rgba(255,255,255,.2)}
    .esc-note{margin:6px 0 4px;font-size:11px;line-height:1.4;opacity:.7}
    .esc-note a{color:#fff!important;text-decoration:underline}
    .lyrics-line.active .lyrics-word{background:linear-gradient(90deg,#fff calc(var(--p,0)*100%),rgba(255,255,255,.4) calc(var(--p,0)*100%));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}`;

    const addStyle = style => {
        const item = document.createElement('style');
        item.textContent = style;
        document.documentElement.append(item);
        return item;
    };

    const observe = callback => {
        let queued = false;
        const execute = () => { queued = false; callback(); };
        new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(execute); } })
        .observe(document.documentElement, { childList: true, subtree: true });
        callback();
    };

    const fetchJSON = link => new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === 'function') {
            GM_xmlhttpRequest({
                method: 'GET', url: link, timeout: 8000, headers: { Accept: 'application/json' },
                onload: response => { if (response.status >= 400) return reject(new Error(response.status)); try { resolve(JSON.parse(response.responseText)); } catch (error) { reject(error); } },
                              onerror: reject, ontimeout: reject
            });
            return;
        }
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
        fetch(link, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
        .then(resolve, reject)
        .finally(() => clearTimeout(timer));
    });

    const openCobalt = link => window.open('https://cobalt.meowing.de/#' + link, '_blank');
    const pageLink = () => { try { return window.top.location.href; } catch { return location.href; } };

    let menu;

    document.addEventListener('click', event => {
        const more = event.target.closest?.('.sc-button-more');
        if (more) menu = more.closest('.sound,.soundBadge,.trackItem,.playableTile,.playbackSoundBadge,.searchItem');
        if (settings.download && event.target.closest?.('[aria-label="Download track"]')) { event.preventDefault(); event.stopImmediatePropagation(); openCobalt(pageLink()); }
    }, true);
    const downloadPass = () => {
        document.documentElement.classList.toggle('esc-debloat', settings.debloat);
        document.documentElement.classList.toggle('esc-download', settings.download);
        if (!settings.download) { document.querySelectorAll('.cobalt,.cobalt-mui').forEach(item => item.remove()); return; }
        document.querySelectorAll('.moreActions:not(:has(.cobalt))').forEach(action => {
            const button = document.createElement('button');
            button.className = 'cobalt sc-button-secondary sc-button moreActions__button sc-button-medium sc-button-tertiary';
            button.title = 'Download track';
            button.innerHTML = `<div><svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.47-7.53l1.06 1.06L8 13.06 3.47 8.53l1.06-1.06 2.72 2.72V3h1.5v7.19l2.72-2.72z" fill="currentColor"></path></svg></div><span class="sc-button-label">Download track</span>`;
            button.onclick = () => {
                const link = menu?.querySelector('a.soundTitle__title,a.trackItem__trackTitle,a.playableTile__heading,a.playbackSoundBadge__titleLink');
                openCobalt(link ? link.href : pageLink());
            };
            (action.querySelector('.moreActions__group') || action).append(button);
        });
        const mui = document.querySelector('.mui-16ytee5');
        if (mui && !document.querySelector('.cobalt-mui')) {
            document.querySelectorAll('button[aria-label="Download track"], div[title="Download track"]:not(.cobalt-mui)').forEach(item => item.remove());
            const button = document.createElement('div');
            button.className = 'MuiBox-root mui-0 cobalt-mui';
            button.title = 'Download track';
            button.innerHTML = '<button class="MuiButtonBase-root MuiIconButton-root MuiIconButton-colorContrast MuiIconButton-sizeMedium mui-rrs2t8" tabindex="0" type="button" variant="outlined" aria-label="Download track"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M12.75 3v15.44l5.5-5.5L19.31 14 12 21.31 4.69 14l1.06-1.06 5.5 5.5V3h1.5Z" clip-rule="evenodd"></path></svg></button>';
            button.onclick = () => {
                const link = document.querySelector('a.soundTitle__title,a.trackItem__trackTitle,a.playableTile__heading,a.playbackSoundBadge__titleLink');
                openCobalt(link ? link.href : pageLink());
            };
            mui.append(button);
        }
    };

    if (!top) {
        addStyle(frameStyle);
        observe(downloadPass);
        addEventListener('storage', () => { loadSettings(); downloadPass(); });
        return;
    }

    addStyle(topStyle);

    const root = document.documentElement;
    root.insertAdjacentHTML('beforeend', '<div id="video-background"><div id="esc-video"></div><div id="video-shade"></div></div><div id="lyrics"><div class="lyrics-scroll"><div class="lyrics-lines"></div></div></div>');
    const videoHost = document.getElementById('esc-video');
    const scroll = document.querySelector('.lyrics-scroll');
    const box = document.querySelector('.lyrics-lines');
    const fold = text => (text || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, '');
    const queryText = text => text.replace(/[^\p{L}\p{N}\s]+/gu, ' ').replace(/\s+/g, ' ').trim();
    const promo = /\b(?:(?:out now |now )?(?:available )?on (?:all )?(?:plat\w*|spotify|apple music|youtube|yt|itunes|soundcloud|streaming\w*)|all plat\w*|out now|video(?:clip)? (?:en la |in )desc\w*|mv in desc\w*|music vid\w*(?: on yt| on youtube)?|search it|link in (?:bio|desc\w*)|stream now|free (?:dl|download)|official (?:music )?(?:video|audio|visual)|music video|visuali[sz]er|lyric video)\b/gi;
    const musicVideo = /official (?:music )?(?:video|audio|visual)|music video|\bm\/?v\b|visuali[sz]er|video oficial|animated/i;
    const bad = /lyric|slowed|reverb|sped ?up|nightcore|\b8d\b|reaction|\bcover\b|remix|instrumental|karaoke|mashup|1 ?hour/i;

    const parseTrack = (raw, uploader) => {
        const clean = raw
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u200d\ufe0f]/gu, ' ')
        .replace(/\*+[^*]*\*+/g, ' ')
        .replace(/[(\[{][^)\]}]*[)\]}]/g, ' ')
.replace(/\)[^()]*\(/g, ' ')
.replace(/["\u201c\u201d'\u2019<>\u00ab\u00bb]+/g, ' ')
.replace(promo, ' ')
.replace(/[#@]\S+/g, ' ')
.replace(/\s(?:ft|feat|featuring|prod|w)[.\/ ].*$/i, ' ')
.replace(/^\s*\d{1,2}[.)]\s+/, '')
.replace(/\s+/g, ' ').trim()
.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const parts = clean.split(/\s[-\u2013\u2014]\s/);
const song = (parts.length > 1 ? parts.slice(1).join(' - ') : clean).trim();
const names = [...new Set([parts.length > 1 ? parts[0].trim() : '', (uploader || '').replace(/^@/, '').trim()])].filter(name => fold(name).length > 1);
const words = song.split(/\s+/).map(fold).filter(Boolean);
const extra = raw.toLowerCase().split(/[^\p{L}\p{N}]+/u).map(fold).filter(word => word.length > 2 && !words.includes(word) && !musicVideo.test(word) && !bad.test(word));
return { raw, song, names, keys: names.map(fold), words, compact: fold(song), extra };
};

const nameMatch = (keys, other) => keys.some(key => other.includes(key) || (other.length > 2 && key.includes(other)));
const normalizeKey = text => String(text).replace(/^https?:\/\/(?:m\.)?soundcloud\.com/i, '').split(/[?#]/)[0].replace(/^\/+|\/+$/g, '').toLowerCase();
const parseYoutubeID = value => typeof value === 'string' ? (value.match(/(?:[?&]v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || value.match(/^([\w-]{11})$/))?.[1] || null : null;
const lrclibID = value => String(value ?? '').match(/(\d+)\/?$/)?.[1] || null;
const overrideKey = 'esc:overrides';

let overrides = null, overridesRequest = null, databaseRetry = 0;

const buildOverrides = item => new Map(Object.entries(item || {}).filter(([, value]) => value && typeof value === 'object').map(([key, value]) => [normalizeKey(key), value]));
const refreshOverrides = () => overridesRequest ||= fetchJSON(databaseLink)

.then(item => { try { localStorage.setItem(overrideKey, JSON.stringify({ time: Date.now(), data: item })); } catch {} return overrides = buildOverrides(item); })
.finally(() => { overridesRequest = null; });

const getOverride = async key => {
    if (!databaseLink) return undefined;
    if (!overrides) {
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(overrideKey)); } catch {}
        if (cached?.data) {
            overrides = buildOverrides(cached.data);
            if (Date.now() - cached.time > videoMinimum * lyricsMinimum * 1000 ) refreshOverrides().catch(() => {});
        } else if (Date.now() >= databaseRetry) {
            await refreshOverrides().catch(() => { databaseRetry = Date.now() + 60000; });
        }
    }
    return overrides?.get(normalizeKey(key));
};

const parseSynced = text => {
    const output = [];
    for (const line of text.split('\n')) {
        const stamps = [...line.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
        if (!stamps.length) continue;
        const words = line.replace(/\[[^\]]*\]/g, '').trim();
        for (const match of stamps) output.push({ time: +match[1] * 60 + parseFloat(match[2].replace(':', '.')), text: words });
    }
    return output.sort((first, second) => first.time - second.time);
};

const parsePlain = text => {
    const output = [];
    for (const raw of text.replace(/\r/g, '').split('\n')) {
        const line = raw.trim();
        if (line || (output.length && output[output.length - 1].text)) output.push({ text: line });
    }
    while (output.length && !output[output.length - 1].text) output.pop();
    return output;
};

const yamlScalar = raw => {
    const text = raw.trim();
    if (!text) return '';
    if (text[0] === "'") {
        let output = '';
        for (let index = 1; index < text.length; index++) {
            if (text[index] === "'") {
                if (text[index + 1] === "'") { output += "'"; index++; continue; }
                return output;
            }
            output += text[index];
        }
        return output;
    }
    if (text[0] === '"') {
        for (let index = 1; index < text.length; index++) {
            if (text[index] === '\\') { index++; continue; }
            if (text[index] === '"') {
                try { return JSON.parse(text.slice(0, index + 1)); } catch { return text.slice(1, index); }
            }
        }
        return text.slice(1);
    }
    const plain = text.replace(/\s#.*$/, '');
    return plain === '~' || plain === 'null' ? '' : plain;
};

const parseLyricsfile = text => {
    const lines = [];
    let inLines = false, line = null, word = null, wordsIndent = -1;
    for (const raw of String(text).split(/\r?\n/)) {
        const match = raw.match(/^(\s*)(- )?([A-Za-z_]+):(?: (.*))?$/);
        if (!match) continue;
        const indent = match[1].length, dash = !!match[2], key = match[3], value = match[4] ?? '';
        if (!dash && indent === 0) { inLines = key === 'lines'; line = word = null; wordsIndent = -1; continue; }
        if (!inLines) continue;
        if (dash && key === 'text') {
            if (line && wordsIndent >= 0 && indent >= wordsIndent) {
                word = { text: yamlScalar(value) };
                (line.words ||= []).push(word);
            } else {
                line = { text: yamlScalar(value), fieldIndent: indent + 2 };
                word = null; wordsIndent = -1;
                lines.push(line);
            }
            continue;
        }
        if (!line) continue;
        if (key === 'words' && !dash) { wordsIndent = value.trim() ? -1 : indent; word = null; continue; }
        if (key === 'start_ms' || key === 'end_ms') {
            const number = parseFloat(value);
            if (!Number.isFinite(number)) continue;
            const target = word && indent > line.fieldIndent ? word : line;
            target[key === 'start_ms' ? 'start' : 'end'] = number / 1000;
        }
    }
    const output = lines.filter(item => Number.isFinite(item.start)).map(item => {
        const words = (item.words || []).filter(entry => Number.isFinite(entry.start)).map((entry, index, all) => ({
            text: entry.text,
            start: entry.start,
            end: Math.max(entry.end ?? all[index + 1]?.start ?? item.end ?? entry.start + .5, entry.start + .05)
        }));
        return { time: item.start, text: item.text || words.map(entry => entry.text).join('').trim(), words: words.length ? words : undefined };
    }).sort((first, second) => first.time - second.time);
    return output.length ? { synced: true, words: output.some(item => item.words), lines: output } : null;
};

const hasWords = item => !!item.lyricsfile && (item.hasWordSync === true || /^\s*words:/m.test(item.lyricsfile));

const toLyrics = item => {
    if (hasWords(item)) {
        try { const rich = parseLyricsfile(item.lyricsfile); if (rich?.words) return rich; } catch {}
    }
    const synced = item.syncedLyrics && parseSynced(item.syncedLyrics);
    if (synced?.length) return { synced: true, lines: synced };
    const plain = item.plainLyrics && parsePlain(item.plainLyrics);
    return plain?.length ? { synced: false, lines: plain } : null;
};

const scoreLyrics = (item, context, duration) => {
    if ((!item.syncedLyrics && !item.plainLyrics && !item.lyricsfile) || item.instrumental) return -1;
    const track = fold(item.trackName), artist = fold(item.artistName), song = context.compact;
    if (!song || !track) return -1;
    let score = 0;
    if (track === song) score += 50;
    else if (track.includes(song) || song.includes(track)) score += 35;
    else if (context.words.filter(word => track.includes(word)).length >= Math.max(1, context.words.length * .6)) score += 15;
    else return -1;
    if (nameMatch(context.keys, artist)) score += 40;
    if (bad.test(item.trackName) && !bad.test(context.raw)) score -= 40;
    if (duration && item.duration) {
        const difference = Math.abs(item.duration - duration);
        const penalty = difference <= 5 ? 20 : difference <= 10 ? 10 : difference <= 20 ? -10 : difference <= 40 ? -35 : -100;
        score += (item.syncedLyrics || hasWords(item)) ? penalty : Math.max(penalty, -10);
    }
    return score;
};

const pickLyrics = (pool, context, duration) => {
    let best = null;
    for (const item of pool.values()) {
        const score = scoreLyrics(item, context, duration);
        if (score < lyricsMinimum) continue;
        const rank = hasWords(item) ? 2 : item.syncedLyrics ? 1 : 0;
        if (!best || rank > best.rank || (rank === best.rank && score > best.score)) best = { item, score, rank };
    }
    return best && toLyrics(best.item);
};

const lrclibSearch = async parameters => {
    const response = await fetchJSON('https://lrclib.net/api/search?' + new URLSearchParams(parameters));
    if (!Array.isArray(response)) throw new Error('bad response');
    return response;
};

const fetchLyrics = async information => {
    const override = await getOverride(information.key);
    if (override) {
        if ('lrclib' in override) {
            const ID = lrclibID(override.lrclib);
            if (!ID) return null;
            try { return toLyrics(await fetchJSON('https://lrclib.net/api/get/' + ID)); }
            catch (error) { if (error?.message === '404') return null; throw error; }
        }
        return null;
    }
    const context = parseTrack(information.title, information.artist);
    if (!context.compact) return null;
    const song = queryText(context.song), names = context.names.map(queryText), pool = new Map();
    let reached = false;
    const round = async queries => {
        const results = await Promise.allSettled(queries.map(lrclibSearch));
        for (const response of results) {
            if (response.status !== 'fulfilled') continue;
            reached = true;
            response.value.forEach(item => pool.has(item.id) || pool.set(item.id, item));
        }
        return pickLyrics(pool, context, information.duration);
    };
    let found = await round([...names.map(name => ({ track_name: song, artist_name: name })), ...names.map(name => ({ q: `${name} ${song}` }))]);
    if (!found?.synced) found = await round([{ track_name: song }, { q: song }, { q: queryText(context.raw) }]);
    if (!found && !reached) throw new Error('lyrics servers down');
    return found ?? null;
};

const hedge = (tasks, delay = 1500) => new Promise((resolve, reject) => {
    let next = 0, failed = 0, done = false, timer;
    const launch = () => {
        clearTimeout(timer);
        if (done || next >= tasks.length) return;
        const task = tasks[next++];
        if (next < tasks.length) timer = setTimeout(launch, delay);
        task().then(value => {
            if (done) return;
            done = true; clearTimeout(timer); resolve(value);
        }, () => {
            if (done) return;
            if (++failed === tasks.length) { done = true; reject(new Error('all sources failed')); }
            else launch();
        });
    };
    launch();
});

const pipedSource = base => async query => {
    const response = await fetchJSON(`${base}/search?q=${query}&filter=videos`);
    return (response.items || []).filter(item => item.url?.includes('v=')).map(item => ({ ID: new URLSearchParams(item.url.split('?')[1]).get('v'), length: item.duration, title: item.title || '', author: item.uploaderName || '' }));
};

const invidiousSource = base => async query => {
    const response = await fetchJSON(`${base}/api/v1/search?q=${query}&type=video`);
    return response.filter(item => item.videoID).map(item => ({ ID: item.videoID, length: item.lengthSeconds, title: item.title || '', author: item.author || '' }));
};

const sources = [];
for (let index = 0; index < Math.max(piped.length, invidious.length); index++) {
    if (piped[index]) sources.push(pipedSource(piped[index]));
    if (invidious[index]) sources.push(invidiousSource(invidious[index]));
}

const searchVideos = (query, network) => {
    const encoded = encodeURIComponent(query);
    return hedge(sources.map(source => async () => {
        const items = await source(encoded);
        network.ok = true;
        if (!items.length) throw new Error('empty');
        return items;
    }));
};

const scoreVideo = (value, context, duration) => {
    const title = fold(value.title), author = fold(value.author);
    const hasSong = title.includes(context.compact);
    const matched = context.words.filter(word => title.includes(word)).length;
    if (!hasSong && matched < Math.max(1, context.words.length * .5)) return -1;
    let score = matched * 5;
    if (nameMatch(context.keys, author)) score += 50;
    if (context.keys.some(key => title.includes(key))) score += 20;
    if (hasSong) score += 30;
    if (musicVideo.test(value.title)) score += 30;
    if (author.endsWith('topic')) score -= 60;
    if (bad.test(value.title) && !bad.test(context.raw)) score -= 60;
    if (/#shorts/i.test(value.title) || value.length < 45) score -= 40;
    if (duration && value.length) {
        const ratio = value.length / duration;
        if (ratio < .6 || ratio > 2) score -= 40;
        else if (Math.abs(value.length - duration) <= 10) score += 15;
    }
    if (context.extra.some(word => title.includes(word))) score += 20;
    return score;
};

const findVideo = async (context, duration) => {
    if (!context.compact) return null;
    const pool = new Map(), network = { ok: false };
    const round = async queries => {
        const unique = [...new Set(queries.map(query => query.replace(/\s+/g, ' ').trim()).filter(Boolean))];
        const lists = await Promise.all(unique.map(query => searchVideos(query, network).catch(() => [])));
        lists.flat().forEach(value => value.ID && !pool.has(value.ID) && pool.set(value.ID, value));
        let best = null, top = videoMinimum;
        for (const value of pool.values()) { const score = scoreVideo(value, context, duration); if (score > top) { best = value; top = score; } }
        return best?.ID ?? null;
    };
    const [first = '', second = first] = context.names.map(queryText), song = queryText(context.song);
    const raw = queryText(context.raw).replace(/(?:mv|video(?:clip)?) (?:en la |in )desc\w*|music vid\w*(?: on youtube)?|search it/gi, '');
    const ID = await round([`${first} ${song} official music video`, `${first} ${song} visualizer`, raw])
    || await round([`${second} ${song} music video`, `${first} ${song}`, `${song} ${second}`, `${raw} audio`, song]);
    if (!ID && !network.ok) throw new Error('video servers down');
    return ID;
};

const fetchVideo = async information => {
    const override = await getOverride(information.key);
    if (override !== undefined) {
        if (override !== null && 'youtube' in override) {
            return parseYoutubeID(override.youtube);
        }
        return null;
    }
    return findVideo(parseTrack(information.title, information.artist), information.duration);
};

let speed = 1, preservePitch = false;

const media = new Set();

const tune = item => {
    const rate = currentSpeed();
    if (item.playbackRate !== rate) item.playbackRate = rate;
    item.preservesPitch = item.mozPreservesPitch = item.webkitPreservesPitch = settings.speed && preservePitch;
};

const adopt = item => {
    if (media.has(item)) return;
    media.add(item); tune(item);
    item.addEventListener('ratechange', () => tune(item));
    item.addEventListener('loadedmetadata', () => tune(item));
    item.addEventListener('play', startLoop);
    item.addEventListener('playing', startLoop);
    item.addEventListener('pause', syncNow);
    item.addEventListener('seeked', syncNow);
};

const nativePlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function (...parameters) { adopt(this); return nativePlay.apply(this, parameters); };

const activeAudio = () => {
    let fallback = null;
    for (const item of media) { if (!item.paused && !item.ended) return item; fallback = item; }
    return fallback;
};

const cache = new Map();

let current = null;

const readTrack = () => {
    const link = document.querySelector('.playbackSoundBadge__titleLink');
    if (!link) return null;
    return {
        key: link.href,
        title: (link.getAttribute('title') || link.textContent).trim(),
        artist: (document.querySelector('.playbackSoundBadge__lightLink')?.getAttribute('title') || '').trim(),
        duration: +document.querySelector('.playbackTimeline__progressWrapper')?.getAttribute('aria-valuemax') || 0
    };
};

const load = async (data, name, task, apply) => {
    if (data[name] !== undefined || data[name + 'Busy']) return;
    clearTimeout(data[name + 'Timer']);
    data[name + 'Busy'] = true;
    try {
        data[name] = await task(data.information);
        data[name + 'Tries'] = 0;
    } catch {
        const tries = data[name + 'Tries'] = (data[name + 'Tries'] || 0) + 1;
        data[name + 'Timer'] = setTimeout(() => current === data && load(data, name, task, apply), Math.min(60000, 3000 * 2 ** (tries - 1)));
    }
    data[name + 'Busy'] = false;
    if (current === data && data[name] !== undefined) apply();
};

const loadLyrics = data => load(data, 'lyrics', fetchLyrics, renderLyrics);
const loadVideo = data => load(data, 'video', fetchVideo, updateUI);

let youtubeFrame = null, youtubeID = null, youtubeReady = false, youtubeState = -1, youtubeTime = 0, youtubeRate = 1, lastSeek = 0, lastSync = 0;

const youtubeSend = (functionName, values = []) => youtubeFrame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: functionName, args: values }), '*');
const removePlayer = () => { youtubeFrame?.remove(); youtubeFrame = youtubeID = null; youtubeReady = false; };

const setPlayer = ID => {
    if (youtubeID === ID && youtubeFrame) return;
    removePlayer();
    youtubeID = ID; youtubeState = -1;
    const frame = document.createElement('iframe');
    frame.allow = 'autoplay; encrypted-media';
    frame.src = `https://www.youtube-nocookie.com/embed/${ID}?enablejsapi=1&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&loop=1&playlist=${ID}&origin=${encodeURIComponent(location.origin)}`;
    frame.onload = () => {
        let tries = 0;
        const timer = setInterval(() => {
            if (youtubeFrame !== frame || youtubeReady || ++tries > 20) return clearInterval(timer);
            frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', ID: 'esc', channel: 'widget' }), '*');
        }, 500);
    };
    videoHost.append(frame);
    youtubeFrame = frame;
};

addEventListener('message', event => {
    if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(event.origin) || event.source !== youtubeFrame?.contentWindow) return;
    let data; try { data = JSON.parse(event.data); } catch { return; }
    if (!['onReady', 'initialDelivery', 'infoDelivery'].includes(data.event)) return;
    if (!youtubeReady) { youtubeReady = true; youtubeSend('mute'); youtubeSend('playVideo'); }
    const information = data.info || {};
    if (typeof information.currentTime === 'number') youtubeTime = information.currentTime;
    if (typeof information.playerState === 'number') youtubeState = information.playerState;
});

const syncVideo = (audio, now, force) => {
    if (!youtubeReady || (!force && now - lastSync < 500)) return;
    lastSync = now;
    if (audio.paused) { if (youtubeState === 1) youtubeSend('pauseVideo'); return; }
    if (youtubeState !== 1 && youtubeState !== 3) youtubeSend('playVideo');
    const rate = Math.min(2, Math.max(.25, Math.round(currentSpeed() * 4) / 4));
    if (rate !== youtubeRate) { youtubeRate = rate; youtubeSend('setPlaybackRate', [rate]); }
    if (Math.abs(youtubeTime - audio.currentTime) > 1.5 && now - lastSeek > 2000) { lastSeek = now; youtubeSend('seekTo', [Math.max(0, audio.currentTime), true]); }
};

let nodes = [], wordNodes = [], activeLine = -2, pauseScroll = 0;

const findLine = (lines, time) => {
    let low = 0, high = lines.length - 1, result = -1;
    while (low <= high) { const mid = (low + high) >> 1; if (lines[mid].time <= time) { result = mid; low = mid + 1; } else high = mid - 1; }
    return result;
};

const paintWords = (index, time) => {
    const words = wordNodes[index];
    if (!words) return;
    for (const word of words) {
        const progress = time <= word.start ? 0 : time >= word.end ? 1 : (time - word.start) / (word.end - word.start);
        const value = Math.round(progress * 100) / 100;
        if (value !== word.value) { word.value = value; word.element.style.setProperty('--p', value); }
    }
};

const syncLyrics = time => {
    const index = findLine(current.lyrics.lines, time + .15);
    if (index !== activeLine) {
        nodes[activeLine]?.classList.remove('active');
        nodes[activeLine - 1]?.classList.remove('near');
        nodes[activeLine + 1]?.classList.remove('near');
        activeLine = index;
        nodes[index - 1]?.classList.add('near');
        nodes[index + 1]?.classList.add('near');
        const target = nodes[index];
        if (target) target.classList.add('active');
        if (Date.now() >= pauseScroll) {
            scroll.scrollTo({ top: target ? target.offsetTop - scroll.clientHeight * .38 + target.offsetHeight / 2 : 0, behavior: 'smooth' });
        }
    }
    paintWords(index, time);
};

const renderLyrics = () => {
    const data = current?.lyrics;
    box.textContent = ''; nodes = []; wordNodes = []; activeLine = -2;
    scroll.classList.toggle('plain', data?.synced === false);
    if (data) {
        const fragment = document.createDocumentFragment();
        data.lines.forEach((line, index) => {
            const item = document.createElement('div');
            item.className = 'lyrics-line'; item.dataset.index = index;
            if (line.words) {
                wordNodes[index] = line.words.map(word => {
                    const element = document.createElement('span');
                    element.className = 'lyrics-word';
                    element.textContent = word.text;
                    item.append(element);
                    return { element, start: word.start, end: word.end, value: -1 };
                });
            } else {
                item.textContent = line.text || (data.synced ? '\u266a' : '');
            }
            fragment.append(item); nodes.push(item);
        });
        box.append(fragment);
        scroll.scrollTop = 0;
    }
    updateUI();
    syncNow();
};

box.addEventListener('click', event => {
    const item = event.target.closest('.lyrics-line'), audio = activeAudio();
    if (item && audio && current?.lyrics?.synced) audio.currentTime = current.lyrics.lines[+item.dataset.index].time;
});

['wheel', 'touchmove'].forEach(type => scroll.addEventListener(type, () => { pauseScroll = Date.now() + 3000; }, { passive: true }));
const updateUI = () => {
    root.classList.toggle('lyrics-on', settings.lyrics && !!current?.lyrics?.lines.length);
    const ID = settings.video ? current?.video : null;
    if (ID) setPlayer(ID); else removePlayer();
    root.classList.toggle('video-background-on', !!ID);
    startLoop();
};

let looping = false;
const needsSync = () => !!current && ((settings.lyrics && current.lyrics?.synced) || !!youtubeID);
function tick(now) {
    const audio = activeAudio();
    if (!audio || audio.paused || !needsSync()) { looping = false; return; }
    if (current.lyrics?.synced) syncLyrics(audio.currentTime);
    syncVideo(audio, now);
    requestAnimationFrame(tick);
}

function startLoop() { if (!looping && needsSync()) { looping = true; requestAnimationFrame(tick); } }
function syncNow() {
    const audio = activeAudio();
    if (!audio || !current) return;
    if (current.lyrics?.synced) syncLyrics(audio.currentTime);
    syncVideo(audio, performance.now(), true);
}

const accentSolid = ['--special-color', '--font-special-color', '--button-special-background-color', '--button-secondary-selected-font-color', '--button-secondary-selected-active-font-color', '--button-tertiary-selected-font-color', '--button-tertiary-selected-active-font-color', '--toggle-on-body-color', '--toggle-on-body-hover-color', '--checkbox-checked-background-color', '--checkbox-checked-border-color'];
const accentSoft = ['--button-secondary-selected-hover-font-color', '--button-tertiary-selected-hover-font-color'];
const accentStyle = addStyle('');
const declare = (names, value) => names.map(name => `${name}:${value}!important`).join(';');

const applyAccent = rgb => {
    if (!rgb || !settings.accent) { accentStyle.textContent = ''; return; }
    const color = rgb.join(',');
    accentStyle.textContent = `:root,.theme-dark,.theme-light{${declare(accentSolid, `rgb(${color})`)};${declare(accentSoft, `rgba(${color},.4)`)};--special-rgb:${color}!important}`;
};

const getArtLink = () => {
    const art = document.querySelector('.playControls .playbackSoundBadge__avatar span') || document.querySelector('.playbackSoundBadge .sc-artwork');
    const item = art?.getAttribute('style');
    const link = item?.replace(/&quot;/g, '"').match(/https?:\/\/[^"')\s]+/)?.[0];
    return link ? link.replace(/-t\d+x\d+/, '-t200x200') : null;
};

const pickColor = link => new Promise(resolve => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        try {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0, 32, 32);
            const pixels = context.getImageData(0, 0, 32, 32).data, buckets = {};
            for (let index = 0; index < pixels.length; index += 4) {
                const red = pixels[index], green = pixels[index + 1], blue = pixels[index + 2], maximum = Math.max(red, green, blue), minimum = Math.min(red, green, blue);
                const lightness = (maximum + minimum) / 510;
                const saturation = maximum === minimum ? 0 : (maximum - minimum) / (255 - Math.abs(maximum + minimum - 255));
                const weight = saturation * (1 - Math.abs(2 * lightness - 1));
                if (weight < .05) continue;
                const item = buckets[(red >> 5) + ',' + (green >> 5) + ',' + (blue >> 5)] ||= { weight: 0, red: 0, green: 0, blue: 0 };
                item.weight += weight; item.red += red * weight; item.green += green * weight; item.blue += blue * weight;
            }
            const best = Object.values(buckets).sort((first, second) => second.weight - first.weight)[0];
            if (!best) return resolve(null);
            const rgb = [best.red, best.green, best.blue].map(value => value / best.weight);
            const boost = Math.max(1, 150 / Math.max(...rgb));
            resolve(rgb.map(value => Math.min(255, Math.round(value * boost))));
        } catch { resolve(null); }
    };
    image.onerror = () => resolve(null);
    image.src = link + (link.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
});

let settleTimer;

const checkTrack = () => {
    const information = readTrack();
    if (!information || current?.key === information.key) return;
    let data = cache.get(information.key);
    if (!data) cache.set(information.key, data = { key: information.key, information });
    current = data;
    renderLyrics();
    if (data.accent !== undefined) applyAccent(data.accent);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(async () => {
        if (current !== data) return;
        data.information.duration = readTrack()?.duration || data.information.duration;
        if (settings.lyrics) loadLyrics(data);
        if (settings.video) loadVideo(data);
        data.art ||= getArtLink();
        if (data.accent === undefined && data.art) {
            data.accent = await pickColor(data.art);
            if (current === data) applyAccent(data.accent);
        }
    }, 800);
};

addEventListener('online', () => { if (current) { loadLyrics(current); loadVideo(current); } });

let control = null;

const ensureSpeedControl = () => {
    if (control?.isConnected) return;
    const volume = document.querySelector('.playControls__volume');
    if (!volume) return;
    control = document.createElement('div');
    control.className = 'speed';
    control.innerHTML = '<button>x1.00</button><div class="speed__p"><div class="speed__slider" role="slider" aria-valuemin="0.5" aria-valuemax="2" aria-label="Speed"><div class="speed__bg"></div><div class="speed__fill"></div><div class="speed__handle"></div></div><label class="checkbox sc-checkbox"><input type="checkbox" class="sc-checkbox-input sc-visuallyhidden"><div class="sc-checkbox-check" style="margin-left:4px"><div><svg class="sc-checkbox-checkmark" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M11.9697 3.96967L13.0304 5.03033L6.50006 11.5607L2.96973 8.03033L4.03039 6.96967L6.50006 9.43934L11.9697 3.96967Z"></path></svg></div></div><span class="sc-checkbox-label">Preserve pitch</span></label></div>';
    volume.before(control);
    const item = control, query = selector => item.querySelector(selector), slider = query('.speed__slider'), checkbox = query('input'), label = query('button');
    const setSpeed = value => {
        speed = Math.round(Math.min(2, Math.max(.5, value)) * 100) / 100;
        const percent = (speed - .5) / 1.5 * 100 + '%';
        query('.speed__fill').style.width = percent;
        query('.speed__handle').style.left = percent;
        label.textContent = 'x' + speed.toFixed(2);
        slider.setAttribute('aria-valuenow', speed);
        media.forEach(tune);
    };
    const moveSlider = event => { const rect = slider.getBoundingClientRect(); setSpeed(.5 + 1.5 * (event.clientX - rect.left) / rect.width); };
    slider.onpointerdown = event => { slider.setPointerCapture(event.pointerId); moveSlider(event); slider.onpointermove = moveSlider; };
    slider.onpointerup = () => { slider.onpointermove = null; };
    label.onclick = () => item.classList.toggle('open');
    checkbox.checked = preservePitch;
    checkbox.onchange = () => { preservePitch = checkbox.checked; media.forEach(tune); };
    setSpeed(speed);
};

document.addEventListener('click', event => { if (control?.classList.contains('open') && !control.contains(event.target)) control.classList.remove('open'); });

let lastText = '', lastAt = 0, presence = null;

const pushPresence = data => {
    const text = JSON.stringify(data), now = Date.now();
    if (text === lastText && (data === null || now - lastAt < 15000)) return;
    lastText = text; lastAt = now;
    window.postMessage({ source: 'esc-presence', data }, location.origin);
};

const presenceTick = () => {
    const audio = activeAudio();
    if (!current || !audio || audio.paused || audio.ended) return pushPresence(null);
    const information = current.information, rate = currentSpeed();
    const start = Math.round(Date.now() - audio.currentTime / rate * 1000);
    const art = current.art?.replace('-t200x200', '-t500x500');
    if (!presence || presence.key !== information.key || presence.art !== art || Math.abs(start - presence.start) > 2500) {
        const duration = information.duration || (Number.isFinite(audio.duration) ? audio.duration : 0);
        presence = {
            key: information.key, url: information.key,
            title: information.title,
            artist: information.artist,
            art, start, end: duration ? Math.round(start + duration / rate * 1000) : 0
        };
    }
    pushPresence(presence);
};

addEventListener('pagehide', () => pushPresence(null));

const update = () => {
    ensureSpeedControl();
    downloadPass();
    document.querySelectorAll('audio').forEach(adopt);
    document.querySelectorAll('.moreButton:not(.deleted)').forEach(menu => {
        menu.classList.add('deleted');
        const lists = menu.querySelectorAll('.headerMenu__list');
        lists[0]?.classList.add('esc-bloat'); lists[1]?.classList.add('esc-bloat');
    });
};

const applyLook = () => {
    root.style.setProperty('--esc-blur', settings.blur + 'px');
    root.style.setProperty('--esc-bright', settings.brightness / 100);
};

const applySettings = () => {
    root.classList.toggle('esc-no-speed', !settings.speed);
    root.classList.toggle('esc-debloat', settings.debloat);
    applyLook();
    media.forEach(tune);
    if (current) {
        applyAccent(current.accent);
        if (settings.lyrics) loadLyrics(current);
        if (settings.video) loadVideo(current);
    }
    updateUI();
    downloadPass();
    syncNow();
};

const schema = [
    ['lyrics', 'Lyrics'],
['video', 'Video'],
['blur', 'Video blur', 0, 20, .5, 'px'],
['brightness', 'Video brightness', 20, 100, 1, '%'],
['speed', 'Speed changer'],
['download', 'Download button on every song'],
['debloat', 'Remove bloat buttons'],
['accent', 'Cover color to accent color']
];

const gear = document.createElement('div');

gear.id = 'esc-gear';
gear.innerHTML = '<button title="Settings">\u26ED</button><div class="esc-panel"></div>';

const panel = gear.querySelector('.esc-panel');
const refreshers = [];

for (const [key, label, min, max, step, unit] of schema) {
    const row = document.createElement('label');
    if (min === undefined) {
        row.className = 'esc-row';
        row.innerHTML = `<span>${label}</span><input type="checkbox">`;
        const input = row.querySelector('input');
        input.onchange = () => { settings[key] = input.checked; saveSettings(); applySettings(); };
        refreshers.push(() => { input.checked = settings[key]; });
    } else {
        row.className = 'esc-slide';
        row.innerHTML = `<span>${label}<b></b></span><input type="range" min="${min}" max="${max}" step="${step}">`;
        const input = row.querySelector('input'), value = row.querySelector('b');
        input.oninput = () => { settings[key] = +input.value; value.textContent = settings[key] + unit; saveSettings(); applyLook(); };
        refreshers.push(() => { input.value = settings[key]; value.textContent = settings[key] + unit; });
    }
    panel.append(row);
}

refreshers.forEach(refresh => refresh());

const reset = document.createElement('button');

reset.className = 'esc-reset';
reset.textContent = 'Reset settings';

reset.onclick = () => {
    Object.assign(settings, defaults);
    saveSettings();
    refreshers.forEach(refresh => refresh());
    applySettings();
};

panel.append(reset);
const note = document.createElement('p');
note.className = 'esc-note';
note.innerHTML = 'If you want to show the track in your Discord activity follow this <a href="https://github.com/77Delta/Enhanced-SoundCloud#how-to-set-up-discord-rpc" target="_blank" rel="noopener noreferrer">guide</a>.<br><br>You can support this project by <a href="https://github.com/sponsors/77Delta" target="_blank" rel="noopener noreferrer">donating me</a>.';
panel.append(note);
gear.querySelector('button').onclick = () => gear.classList.toggle('open');

document.addEventListener('click', event => { if (!gear.contains(event.target)) gear.classList.remove('open'); });
root.append(gear);
applySettings();
setInterval(checkTrack, 500);
setInterval(presenceTick, 1000);
observe(update);
})();
