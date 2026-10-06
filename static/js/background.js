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

// Tune the recession beneath panels here. Open space keeps the original grid.
const panelEffect = {
  fade: 0.5,
  falloff: 56,
  displacement: 6,
  weight: 0.65,
  dotShrink: 0.16,
};
const panelElements = Array.from(document.querySelectorAll('main .border'));
let panels = [];
let panelsDirty = true;

function invalidatePanels() {
  panelsDirty = true;
}

window.addEventListener('scroll', invalidatePanels, { passive: true });
window.addEventListener('resize', invalidatePanels);
const panelObserver = new ResizeObserver(invalidatePanels);
panelObserver.observe(document.body);
for (const panel of panelElements) panelObserver.observe(panel);
document.fonts.ready.then(invalidatePanels);

function refreshPanels() {
  // Cache layout reads; scrolling, resizing, and text reflow invalidate the cache.
  panels = panelElements.map((panel) => panel.getBoundingClientRect()).filter((rect) =>
    rect.width >= 140 && rect.height >= 80 &&
    rect.bottom > -panelEffect.falloff && rect.top < canvas.height + panelEffect.falloff &&
    rect.right > -panelEffect.falloff && rect.left < canvas.width + panelEffect.falloff
  );
  panelsDirty = false;
}

function panelDepthAt(x, y) {
  let depth = 0;
  let offsetX = 0;
  let offsetY = 0;
  for (const panel of panels) {
    const dx = Math.max(panel.left - x, 0, x - panel.right);
    const dy = Math.max(panel.top - y, 0, y - panel.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance >= panelEffect.falloff) continue;

    const t = distance / panelEffect.falloff;
    const weight = 1 - t * t * (3 - 2 * t);
    // Nested cards add depth gently instead of multiplying into a dark hole.
    depth += (1 - depth) * weight * panelEffect.weight;
    const centerX = panel.left + panel.width / 2;
    const centerY = panel.top + panel.height / 2;
    offsetX += Math.max(-1, Math.min(1, (centerX - x) / (panel.width / 2))) * weight * panelEffect.displacement;
    offsetY += Math.max(-1, Math.min(1, (centerY - y) / (panel.height / 2))) * weight * panelEffect.displacement;
  }
  return {
    depth,
    offsetX: Math.max(-8, Math.min(8, offsetX)),
    offsetY: Math.max(-8, Math.min(8, offsetY)),
  };
}

function draw(time) {
  if (panelsDirty) refreshPanels();
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
      const pressure = panelDepthAt(baseX, baseY);
      const recession = 1 - pressure.depth * panelEffect.fade;
      const wobble = Math.sin(time * 0.0025 + dist * 0.012) * 0.25 + 0.75;
      const strength = influence * influence * 0.45 * wobble * recession;
      const warpX = -dx * strength;
      const warpY = -dy * strength;
      const x = baseX + warpX + pressure.offsetX;
      const y = baseY + warpY + pressure.offsetY;
      const depth = panelDepthAt(x, y).depth;
      const radius = (dotRadius + influence * 2.2 * recession) * (1 - depth * panelEffect.dotShrink);
      points.push({ x, y, radius, depth });
    }
  }

  ctx.strokeStyle = 'rgba(110, 115, 125, 0.16)';
  ctx.lineWidth = 0.6;
  // Group nearby opacity levels so the connecting lines fade with the dots
  // without issuing a separate canvas stroke for every grid segment.
  const lineBuckets = Array.from({ length: 8 }, () => []);
  function addLine(p, neighbor) {
    const bucket = Math.round((p.depth + neighbor.depth) / 2 * (lineBuckets.length - 1));
    lineBuckets[bucket].push(p, neighbor);
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const idx = i * rows + j;
      const p = points[idx];
      if (j < rows - 1) {
        const neighbor = points[i * rows + (j + 1)];
        addLine(p, neighbor);
      }
      if (i < cols - 1) {
        const neighbor = points[(i + 1) * rows + j];
        addLine(p, neighbor);
      }
    }
  }
  for (let bucket = 0; bucket < lineBuckets.length; bucket++) {
    ctx.globalAlpha = 1 - bucket / (lineBuckets.length - 1) * panelEffect.fade;
    ctx.beginPath();
    const segments = lineBuckets[bucket];
    for (let i = 0; i < segments.length; i += 2) {
      ctx.moveTo(segments[i].x, segments[i].y);
      ctx.lineTo(segments[i + 1].x, segments[i + 1].y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(130, 135, 145, 0.6)';
  for (const p of points) {
    ctx.globalAlpha = 1 - p.depth * panelEffect.fade;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
