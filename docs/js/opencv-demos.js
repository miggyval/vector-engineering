document.addEventListener('DOMContentLoaded', () => {
  const host = document.getElementById('edge-demo'); if (!host) return;
  const first = document.getElementById('edge-th1'), second = document.getElementById('edge-th2');
  const status = document.createElement('p'); host.append(status);
  const client = window.VEDemo(host,status,update);
  function update() {
    client.run([{path:'/api/edge-demo',params:{t1:first.value,t2:second.value},img:document.getElementById('edge-image')}]);
  }
  [first,second].forEach(input => input.addEventListener('input',() => {
    document.getElementById('edge-th1-val').textContent = first.value;
    document.getElementById('edge-th2-val').textContent = second.value;
    client.schedule();
  }));
  update();
});
