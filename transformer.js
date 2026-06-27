/* ============================================================================
   transformer.js — interactive self-attention explorer.
   Computes a deterministic toy multi-head attention over the input tokens and
   renders it as an arc diagram. Not a trained model — a faithful illustration
   of the mechanism (QK^T -> scale -> softmax), so it stays fast and offline.
   ========================================================================== */
(function () {
  "use strict";

  const D = 24;                // toy embedding dim
  const HEADS = 4;
  const elInput = document.getElementById("tfInput");
  const elRun = document.getElementById("tfRun");
  const elTokens = document.getElementById("tfTokens");
  const elCanvas = document.getElementById("tfCanvas");
  const elHead = document.getElementById("tfHead");
  const elLayer = document.getElementById("tfLayer");
  const elLayerVal = document.getElementById("tfLayerVal");
  const elChips = document.getElementById("tfChips");
  const elArch = document.getElementById("tfArch");
  if (!elCanvas) return;
  const ctx = elCanvas.getContext("2d");

  const COLORS = readColors();
  let tokens = [];
  let embeds = [];
  let attn = [];          // attn[i][j]
  let selected = null;    // source token index, or null = aggregate
  let raf = null;

  const examples = [
    "The agent retrieves context then reranks the results",
    "Attention lets each token look at every other token",
    "Cache the embeddings to cut inference cost",
    "Reliability comes from reflection loops and retries"
  ];

  const archCells = [
    { k: "embed", n: "Token + position", d: "tokens → vectors" },
    { k: "qkv",   n: "Q · K · V", d: "linear projections" },
    { k: "attn",  n: "Self-attention", d: "softmax(QKᵀ/√d)·V" },
    { k: "addnorm1", n: "Add & norm", d: "residual + layernorm" },
    { k: "ffn",   n: "Feed-forward", d: "two-layer MLP" },
    { k: "addnorm2", n: "Add & norm", d: "residual + layernorm" }
  ];

  /* ---------- deterministic helpers ---------- */
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embedFor(tok, idx) {
    const r = rng(hash(tok.toLowerCase()));
    const v = new Float32Array(D);
    let norm = 0;
    for (let k = 0; k < D; k++) {
      let val = r() * 2 - 1;
      val += 0.5 * Math.sin((idx + 1) * (k + 1) * 0.21); // positional signal
      v[k] = val; norm += val * val;
    }
    norm = Math.sqrt(norm) || 1;
    for (let k = 0; k < D; k++) v[k] /= norm;
    return v;
  }
  function charOverlap(a, b) {
    const sa = new Set(a.toLowerCase()), sb = new Set(b.toLowerCase());
    let inter = 0; sa.forEach(c => { if (sb.has(c)) inter++; });
    return inter / Math.max(1, Math.max(sa.size, sb.size));
  }
  const FUNCTION_WORDS = new Set(["the","a","an","of","to","then","and","for","with","that","is","each","look","at","every","other"]);

  /* ---------- tokenize ---------- */
  function tokenize(text) {
    return text.trim().split(/\s+/).filter(Boolean).slice(0, 12);
  }

  /* ---------- attention ---------- */
  function computeAttention(head, layer) {
    const n = tokens.length;
    const A = [];
    const temp = 1.4 - (layer / 6) * 0.9; // deeper layer -> sharper
    const r = rng(hash("head" + head));
    // head-specific projection scaling
    const scaleQ = new Float32Array(D), scaleK = new Float32Array(D);
    for (let k = 0; k < D; k++) { scaleQ[k] = 0.5 + r(); scaleK[k] = 0.5 + r(); }

    for (let i = 0; i < n; i++) {
      const row = new Float32Array(n);
      let max = -Infinity;
      for (let j = 0; j < n; j++) {
        let dot = 0;
        for (let k = 0; k < D; k++) dot += embeds[i][k] * scaleQ[k] * embeds[j][k] * scaleK[k];
        dot /= Math.sqrt(D);
        // head personalities
        let bias = 0;
        if (head === 0) { // syntax: function words pull
          if (FUNCTION_WORDS.has(tokens[j].toLowerCase())) bias += 0.6;
        } else if (head === 1) { // adjacency
          bias += Math.exp(-Math.abs(i - j) / 1.3) * 1.3;
        } else if (head === 2) { // semantic: surface similarity
          bias += charOverlap(tokens[i], tokens[j]) * 1.4;
        } else { // global: broad, slight pull to first token
          bias += (j === 0 ? 0.5 : 0) + 0.2;
        }
        const layerSemantic = (layer / 6) * (head === 2 ? charOverlap(tokens[i], tokens[j]) : 0);
        const score = (dot + bias + layerSemantic) / temp;
        row[j] = score; if (score > max) max = score;
      }
      // softmax
      let sum = 0;
      for (let j = 0; j < n; j++) { row[j] = Math.exp(row[j] - max); sum += row[j]; }
      for (let j = 0; j < n; j++) row[j] /= sum;
      A.push(row);
    }
    return A;
  }

  /* ---------- rendering ---------- */
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    return {
      violet: cs.getPropertyValue("--violet").trim() || "#A78BFA",
      cyan: cs.getPropertyValue("--cyan").trim() || "#6EE7D8",
      mute: cs.getPropertyValue("--mute").trim() || "#8A94A6",
      mist: cs.getPropertyValue("--mist").trim() || "#E8ECF4",
      line: "rgba(255,255,255,0.10)"
    };
  }

  function sizeCanvas() {
    const cssW = elCanvas.clientWidth || elCanvas.parentElement.clientWidth;
    const cssH = Math.max(200, Math.min(320, cssW * 0.42));
    const dpr = window.devicePixelRatio || 1;
    elCanvas.width = cssW * dpr;
    elCanvas.height = cssH * dpr;
    elCanvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: cssW, h: cssH };
  }

  function nodePositions(w, h) {
    const n = tokens.length;
    const padX = 48, y = h * 0.30;
    const span = w - padX * 2;
    return tokens.map((t, i) => ({
      x: n === 1 ? w / 2 : padX + (span * i) / (n - 1),
      y, label: t
    }));
  }

  function draw(progress) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);
    const pos = nodePositions(w, h);
    const n = tokens.length;

    // arcs
    for (let i = 0; i < n; i++) {
      if (selected !== null && i !== selected) continue;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        let wgt = attn[i][j];
        if (selected === null) {
          // aggregate view: only show each token's notable links
          if (wgt < 0.18) continue;
        } else {
          if (wgt < 0.04) continue;
        }
        drawArc(pos[i], pos[j], wgt * progress, i === selected);
      }
    }

    // nodes
    for (let i = 0; i < n; i++) {
      const p = pos[i];
      const isSel = i === selected;
      // self-attention ring
      const self = attn[i][i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5 + self * 9 * progress, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? COLORS.violet : (selected === null ? COLORS.cyan : COLORS.mute);
      ctx.globalAlpha = isSel ? 1 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // label
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = isSel ? COLORS.mist : COLORS.mute;
      const ly = p.y + 26 + (i % 2) * 16; // stagger to reduce overlap
      ctx.fillText(p.label, p.x, ly);
      // connector tick
      ctx.strokeStyle = COLORS.line;
      ctx.beginPath(); ctx.moveTo(p.x, p.y + 8); ctx.lineTo(p.x, ly - 11); ctx.stroke();
    }
  }

  function drawArc(a, b, weight, strong) {
    const midX = (a.x + b.x) / 2;
    const dist = Math.abs(a.x - b.x);
    const lift = Math.min(0.55, 0.16 + dist / 900) * (a.y + 50);
    const cy = a.y + 18 + lift * 0.9;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 8);
    ctx.quadraticCurveTo(midX, cy, b.x, b.y + 8);
    const t = Math.min(1, weight * 2.2);
    const col = strong ? COLORS.violet : COLORS.cyan;
    ctx.strokeStyle = hexA(col, 0.12 + t * 0.7);
    ctx.lineWidth = 0.6 + weight * 6;
    ctx.stroke();
  }

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ---------- token chips ---------- */
  function renderTokens() {
    elTokens.innerHTML = "";
    tokens.forEach((t, i) => {
      const el = document.createElement("div");
      el.className = "tok";
      el.innerHTML = `${escapeHtml(t)}<span class="pos">${i}</span>`;
      el.addEventListener("mouseenter", () => setSelected(i));
      el.addEventListener("mouseleave", () => setSelected(null));
      el.addEventListener("click", () => { setSelected(i); pinned = i; });
      elTokens.appendChild(el);
    });
  }
  let pinned = null;
  function setSelected(i) {
    selected = (i === null) ? pinned : i;
    [...elTokens.children].forEach((c, k) => c.classList.toggle("sel", k === selected));
    animate();
  }

  function renderArch() {
    elArch.innerHTML = "";
    archCells.forEach((c, i) => {
      if (i > 0) {
        const arrow = document.createElement("span");
        arrow.className = "arch-arrow";
        arrow.textContent = "→";
        arrow.dataset.gap = i; // gap before cell i
        elArch.appendChild(arrow);
      }
      const el = document.createElement("div");
      const focus = c.k === "attn" || c.k === "qkv";
      el.className = "arch-cell" + (focus ? " live" : "");
      el.innerHTML = `<span class="arch-no">STAGE ${i + 1}</span><b>${c.n}</b>${c.d}`;
      el.dataset.k = c.k;
      el.dataset.idx = i;
      elArch.appendChild(el);
    });
    startFlow();
  }

  // Traveling signal: lights each stage in sequence so the whole block reads
  // as a live pipeline (a chain), not a static legend.
  let flowTimer = null, flowIdx = 0;
  function paintFlow(idx) {
    const cells = [...elArch.querySelectorAll(".arch-cell")];
    const arrows = [...elArch.querySelectorAll(".arch-arrow")];
    cells.forEach(c => c.classList.toggle("flow", Number(c.dataset.idx) === idx));
    arrows.forEach(a => a.classList.toggle("on", Number(a.dataset.gap) === idx));
  }
  function startFlow() {
    if (flowTimer) clearInterval(flowTimer);
    const cells = elArch.querySelectorAll(".arch-cell");
    if (!cells.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { return; } // keep the static .live emphasis only
    flowIdx = 0;
    paintFlow(flowIdx);
    flowTimer = setInterval(() => {
      flowIdx = (flowIdx + 1) % cells.length;
      paintFlow(flowIdx);
    }, 760);
  }
  // Nudge the pulse to the attention stage on interaction, then let it resume.
  function pulseArch() {
    const cells = [...elArch.querySelectorAll(".arch-cell")];
    const attn = cells.find(c => c.dataset.k === "attn");
    if (attn) { flowIdx = Number(attn.dataset.idx); paintFlow(flowIdx); }
  }

  /* ---------- animation ---------- */
  function animate() {
    cancelAnimationFrame(raf);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { draw(1); return; }
    const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / 420);
      draw(easeOut(p));
      if (p < 1) raf = requestAnimationFrame(step);
    })(start);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- pipeline ---------- */
  function rebuild() {
    tokens = tokenize(elInput.value || "");
    if (tokens.length === 0) tokens = ["empty"];
    embeds = tokens.map((t, i) => embedFor(t, i));
    recompute();
    renderTokens();
    animate();
    pulseArch();
  }
  function recompute() {
    const head = parseInt(elHead.value, 10);
    const layer = parseInt(elLayer.value, 10);
    attn = computeAttention(head, layer);
  }

  function escapeHtml(s) { return s.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

  /* ---------- wire up ---------- */
  function init() {
    renderArch();
    // chips
    examples.forEach(ex => {
      const c = document.createElement("span");
      c.className = "chip"; c.textContent = ex.length > 38 ? ex.slice(0, 38) + "…" : ex;
      c.title = ex;
      c.addEventListener("click", () => { elInput.value = ex; pinned = null; rebuild(); });
      elChips.appendChild(c);
    });
    elRun.addEventListener("click", () => { pinned = null; rebuild(); });
    elInput.addEventListener("keydown", e => { if (e.key === "Enter") { pinned = null; rebuild(); } });
    elHead.addEventListener("change", () => { recompute(); animate(); pulseArch(); });
    elLayer.addEventListener("input", () => {
      elLayerVal.textContent = elLayer.value + " / 6";
      recompute(); animate();
    });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => draw(1), 120); });
    rebuild();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
