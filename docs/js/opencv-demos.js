// ------------------------------------------------------------
// EDGE DEMO
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const demo = document.getElementById("edge-demo");
  if (!demo) return;

  const th1 = document.getElementById("edge-th1");
  const th2 = document.getElementById("edge-th2");
  const th1Val = document.getElementById("edge-th1-val");
  const th2Val = document.getElementById("edge-th2-val");
  const img = document.getElementById("edge-image");

  // Dev: mkdocs serve on :8000, FastAPI on :8001.
  // Production: same origin, nginx proxies /api → FastAPI.
  const API_BASE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8001"
      : "";

  const DEBOUNCE_MS = 120;

  let debounceId = null;
  let controller = null;
  let lastObjectUrl = null;

  async function updateImage() {
    // Abort any in-flight request so a slow old response can't
    // overwrite a newer image (last-write-wins race)
    if (controller) controller.abort();
    controller = new AbortController();

    img.style.opacity = 0.5;

    const url = `${API_BASE}/api/edge-demo?t1=${th1.value}&t2=${th2.value}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
      lastObjectUrl = URL.createObjectURL(blob);
      img.src = lastObjectUrl;
      img.onload = () => {
        img.style.opacity = 1;
      };
    } catch (err) {
      if (err.name === "AbortError") return;
      img.style.opacity = 1;
      img.alt = "Failed to load edge demo image.";
    }
  }

  function onSliderInput() {
    // Labels update instantly; the fetch is debounced
    th1Val.textContent = th1.value;
    th2Val.textContent = th2.value;

    if (debounceId !== null) clearTimeout(debounceId);
    debounceId = setTimeout(updateImage, DEBOUNCE_MS);
  }

  th1.addEventListener("input", onSliderInput);
  th2.addEventListener("input", onSliderInput);

  updateImage();
});
