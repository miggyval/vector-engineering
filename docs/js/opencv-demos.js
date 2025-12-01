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

  // Same-origin backend (nginx will proxy /api → FastAPI)
  const API_BASE = "";

  async function updateImage() {
    const t1 = th1.value;
    const t2 = th2.value;

    th1Val.textContent = t1;
    th2Val.textContent = t2;

    // Temporary "loading" visual
    img.style.opacity = 0.5;

    // cache-busting _=timestamp so new images always load
    const url = `${API_BASE}/api/edge-demo?t1=${t1}&t2=${t2}&_=${Date.now()}`;
    img.src = url;

    img.onload = () => {
      img.style.opacity = 1;
    };
    img.onerror = () => {
      img.style.opacity = 1;
      img.alt = "Failed to load edge demo image.";
    };
  }

  th1.addEventListener("input", updateImage);
  th2.addEventListener("input", updateImage);

  updateImage();
});

// ------------------------------------------------------------
// PLOT DEMO
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("expr-input");
  const plotImg = document.getElementById("plot-img");
  if (!input || !plotImg) return;

  const API_BASE = "";

  function updatePlot() {
    const expr = encodeURIComponent(input.value);
    plotImg.src = `${API_BASE}/api/plot-func?expr=${expr}&t_min=-10&t_max=10&_=${Date.now()}`;
  }

  input.addEventListener("change", updatePlot);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") updatePlot();
  });

  updatePlot();
});

// ------------------------------------------------------------
// FOURIER PLOT DEMO
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("expr-input-fourier");
  const fourierImg = document.getElementById("fourier-plot-img");
  if (!input || !fourierImg) return;

  const API_BASE = "";

  function updateFourier() {
    const expr = encodeURIComponent(input.value);
    fourierImg.src =
      `${API_BASE}/api/plot-fourier?expr=${expr}&t_min=-10&t_max=10&n=400&theme=default&_=${Date.now()}`;
  }

  input.addEventListener("change", updateFourier);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") updateFourier();
  });

  updateFourier();
});
