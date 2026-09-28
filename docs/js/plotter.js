document.addEventListener('DOMContentLoaded', () => {
  const host = document.getElementById('plotter'); if (!host) return;
  const expr = document.getElementById('expr-input');
  const min = document.getElementById('tmin-input');
  const max = document.getElementById('tmax-input');
  const samples = document.getElementById('n-input');
  const status = document.getElementById('plot-status');
  const client = window.VEDemo(host,status,update);
  function update() {
    if (!client.available) { client.run([]); return; }
    const tmin = Number(min.value), tmax = Number(max.value), n = Number(samples.value);
    if (!min.value || !max.value || !samples.value || !Number.isFinite(tmin) || !Number.isFinite(tmax) || tmin >= tmax || !Number.isInteger(n) || n < 10 || n > 5000 || !expr.value.trim()) {
      client.cancel(); status.textContent = 'Enter a function, increasing numeric limits, and 10–5000 samples.'; return;
    }
    const params = {expr:expr.value.trim(),t_min:tmin,t_max:tmax,n,theme:document.body.dataset.mdColorScheme === 'slate' ? 'slate' : 'default'};
    client.run([
      {path:'/api/plot-func',params,img:document.getElementById('time-plot-img')},
      {path:'/api/plot-fourier',params,img:document.getElementById('freq-plot-img')}
    ]);
  }
  [expr,min,max,samples].forEach(input => input.addEventListener('input',client.schedule));
  const observer = new MutationObserver(client.schedule);
  observer.observe(document.body,{attributes:true,attributeFilter:['data-md-color-scheme']});
  window.addEventListener('pagehide',() => observer.disconnect());
  update();
});
