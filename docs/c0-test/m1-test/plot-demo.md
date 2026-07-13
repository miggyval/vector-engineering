## Time & Frequency Plotter

Type a function of `t` (use `**` for powers, e.g. `t**2`):

<div id="plotter">
  <div style="margin-bottom: 0.75rem;">
    <label>
      f(t) =
      <input
        id="expr-input"
        type="text"
        value="sin(t)"
        autocomplete="off"
        style="width: 260px;"
      />
    </label>
  </div>

  <div
    style="
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    "
  >
    <label>
      t<sub>min</sub> =
      <input
        id="tmin-input"
        type="number"
        value="-10"
        step="1"
        style="width: 80px;"
      />
    </label>

    <label>
      t<sub>max</sub> =
      <input
        id="tmax-input"
        type="number"
        value="10"
        step="1"
        style="width: 80px;"
      />
    </label>

    <label>
      Samples n =
      <input
        id="n-input"
        type="number"
        value="400"
        min="10"
        max="5000"
        step="10"
        style="width: 90px;"
      />
    </label>

    <span id="plot-status" style="font-size: 0.85rem; opacity: 0.8;"></span>
  </div>

  <div
    style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: flex-start;
    "
  >
    <div>
      <div style="margin-bottom: 0.25rem; font-weight: 500;">
        Time-domain f(t)
      </div>
      <img
        id="time-plot-img"
        alt="Time-domain plot"
        style="
          max-width: 100%;
          width: 600px;
          border-radius: 10px;
          border: 1px solid rgba(81, 36, 122, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        "
      />
    </div>

    <div>
      <div style="margin-bottom: 0.25rem; font-weight: 500;">
        Frequency-domain |F(&omega;)|
      </div>
      <img
        id="freq-plot-img"
        alt="Frequency-domain plot"
        style="
          max-width: 100%;
          width: 600px;
          border-radius: 10px;
          border: 1px solid rgba(81, 36, 122, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        "
      />
    </div>
  </div>
</div>

<script>
  (function () {
    const exprInput = document.getElementById("expr-input");
    const tminInput = document.getElementById("tmin-input");
    const tmaxInput = document.getElementById("tmax-input");
    const nInput = document.getElementById("n-input");
    const timeImg = document.getElementById("time-plot-img");
    const freqImg = document.getElementById("freq-plot-img");
    const statusEl = document.getElementById("plot-status");
    const API_BASE =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8001"   // FastAPI dev server
        : "";                       // production: same origin, Nginx handles /api

    const TIME_URL = `${API_BASE}/api/plot-func`;
    const FREQ_URL = `${API_BASE}/api/plot-fourier`;


    let debounceId = null;
    let lastRequestId = 0;
    const lastObjectUrls = { time: null, freq: null };

    function setStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
    }

    function showPlotFromBlob(blob, requestId, imgEl, which) {
      if (requestId !== lastRequestId) return; // stale response

      if (lastObjectUrls[which]) {
        URL.revokeObjectURL(lastObjectUrls[which]);
      }
      const url = URL.createObjectURL(blob);
      lastObjectUrls[which] = url;
      imgEl.src = url;
    }

    function currentScheme() {
      const raw =
        document.body.getAttribute("data-md-color-scheme") ||
        "default";
      return raw === "slate" ? "slate" : "default";
    }

    async function updatePlots() {
      const expr = (exprInput.value || "").trim();
      const tmin = parseFloat(tminInput.value);
      const tmax = parseFloat(tmaxInput.value);
      const n = nInput ? parseInt(nInput.value, 10) : 400;
      const scheme = currentScheme();

      if (Number.isNaN(tmin) || Number.isNaN(tmax)) {
        setStatus("Enter numeric t limits");
        return;
      }

      const requestId = ++lastRequestId;
      setStatus("Plotting...");

      const params = new URLSearchParams({
        expr: expr || "0",
        t_min: tmin,
        t_max: tmax,
        n: n,
        theme: scheme,
      });

      const timeUrl = TIME_URL + "?" + params.toString();
      const freqUrl = FREQ_URL + "?" + params.toString();

      async function fetchAndShow(url, imgEl, which) {
        try {
          const res = await fetch(url);
          if (requestId !== lastRequestId) return; // stale
          if (!res.ok) {
            setStatus("Server error");
            return;
          }
          const blob = await res.blob();
          showPlotFromBlob(blob, requestId, imgEl, which);
        } catch (err) {
          if (requestId !== lastRequestId) return;
          setStatus("Error contacting server");
        }
      }

      await Promise.all([
        fetchAndShow(timeUrl, timeImg, "time"),
        fetchAndShow(freqUrl, freqImg, "freq"),
      ]);

      if (requestId === lastRequestId) {
        setStatus("");
      }
    }

    function scheduleUpdate() {
      if (debounceId !== null) {
        clearTimeout(debounceId);
      }
      debounceId = setTimeout(updatePlots, 250);
    }

    // Replot whenever MkDocs Material changes the color scheme
    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-md-color-scheme") {
          scheduleUpdate();
          break;
        }
      }
    });
    themeObserver.observe(document.body, { attributes: true });

    exprInput.addEventListener("input", scheduleUpdate);
    tminInput.addEventListener("input", scheduleUpdate);
    tmaxInput.addEventListener("input", scheduleUpdate);
    if (nInput) {
      nInput.addEventListener("input", scheduleUpdate);
    }

    // Initial plots
    scheduleUpdate();
  })();
</script>
