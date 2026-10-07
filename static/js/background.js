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

const gravitationalWave = {
  interval: 20000,
  duration: 7200,
  initialDelay: 1200,
  amplitude: 14,
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const noWaveOffset = { x: 0, y: 0 };
let animationStart = null;

function waveStateAt(time) {
  if (reducedMotion.matches || animationStart === null) return null;
  const elapsed = time - animationStart - gravitationalWave.initialDelay;
  if (elapsed < 0) return null;
  const phase = elapsed % gravitationalWave.interval;
  if (phase >= gravitationalWave.duration) return null;

  // A source just beyond the left edge produces a gently curved wavefront.
  const sourceX = -Math.max(canvas.width * 0.6, canvas.height * 0.8, 360);
  const sourceY = canvas.height * 0.5;
  const width = Math.max(160, Math.min(260, canvas.width * 0.22));
  const nearest = -sourceX;
  const farthest = Math.hypot(canvas.width - sourceX, canvas.height * 0.5);
  return {
    sourceX,
    sourceY,
    width,
    wavelength: width * 0.9,
    radius: nearest - width + (farthest - nearest + width * 2) * phase / gravitationalWave.duration,
  };
}

function waveOffsetAt(x, y, wave) {
  const dx = x - wave.sourceX;
  const dy = y - wave.sourceY;
  const distance = Math.hypot(dx, dy);
  const offset = distance - wave.radius;
  const normalized = offset / wave.width;
  if (Math.abs(normalized) >= 1 || distance === 0) return noWaveOffset;

  // Stretch and compress the mesh in a short packet, smoothly returning it
  // to its original shape before the next pass. No bright line is overlaid.
  const envelope = (1 - normalized * normalized) ** 2;
  const ripple = Math.sin(offset / wave.wavelength * Math.PI * 2) * envelope * gravitationalWave.amplitude;
  return { x: dx / distance * ripple, y: dy / distance * ripple };
}

// Curvature reaches five grid cells beyond a card; fading stays close to its edge.
const panelEffect = {
  fade: 0.5,
  fadeFalloff: 56,
  reach: spacing * 5,
  displacement: 22,
  maxDisplacement: 32,
  weight: 0.65,
  dotShrink: 0.16,
};
const contentMass = {
  base: 0.7,
  max: 1.5,
  charactersPerUnit: 120,
  mediaKilobytesPerUnit: 64,
  // Used only when media has no build-time size or explicit data-gravity-bytes.
  estimatedBytes: { IMG: 64 * 1024, VIDEO: 2048 * 1024, AUDIO: 512 * 1024, IFRAME: 2048 * 1024 },
};
const main = document.querySelector('main');
const mediaSizes = JSON.parse(document.getElementById('gravity-media-sizes')?.textContent || '{}');
let panelSources = [];
let panels = [];
let panelsDirty = true;
let massDirty = true;
const observedElements = new Set();

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function smoothFalloff(distance, reach) {
  const t = clamp(distance / reach, 0, 1);
  return 1 - t * t * (3 - 2 * t);
}

function contentStyle(element, styles) {
  if (!styles.has(element)) styles.set(element, getComputedStyle(element));
  return styles.get(element);
}

function isVisibleStyle(style) {
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse';
}

function mediaBytes(element) {
  const supplied = element.getAttribute('data-gravity-bytes');
  if (supplied !== null && supplied.trim() !== '' && Number.isFinite(Number(supplied)) && Number(supplied) >= 0) {
    return Number(supplied);
  }
  const source = element.currentSrc || element.getAttribute('src') || element.querySelector('source[src]')?.getAttribute('src');
  if (source) {
    try {
      const url = new URL(source, document.baseURI);
      if (url.origin === window.location.origin) {
        const bytes = mediaSizes[url.pathname] ?? mediaSizes[decodeURIComponent(url.pathname)];
        if (Number.isFinite(bytes) && bytes >= 0) return bytes;
      }
    } catch {
      // Invalid or opaque URLs use the same bounded estimate as external media.
    }
  }
  return contentMass.estimatedBytes[element.tagName];
}

function measureMass(element, sourceElements, styles) {
  let characters = 0;
  let media = 0;
  function visit(node, textWeight = 1) {
    if (node.nodeType === Node.TEXT_NODE) {
      characters += Array.from(node.textContent.replace(/\s+/g, ' ').trim()).length * textWeight;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE ||
        (node !== element && sourceElements.has(node)) ||
        node.matches('script, style, template, noscript, svg, [hidden]')) return;

    const style = contentStyle(node, styles);
    if (!isVisibleStyle(style)) return;

    if (Object.hasOwn(contentMass.estimatedBytes, node.tagName)) {
      media += Math.log1p(mediaBytes(node) / 1024 / contentMass.mediaKilobytesPerUnit);
      return;
    }

    const size = clamp((parseFloat(style.fontSize) || 16) / 16, 0.5, 4);
    const weight = clamp(parseFloat(style.fontWeight) || 400, 100, 900);
    const heading = node.closest('h1, h2, h3, h4, h5, h6') ? 1.12 : 1;
    const multiplier = Math.sqrt(size) * (0.8 + weight / 2000) * heading;
    for (const child of node.childNodes) visit(child, multiplier);
  }
  visit(element);
  const units = characters / contentMass.charactersPerUnit + media;
  return clamp(contentMass.base + 0.24 * Math.log1p(units), contentMass.base, contentMass.max);
}

function invalidatePanels() {
  panelsDirty = true;
}

function invalidateMass() {
  massDirty = true;
  invalidatePanels();
}

window.addEventListener('scroll', invalidatePanels, { passive: true });
window.addEventListener('resize', invalidateMass);
const panelObserver = new ResizeObserver(invalidateMass);
panelObserver.observe(document.body);
document.fonts.ready.then(invalidateMass);
document.fonts.addEventListener('loadingdone', invalidateMass);
window.addEventListener('load', invalidateMass);
if (main) {
  // Lazy media and later content edits update mass once, outside the draw loop.
  main.addEventListener('load', invalidateMass, true);
  main.addEventListener('loadedmetadata', invalidateMass, true);
  const contentObserver = new MutationObserver(invalidateMass);
  contentObserver.observe(main, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'src', 'srcset', 'sizes', 'data-gravity-bytes'],
  });
}

function refreshMass() {
  const candidates = Array.from(document.querySelectorAll('main .border, main h1, main h2, main h3, main h4, main h5, main h6'));
  const candidateSet = new Set(candidates);
  for (const element of observedElements) {
    if (!candidateSet.has(element)) {
      panelObserver.unobserve(element);
      observedElements.delete(element);
    }
  }
  const rects = new Map();
  for (const element of candidates) {
    rects.set(element, element.getBoundingClientRect());
    if (!observedElements.has(element)) {
      panelObserver.observe(element);
      observedElements.add(element);
    }
  }
  const styles = new Map();
  const cards = candidates.filter((element) => {
    const rect = rects.get(element);
    return element.matches('.border') && rect.width >= 140 && rect.height >= 80 && isVisibleStyle(contentStyle(element, styles));
  });
  const cardSet = new Set(cards);
  const headings = candidates.filter((element) => {
    if (!element.matches('h1, h2, h3, h4, h5, h6') || cardSet.has(element)) return false;
    const rect = rects.get(element);
    if (rect.width <= 0 || rect.height <= 0 || !isVisibleStyle(contentStyle(element, styles))) return false;
    for (let parent = element.parentElement; parent && parent !== main; parent = parent.parentElement) {
      if (cardSet.has(parent)) return false;
    }
    return true;
  });
  const elements = [...cards, ...headings];
  const sourceElements = new Set(elements);
  panelSources = elements.map((element) => {
    const mass = measureMass(element, sourceElements, styles);
    const heading = !cardSet.has(element);
    return {
      element,
      mass,
      // Small sources still reach 4.5 cells; heavier content approaches five.
      reach: panelEffect.reach * (0.9 + 0.1 * (mass - contentMass.base) / (contentMass.max - contentMass.base)),
      displacement: heading ? Math.min(panelEffect.displacement * mass * 0.55, rects.get(element).height * 0.3) : panelEffect.displacement * mass,
      recession: panelEffect.weight * (heading ? 0.3 : 1),
    };
  });
  massDirty = false;
}

function refreshPanels() {
  if (massDirty) refreshMass();
  // Scrolling only updates geometry; text/style/media measurements stay cached.
  panels = panelSources.map((source) => ({ ...source, rect: source.element.getBoundingClientRect() })).filter(({ rect, reach }) =>
    rect.width > 0 && rect.height > 0 &&
    rect.bottom > -reach && rect.top < canvas.height + reach &&
    rect.right > -reach && rect.left < canvas.width + reach
  );
  panelsDirty = false;
}

function panelDepthAt(x, y) {
  let depth = 0;
  let offsetX = 0;
  let offsetY = 0;
  for (const panel of panels) {
    const { rect } = panel;
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance >= panel.reach) continue;

    const weight = smoothFalloff(distance, panel.reach);
    // Keep the broad bending field independent of the close-in fading effect.
    depth += (1 - depth) * smoothFalloff(distance, panelEffect.fadeFalloff) * panel.recession;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    offsetX += clamp((centerX - x) / (rect.width / 2), -1, 1) * weight * panel.displacement;
    offsetY += clamp((centerY - y) / (rect.height / 2), -1, 1) * weight * panel.displacement;
  }
  // A smooth vector cap keeps overlapping fields from piling into sharp folds.
  const magnitude = Math.hypot(offsetX, offsetY);
  const scale = magnitude ? panelEffect.maxDisplacement * Math.tanh(magnitude / panelEffect.maxDisplacement) / magnitude : 1;
  return {
    depth,
    offsetX: offsetX * scale,
    offsetY: offsetY * scale,
  };
}

function draw(time) {
  if (animationStart === null) animationStart = time;
  if (panelsDirty) refreshPanels();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const wave = waveStateAt(time);

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
      const ripple = wave ? waveOffsetAt(baseX, baseY, wave) : noWaveOffset;
      const x = baseX + warpX + pressure.offsetX + ripple.x * recession;
      const y = baseY + warpY + pressure.offsetY + ripple.y * recession;
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
