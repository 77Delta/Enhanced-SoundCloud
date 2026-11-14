window.addEventListener('message', event => {
    if (event.source !== window || event.data?.source !== 'esc-presence') return;
    try {
        chrome.runtime.sendMessage({ type: 'esc-presence', data: event.data.data }).catch(() => {});
    } catch {}
});
