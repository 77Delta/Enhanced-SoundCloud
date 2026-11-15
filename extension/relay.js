const api = globalThis.browser ?? chrome;

window.addEventListener('message', event => {
    if (event.source !== window || event.data?.source !== 'esc-presence') return;
    try {
        api.runtime.sendMessage({ type: 'esc-presence', data: event.data.data }).catch(() => {});
    } catch {}
});
