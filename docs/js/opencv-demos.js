document.addEventListener("DOMContentLoaded", () => {
  const demo = document.getElementById("edge-demo");
  if (!demo) return;

  const th1 = document.getElementById("edge-th1");
  const th2 = document.getElementById("edge-th2");
  const th1Val = document.getElementById("edge-th1-val");
  const th2Val = document.getElementById("edge-th2-val");
  const img = document.getElementById("edge-image");

  // Base URL of the API (for dev: localhost:8001)
  const API_BASE = "http://127.0.0.1:8001";

  async function updateImage() {
    const t1 = th1.value;
    const t2 = th2.value;

    th1Val.textContent = t1;
    th2Val.textContent = t2;

    // Show a temporary "loading" state
    img.style.opacity = 0.5;

    // Add cache-buster param (_=timestamp) so the browser doesn’t reuse old images
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

  // Update on slider move
  th1.addEventListener("input", updateImage);
  th2.addEventListener("input", updateImage);

  // Initial load
  updateImage();
});

const input = document.getElementById("expr-input");
const img = document.getElementById("plot-img");

function updatePlot() {
  const expr = encodeURIComponent(input.value);
  img.src = `http://127.0.0.1:8001/api/plot-func?expr=${expr}&x_min=-10&x_max=10`;
}

input.addEventListener("change", updatePlot);
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") updatePlot();
});

updatePlot();