// DOME clickable official art (DIMS-RUN-0002 Step 7; ADR "DOME Home Page = Official Art 1, Clickable").
// Each page defines window.DOME_ART = { title, width, height, hotspots:[...] } before loading this file.
// Hotspot: { key, num?, name, purpose, href | action:'di2', color, ring?, slow?, shape:{ellipse:[cx,cy,rx,ry]} | {rect:[x,y,w,h,r]} | {poly:'x,y x,y ...'} }
// Coordinates are in the artwork's own pixels, so every hotspot scales with the image on any screen.
(() => {
  const cfg = window.DOME_ART;
  if (!cfg) return;
  const SVG = 'http://www.w3.org/2000/svg';
  const stage = document.querySelector('.art-stage');
  const listEl = document.querySelector('.art-list ol');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  };
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const debug = /[?&]hotspots=show\b/.test(location.search);
  if (debug) document.documentElement.classList.add('art-debug');

  // ---- Voice clips (DIMS-REF-0003, clips 00-12). Add a file name here once the owner records it,
  // e.g. gegraptai: '/dome-art/voice/01-gegraptai.mp3'. Until then clicks navigate immediately.
  const VOICE = window.DOME_ART_VOICE || {};

  // ---- Sound: off by default; the speaker choice is remembered on this device.
  let soundOn = store.get('dome.art.sound') === 'on';
  let audioCtx = null;
  const ringNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66];
  function tone(spot) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      const freq = spot.num ? ringNotes[(spot.num - 1) % 8] : 392.0;
      [1, 2.01].forEach((mult, i) => {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq * mult;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(i ? 0.012 : 0.045, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        osc.connect(gain).connect(audioCtx.destination); osc.start(t); osc.stop(t + 1.2);
      });
    } catch (_) {}
  }

  // ---- Build the overlay.
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'art-hotspots');
  svg.setAttribute('viewBox', `0 0 ${cfg.width} ${cfg.height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = '<defs><filter id="artGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  stage.appendChild(svg);
  const tip = document.createElement('div');
  tip.className = 'art-tip'; tip.setAttribute('aria-hidden', 'true');
  stage.appendChild(tip);

  function shapeEl(shape, cls) {
    let el;
    if (shape.ellipse) { const [cx, cy, rx, ry] = shape.ellipse; el = document.createElementNS(SVG, 'ellipse'); Object.entries({ cx, cy, rx, ry }).forEach(([k, v]) => el.setAttribute(k, v)); }
    else if (shape.rect) { const [x, y, width, height, r = 18] = shape.rect; el = document.createElementNS(SVG, 'rect'); Object.entries({ x, y, width, height, rx: r, ry: r }).forEach(([k, v]) => el.setAttribute(k, v)); }
    else { el = document.createElementNS(SVG, 'polygon'); el.setAttribute('points', shape.poly); }
    el.setAttribute('class', cls);
    return el;
  }
  function centerOf(shape) {
    if (shape.ellipse) return { x: shape.ellipse[0], y: shape.ellipse[1] - shape.ellipse[3] };
    if (shape.rect) return { x: shape.rect[0] + shape.rect[2] / 2, y: shape.rect[1] };
    const pts = shape.poly.trim().split(/\s+/).map(p => p.split(',').map(Number));
    return { x: pts.reduce((s, p) => s + p[0], 0) / pts.length, y: Math.min(...pts.map(p => p[1])) };
  }
  function showTip(spot) {
    const c = centerOf(spot.shape);
    tip.innerHTML = `<strong>${spot.num ? String(spot.num).padStart(2, '0') + ' · ' : ''}${spot.name}</strong><span>${spot.purpose}</span>`;
    tip.style.setProperty('--tip', spot.color);
    tip.style.left = `${(c.x / cfg.width) * 100}%`;
    tip.style.top = `calc(${(c.y / cfg.height) * 100}% - 6px)`;
    tip.classList.add('show');
  }
  function hideTip() { tip.classList.remove('show'); }

  function go(spot, link) {
    if (spot.action === 'di2') {
      const launcher = document.querySelector('.di-launch');
      if (launcher) launcher.click(); else location.href = spot.fallback || '/';
      return;
    }
    const clip = soundOn && VOICE[spot.key];
    if (!clip) { location.href = spot.href; return; }
    try {
      const a = new Audio(clip);
      let done = false; const leave = () => { if (!done) { done = true; location.href = spot.href; } };
      a.addEventListener('ended', leave); a.addEventListener('error', leave);
      setTimeout(leave, 4000);
      a.play().catch(leave);
    } catch (_) { location.href = link.href; }
  }

  const label = s => `Open ${s.name} — ${s.purpose}`;
  const ringSpots = cfg.hotspots.filter(s => s.ring);
  const cycle = ringSpots.length * 3.5;

  cfg.hotspots.forEach(spot => {
    const a = document.createElementNS(SVG, 'a');
    a.setAttribute('href', spot.href || '#');
    a.setAttribute('aria-label', label(spot));
    a.setAttribute('class', spot.ring ? 'art-ring' : spot.slow ? 'art-slow' : 'art-plain');
    a.style.setProperty('--c', spot.color);
    if (spot.ring) { a.style.setProperty('--cycle', `${cycle}s`); a.style.setProperty('--delay', `${(spot.num - 1) * 3.5}s`); }
    const title = document.createElementNS(SVG, 'title'); title.textContent = label(spot); a.appendChild(title);
    a.appendChild(shapeEl(spot.shape, 'art-glow'));
    a.appendChild(shapeEl(spot.shape, 'art-hit'));
    svg.appendChild(a);

    let touched = false;
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { a.classList.add('is-active'); showTip(spot); tone(spot); } });
    a.addEventListener('pointerleave', () => { a.classList.remove('is-active'); hideTip(); });
    a.addEventListener('focus', () => showTip(spot));
    a.addEventListener('blur', hideTip);
    a.addEventListener('pointerdown', e => { touched = e.pointerType !== 'mouse'; });
    a.addEventListener('click', e => {
      e.preventDefault();
      if (touched) {
        // Touch: glow fully and show the name for a moment, then open.
        a.classList.add('is-active'); showTip(spot); tone(spot);
        setTimeout(() => go(spot, a), reduceMotion ? 0 : 380);
      } else go(spot, a);
      touched = false;
    });

    if (listEl) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = spot.href || '#';
      link.style.setProperty('--c', spot.color);
      link.setAttribute('aria-label', label(spot));
      link.innerHTML = `<span class="num">${spot.num ? String(spot.num).padStart(2, '0') : '◆'}</span><span><b>${spot.name}</b><small>${spot.purpose}</small></span>`;
      if (spot.action === 'di2') link.addEventListener('click', e => { e.preventDefault(); go(spot, link); });
      li.appendChild(link); listEl.appendChild(li);
    }
  });

  // ---- Speaker toggle.
  const btn = document.querySelector('[data-art-sound]');
  if (btn) {
    const paint = () => { btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); btn.textContent = soundOn ? '🔊 Sound on' : '🔈 Sound off'; };
    btn.addEventListener('click', () => { soundOn = !soundOn; store.set('dome.art.sound', soundOn ? 'on' : 'off'); paint(); if (soundOn) tone({ num: 1 }); });
    paint();
  }
})();
