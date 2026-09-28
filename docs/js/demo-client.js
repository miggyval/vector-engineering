/* Shared optional API client. Last successful images survive failed updates. */
(() => {
  window.VEDemo = function (host, status, update) {
    const base = window.VE_SITE?.apiBaseUrl;
    status.setAttribute('role','status');
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Retry';
    retry.hidden = true; status.after(retry);
    let controller, sequence = 0, timer;
    const urls = new Map();
    async function run(requests) {
      controller?.abort(); const id = ++sequence;
      if (!base) { status.textContent = 'This demo is unavailable because no API is configured.'; return; }
      controller = new AbortController();
      const signal = controller.signal;
      const timeout = setTimeout(() => controller?.signal === signal && controller.abort(),12000);
      status.textContent = 'Loading…'; retry.hidden = true;
      try {
        const results = await Promise.all(requests.map(async ({path,params,img}) => {
          const response = await fetch(base + path + '?' + new URLSearchParams(params),{signal});
          if (!response.ok) {
            let message = `Demo unavailable (HTTP ${response.status}).`;
            try { const body = await response.json(); if (typeof body.detail === 'string') message = body.detail; } catch {}
            throw Error(message);
          }
          return {img,blob:await response.blob()};
        }));
        if (id !== sequence) return;
        results.forEach(({img,blob}) => {
          if (urls.has(img)) URL.revokeObjectURL(urls.get(img));
          const url = URL.createObjectURL(blob); urls.set(img,url); img.src = url;
        });
        status.textContent = 'Updated.';
      } catch (error) {
        if (id !== sequence) return;
        status.textContent = (error.name === 'AbortError' ? 'Request timed out.' : error.message) + ' Previous results, if any, are unchanged.';
        retry.hidden = false;
      } finally { clearTimeout(timeout); }
    }
    function schedule() {
      clearTimeout(timer); controller?.abort(); ++sequence;
      timer = setTimeout(update,250);
    }
    retry.addEventListener('click',update);
    window.addEventListener('pagehide',() => { clearTimeout(timer); ++sequence; controller?.abort(); urls.forEach(url => URL.revokeObjectURL(url)); });
    return {run,schedule,cancel() { ++sequence; controller?.abort(); }, available:!!base};
  };
})();
