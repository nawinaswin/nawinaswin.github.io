const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = readFileSync(path.join(__dirname, '../static/js/background.js'), 'utf8');
const box = { left: 300, top: 200, width: 300, height: 200, right: 600, bottom: 400 };

// The animation runs against a small DOM fixture; no browser or packages needed.
function element(tag = 'div', { text = '', children = [], style = {}, attrs = {}, rect = box } = {}) {
  const node = {
    nodeType: 1, tagName: tag.toUpperCase(), style, attrs, rect,
    childNodes: [...(text ? [{ nodeType: 3, textContent: text }] : []), ...children],
    parentElement: null,
    getAttribute(name) { return attrs[name] ?? null; },
    getBoundingClientRect() { return this.rect; },
    addEventListener() {},
    matches(selector) {
      return selector.split(',').some((part) => {
        part = part.trim();
        if (part === '.border') return (attrs.class || '').split(' ').includes('border');
        if (part === '[hidden]') return Object.hasOwn(attrs, 'hidden');
        if (part === 'source[src]') return tag === 'source' && Object.hasOwn(attrs, 'src');
        return part.toUpperCase() === this.tagName;
      });
    },
    closest(selector) {
      for (let current = this; current; current = current.parentElement) {
        if (current.matches(selector)) return current;
      }
      return null;
    },
    querySelector(selector) {
      for (const child of this.childNodes) {
        if (child.nodeType !== 1) continue;
        if (child.matches(selector)) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    },
  };
  for (const child of node.childNodes) child.parentElement = node;
  return node;
}

function setup({ candidates = [], sizes = {}, width = 1440, height = 900 } = {}) {
  let styleReads = 0;
  let drawCalls = 0;
  const events = new Map();
  const main = element('main', { children: candidates.filter((node) => !node.parentElement) });
  const drawing = {};
  for (const method of ['clearRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill']) {
    drawing[method] = (...values) => {
      assert.ok(values.every(Number.isFinite), `${method} received invalid coordinates`);
      drawCalls++;
    };
  }
  const context = vm.createContext({
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 }, URL,
    window: {
      innerWidth: width, innerHeight: height,
      location: { origin: 'https://example.test' },
      matchMedia: () => ({ matches: false }),
      addEventListener(name, callback) {
        if (!events.has(name)) events.set(name, []);
        events.get(name).push(callback);
      },
    },
    document: {
      baseURI: 'https://example.test/projects/example/',
      body: { insertBefore() {} },
      createElement: () => ({ getContext: () => drawing }),
      querySelector: () => main,
      querySelectorAll: () => candidates,
      getElementById: () => ({ textContent: JSON.stringify(sizes) }),
      fonts: { ready: { then() {} }, addEventListener() {} },
    },
    getComputedStyle(node) {
      styleReads++;
      return { display: 'block', visibility: 'visible', fontSize: '16px', fontWeight: '400', ...node.style };
    },
    ResizeObserver: class { observe() {} unobserve() {} },
    MutationObserver: class { observe() {} },
    requestAnimationFrame() {},
  });
  vm.runInContext(script, context);
  return {
    context, run: (code) => vm.runInContext(code, context),
    mass: (node, sources = new Set()) => context.measureMass(node, sources, new Map()),
    emit: (name) => events.get(name).forEach((callback) => callback()),
    styleReads: () => styleReads, drawCalls: () => drawCalls,
  };
}

test('more text, larger headings, and bold text contribute more mass', () => {
  const { mass } = setup();
  const text = 'A thoughtful project title';
  const plain = mass(element('p', { text }));
  assert.ok(mass(element('p', { text: text.repeat(5) })) > plain);
  assert.ok(mass(element('strong', { text, style: { fontWeight: '700' } })) > plain);
  assert.ok(mass(element('h1', { text, style: { fontSize: '40px', fontWeight: '700' } })) > plain);
  assert.ok(mass(element('p', { text: text.repeat(10000) })) <= 1.5);
});

test('nested sources count their own content once; invisible text does not add mass', () => {
  const { mass } = setup();
  const child = element('div', { text: 'Nested text '.repeat(100) });
  const parent = element('div', { text: 'Parent text', children: [child] });
  assert.equal(mass(parent, new Set([child])), mass(element('div', { text: 'Parent text' })));
  assert.ok(mass(parent) > mass(parent, new Set([child])));
  for (const hidden of [
    element('script', { text: 'hidden'.repeat(100) }),
    element('p', { text: 'hidden'.repeat(100), attrs: { hidden: '' } }),
    element('p', { text: 'hidden'.repeat(100), style: { display: 'none' } }),
    element('p', { text: 'hidden'.repeat(100), style: { visibility: 'hidden' } }),
  ]) {
    assert.equal(mass(element('div', { text: 'Parent text', children: [hidden] })), mass(element('div', { text: 'Parent text' })));
  }
});

test('media resolves local byte sizes, chosen sources, explicit sizes, and external fallbacks', () => {
  const { context, mass } = setup({ sizes: { '/images/small.png': 1024, '/images/large image.gif': 1024 * 1024, '/images/encoded%20name.png': 4096, '/clips/demo.mp4': 4096000 } });
  const small = element('img', { attrs: { src: '/images/small.png' } });
  const large = element('img', { attrs: { src: '/images/large%20image.gif?v=2' } });
  assert.equal(context.mediaBytes(small), 1024);
  assert.equal(context.mediaBytes(large), 1024 * 1024);
  assert.equal(context.mediaBytes(element('img', { attrs: { src: '/images/encoded%20name.png' } })), 4096);
  assert.ok(mass(large) > mass(small));
  small.currentSrc = 'https://example.test/images/large%20image.gif';
  assert.equal(context.mediaBytes(small), 1024 * 1024);
  assert.equal(context.mediaBytes(element('video', { children: [element('source', { attrs: { src: '/clips/demo.mp4' } })] })), 4096000);
  assert.equal(context.mediaBytes(element('img', { attrs: { src: 'https://other.test/images/small.png' } })), 65536);
  assert.equal(context.mediaBytes(element('iframe', { attrs: { 'data-gravity-bytes': '1000000' } })), 1000000);
  assert.equal(context.mediaBytes(element('img', { attrs: { 'data-gravity-bytes': '0' } })), 0);
  assert.equal(context.mediaBytes(element('img', { attrs: { 'data-gravity-bytes': '-1' } })), 65536);
  // Project thumbnails are visually present inside aria-hidden duplicate links.
  assert.ok(mass(element('a', { attrs: { 'aria-hidden': 'true' }, children: [large] })) > mass(element()));
});

test('only standalone headings become separate sources; small controls and hidden cards are excluded', () => {
  const title = element('h2', { text: 'Card title' });
  const card = element('div', { attrs: { class: 'border' }, children: [title] });
  const heading = element('h1', { text: 'Page title' });
  const hidden = element('div', { attrs: { class: 'border' }, style: { visibility: 'hidden' } });
  const button = element('a', { attrs: { class: 'border' }, rect: { ...box, width: 24, height: 24 } });
  const { context, run } = setup({ candidates: [card, title, heading, hidden, button] });
  context.refreshPanels();
  const sources = run('panelSources');
  assert.equal(sources.length, 2);
  assert.equal(sources[0].element, card);
  assert.equal(sources[1].element, heading);
  assert.ok(sources[1].displacement < sources[0].displacement);
});

test('curvature persists four cells beyond the perimeter, fades smoothly, and ends by five', () => {
  const card = element('div', { text: 'Content '.repeat(80), attrs: { class: 'border' } });
  const { context, run } = setup({ candidates: [card] });
  context.refreshPanels();
  const { reach } = run('panels[0]');
  const near = context.panelDepthAt(box.right + 36, 300);
  const far = context.panelDepthAt(box.right + 144, 300);
  const edge = context.panelDepthAt(box.right + reach - 0.01, 300);
  const beyond = context.panelDepthAt(box.right + 180, 300);
  assert.ok(reach >= 162 && reach <= 180);
  assert.ok(near.offsetX < far.offsetX && far.offsetX < 0);
  assert.equal(far.depth, 0, 'the wider field should not widen fading');
  assert.ok(Math.abs(edge.offsetX) < 0.001);
  assert.equal(beyond.offsetX, 0);
  assert.equal(beyond.offsetY, 0);
});

test('heavier cards bend more, while many overlapping fields stay bounded', () => {
  const card = element('div', { text: 'Short', attrs: { class: 'border' } });
  const fixture = setup({ candidates: [card] });
  fixture.context.refreshPanels();
  const light = Math.abs(fixture.context.panelDepthAt(box.right + 72, 300).offsetX);
  card.childNodes[0].textContent = 'More content '.repeat(300);
  fixture.context.invalidateMass();
  fixture.context.refreshPanels();
  assert.ok(Math.abs(fixture.context.panelDepthAt(box.right + 72, 300).offsetX) > light);
  fixture.run('panels = Array(50).fill(panels[0])');
  const pressure = fixture.context.panelDepthAt(box.right + 1, box.bottom + 1);
  assert.ok(Math.hypot(pressure.offsetX, pressure.offsetY) <= 32);
  assert.ok(pressure.depth >= 0 && pressure.depth <= 1);
});

test('scrolling and animation reuse mass; responsive reflow refreshes it', () => {
  const card = element('div', { text: 'Card content', attrs: { class: 'border' } });
  const fixture = setup({ candidates: [card] });
  fixture.context.draw(0);
  const reads = fixture.styleReads();
  card.rect = { ...box, top: 100, bottom: 300 };
  fixture.emit('scroll');
  fixture.context.draw(16);
  fixture.context.draw(32);
  assert.equal(fixture.styleReads(), reads);
  assert.equal(fixture.run('panels[0].rect.top'), 100);
  fixture.context.window.innerWidth = 390;
  fixture.context.window.innerHeight = 844;
  fixture.emit('resize');
  fixture.context.draw(48);
  assert.ok(fixture.styleReads() > reads);
  assert.equal(fixture.run('canvas.width'), 390);
  assert.ok(fixture.drawCalls() > 0);
});

test('cards just outside the viewport keep their extended field; removed content is released', () => {
  const candidates = [element('div', { text: 'Nearby', attrs: { class: 'border' }, rect: { ...box, top: 980, bottom: 1180 } })];
  const fixture = setup({ candidates, height: 900 });
  fixture.context.refreshPanels();
  assert.equal(fixture.run('panels.length'), 1);
  assert.ok(fixture.context.panelDepthAt(450, 890).offsetY > 0);
  candidates.length = 0;
  fixture.context.invalidateMass();
  fixture.context.refreshPanels();
  assert.equal(fixture.run('panels.length'), 0);
  assert.equal(fixture.run('observedElements.size'), 0);
});
