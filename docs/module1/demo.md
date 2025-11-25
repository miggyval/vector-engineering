# Module 1: Demo

This page will eventually host an interactive OpenCV demo.

For now, it's just a stub page.

# Module 1: Edge Detection Demo

In this demo, you can explore how the Canny edge detector responds
to different threshold values.

Use the sliders to adjust the thresholds and see the effect in real time.

<div id="edge-demo" class="edge-demo">
  <div class="controls">
    <label>
      Threshold 1
      <input type="range" min="0" max="255" value="50" id="edge-th1">
      <span id="edge-th1-val">50</span>
    </label>

    <label>
      Threshold 2
      <input type="range" min="0" max="255" value="150" id="edge-th2">
      <span id="edge-th2-val">150</span>
    </label>
  </div>

  <div class="preview">
    <img id="edge-image" alt="Edge demo result will appear here" />
  </div>
</div>


!!! note "How this works under the hood"
    The browser sends the chosen thresholds to a small Python/OpenCV
    backend (via FastAPI). The backend runs Canny edge detection on a
    fixed image and returns the result as a PNG, which is then displayed here.
