# Module 1: Overview

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>2D Rotation About a Point</title>
  <style>
    body {
      margin: 0;
      background: #0f1220;
      color: #eaeaf0;
      font-family: system-ui, sans-serif;
      display: flex;
      height: 200vh;
    }
    #ui {
      width: 500px;
      padding: 16px;
      border-right: 1px solid #2a2e55;
      background: #121633;
    }
    canvas {
      flex: 1;
      display: block;
      background: #0b0e1a;
      cursor: crosshair;
    }
    h1 { font-size: 16px; margin-top: 0; }
    p { font-size: 13px; line-height: 1.4; opacity: 0.85; }
  </style>
</head>
<body>

<div id="ui">
  <h1>2D Rotation (Pick the Axis)</h1>
  <p>
    Click anywhere in the canvas to choose the
    <b>axis of rotation</b>.
  </p>
  <p>
    The square rotates rigidly about that point.
    This is a 2D analogue of a screw motion with zero pitch.
  </p>
</div>

<canvas id="c"></canvas>

<script>
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resize);
resize();

// Rigid body: a square
const body = {
  center: { x: 300, y: 200 },
  size: 80,
  theta: 0
};

// Axis of rotation (chosen by click)
let axis = { x: 300, y: 200 };

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  axis.x = e.clientX - rect.left;
  axis.y = e.clientY - rect.top;
});

function rotatePoint(p, c, theta) {
  const x = p.x - c.x;
  const y = p.y - c.y;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: c.x + cos * x - sin * y,
    y: c.y + sin * x + cos * y
  };
}

function drawSquare() {
  const s = body.size / 2;
  const corners = [
    { x: body.center.x - s, y: body.center.y - s },
    { x: body.center.x + s, y: body.center.y - s },
    { x: body.center.x + s, y: body.center.y + s },
    { x: body.center.x - s, y: body.center.y + s }
  ].map(p => rotatePoint(p, axis, body.theta));

  ctx.beginPath();
  corners.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.strokeStyle = "#66ccff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawAxis() {
  ctx.beginPath();
  ctx.arc(axis.x, axis.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ff6666";
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  body.theta += 0.01;

  drawSquare();
  drawAxis();

  requestAnimationFrame(animate);
}

animate();
</script>
</body>
</html>
