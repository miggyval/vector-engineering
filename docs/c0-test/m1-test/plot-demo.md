## Time & Frequency Plotter

Type a function of `t` (use `**` for powers, e.g. `t**2`):

<div id="plotter">
  <div>
    <label>
      f(t) =
      <input
        id="expr-input"
        type="text"
        value="sin(t)"
        autocomplete="off"
      />
    </label>
  </div>

  <div class="plot-controls">
    <label>
      t<sub>min</sub> =
      <input
        id="tmin-input"
        type="number"
        value="-10"
        step="1"
      />
    </label>

    <label>
      t<sub>max</sub> =
      <input
        id="tmax-input"
        type="number"
        value="10"
        step="1"
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
      />
    </label>

    <span id="plot-status"></span>
  </div>

  <div class="plot-results">
    <div>
      <div>
        Time-domain f(t)
      </div>
      <img
        id="time-plot-img"
        alt="Time-domain plot"
      />
    </div>

    <div>
      <div>
        Frequency-domain |F(&omega;)|
      </div>
      <img
        id="freq-plot-img"
        alt="Frequency-domain plot"
      />
    </div>
  </div>
</div>

