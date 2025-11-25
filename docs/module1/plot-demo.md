# Function Plotter

Type a function of `t` (use `**` for powers, e.g. `t**2`):

<div id="plotter">
  <label>
    f(t) =
    <input
      id="expr-input"
      type="text"
      value="sin(t)"
      autocomplete="off"
      style="width: 250px;"
    />
  </label>

  <label style="margin-left: 1rem;">
    t_min
    <input id="tmin-input" type="number" value="-10" step="1" style="width: 80px;" />
  </label>

  <label style="margin-left: 0.5rem;">
    t_max
    <input id="tmax-input" type="number" value="10" step="1" style="width: 80px;" />
  </label>

  <div id="plot-status" style="margin-top: 0.5rem; font-size: 0.9em; color: #666;"></div>

  <div style="margin-top: 1rem;">
    <img
    id="plot-img"
    alt="Function plot"
    style="width: 600px; max-width: 100%; border: 1px solid #ccc;"
    />
  </div>
</div>

<script>
  (function () {
    const exprInput = document.getElementById("expr-input");
    const tminInput = document.getElementById("tmin-input");
    const tmaxInput = document.getElementById("tmax-input");
    const img = document.getElementById("plot-img");
    const statusEl = document.getElementById("plot-status");

    const BASE_URL = "http://127.0.0.1:8001/api/plot-func";

    let debounceId = null;
    let lastRequestId = 0;
    let lastObjectUrl = null;

    function setStatus(msg) {
      statusEl.textContent = msg || "";
    }

    function showPlotFromBlob(blob, requestId) {
      if (requestId !== lastRequestId) return; // stale response

      if (lastObjectUrl) {
        URL.revokeObjectURL(lastObjectUrl);
      }
      const url = URL.createObjectURL(blob);
      lastObjectUrl = url;

      img.src = url;
    }

    async function updatePlot() {
      const expr = exprInput.value.trim();
      const tmin = tminInput.value;
      const tmax = tmaxInput.value;

      const requestId = ++lastRequestId;

      const params = new URLSearchParams({
        expr: expr || "0",  // if empty, just plot 0
        t_min: tmin,
        t_max: tmax,
      });

      const url = BASE_URL + "?" + params.toString();

      try {
        // no "Plotting..." here

        const res = await fetch(url);
        if (requestId !== lastRequestId) return; // stale

        if (!res.ok) {
          setStatus("Server error");
          return;
        }

        const blob = await res.blob();
        showPlotFromBlob(blob, requestId);
        setStatus("");
      } catch (err) {
        if (requestId !== lastRequestId) return;
        setStatus("Error contacting server");
      }
    }

    function scheduleUpdate() {
      if (debounceId !== null) {
        clearTimeout(debounceId);
      }
      debounceId = setTimeout(updatePlot, 250);
    }

    exprInput.addEventListener("input", scheduleUpdate);
    tminInput.addEventListener("input", scheduleUpdate);
    tmaxInput.addEventListener("input", scheduleUpdate);

    // Initial plot
    scheduleUpdate();
  })();
</script>
