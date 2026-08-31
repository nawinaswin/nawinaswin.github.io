const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.id = 'bg-canvas';
document.body.insertBefore(canvas, document.body.firstChild);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const mouse = { x: -1000, y: -1000 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

const spacing = 36;
const dotRadius = 1.1;
const influenceRadius = 200;

function draw(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cols = Math.ceil(canvas.width / spacing) + 1;
  const rows = Math.ceil(canvas.height / spacing) + 1;

  const points = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const baseX = i * spacing;
      const baseY = j * spacing;
      const dx = baseX - mouse.x;
      const dy = baseY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - dist / influenceRadius);
      const wobble = Math.sin(time * 0.0025 + dist * 0.012) * 0.25 + 0.75;
      const strength = influence * influence * 0.45 * wobble;
      const warpX = -dx * strength;
      const warpY = -dy * strength;
      const x = baseX + warpX;
      const y = baseY + warpY;
      const radius = dotRadius + influence * 2.2;
      points.push({ x, y, baseX, baseY, radius, influence });
    }
  }

  ctx.strokeStyle = 'rgba(110, 115, 125, 0.16)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const idx = i * rows + j;
      const p = points[idx];
      if (j < rows - 1) {
        const neighbor = points[i * rows + (j + 1)];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(neighbor.x, neighbor.y);
      }
      if (i < cols - 1) {
        const neighbor = points[(i + 1) * rows + j];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(neighbor.x, neighbor.y);
      }
    }
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(130, 135, 145, 0.6)';
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
