/* ============================================================================
   rag.js — a real retrieval pipeline that runs in the browser.
     1. Embed     : query -> TF-IDF vector over the corpus vocabulary
     2. Retrieve  : cosine similarity -> top-k documents
     3. Rerank    : cross-encoder-style re-scoring (coverage, bigrams, priors)
     4. Generate  : grounded answer with citations
   Generation is extractive/offline by default. To use a live Claude model,
   set  window.RAG_BACKEND = "https://your-worker.workers.dev"  (see README).
   ========================================================================== */
(function () {
  "use strict";

  const CORPUS = (window.SITE && window.SITE.corpus) || [];
  const STOP = new Set(("a an the of to and or for with in on at by from is are was were be been being this that these those it its as into your you i my our we us how what why when which do did " +
    "using used use via through then than so such also more most over under near each every other can will would could").split(/\s+/));

  const el = id => document.getElementById(id);
  const elInput = el("ragInput"), elRun = el("ragRun"), elChips = el("ragChips");
  const elRetr = el("ragRetrieved"), elRerank = el("ragReranked");
  const elAnswer = el("ragAnswer"), elNote = el("ragNote");
  const tabs = [...document.querySelectorAll(".stage-tab")];
  if (!elInput || CORPUS.length === 0) return;

  const examples = [
    "How did you reduce cost and latency?",
    "What have you done with memory systems?",
    "Show me your evaluation and observability work",
    "Tell me about your projects",
    "How do you stop hallucinations?"
  ];

  /* ---------------- index ---------------- */
  const docs = CORPUS.map(d => ({ ...d, full: (d.title + " " + d.text) }));
  function terms(s) {
    return (s.toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter(t => t.length > 1 && !STOP.has(t));
  }
  function bigrams(arr) { const b = []; for (let i = 0; i < arr.length - 1; i++) b.push(arr[i] + " " + arr[i + 1]); return b; }

  // build vocabulary + idf
  const df = Object.create(null);
  const docTerms = docs.map(d => {
    const t = terms(d.full);
    const seen = new Set(t);
    seen.forEach(w => { df[w] = (df[w] || 0) + 1; });
    return t;
  });
  const N = docs.length;
  const idf = Object.create(null);
  Object.keys(df).forEach(w => { idf[w] = Math.log((N + 1) / (df[w] + 0.5)) + 1; });

  function tfidfVec(tokenList) {
    const tf = Object.create(null);
    tokenList.forEach(w => { tf[w] = (tf[w] || 0) + 1; });
    const v = Object.create(null); let norm = 0;
    Object.keys(tf).forEach(w => {
      const weight = (tf[w] / tokenList.length) * (idf[w] || Math.log(N + 1));
      v[w] = weight; norm += weight * weight;
    });
    norm = Math.sqrt(norm) || 1;
    Object.keys(v).forEach(w => v[w] /= norm);
    return v;
  }
  const docVecs = docTerms.map(tfidfVec);
  function cosine(a, b) {
    let dot = 0; const ka = Object.keys(a);
    for (const w of ka) if (b[w]) dot += a[w] * b[w];
    return dot;
  }

  /* ---------------- intent / section priors ---------------- */
  const INTENT = [
    { sec: "Cost", kw: ["cost","cheap","expensive","token","budget","spend","price","economic"] },
    { sec: "Latency", kw: ["latency","fast","faster","speed","slow","throughput","response","real-time","realtime"] },
    { sec: "Reliability", kw: ["reliable","reliability","hallucinat","accuracy","accurate","ground","success","fail","robust","correct"] },
    { sec: "Retrieval", kw: ["rag","retrieval","retrieve","rerank","search","context","chunk","embedding"] },
    { sec: "Memory", kw: ["memory","remember","recall","forget","decay","long-term","longterm"] },
    { sec: "Evaluation", kw: ["eval","evaluation","benchmark","test","regression","judge","quality","measure"] },
    { sec: "Observability", kw: ["observ","trace","tracing","monitor","debug","incident","root-cause","metric"] },
    { sec: "Security", kw: ["security","secure","injection","prompt-injection","rbac","governance","permission","attack"] },
    { sec: "Scale", kw: ["scale","scaling","concurrent","tenant","multi-tenant","sessions","autoscal"] },
    { sec: "Projects", kw: ["project","projects","built","build","mnemos","tool","open-source","opensource","github"] },
    { sec: "Experience", kw: ["experience","worked","work","locke","pitney","job","role","company"] },
    { sec: "Human-in-the-loop", kw: ["human","annotation","label","review","hitl"] },
    { sec: "CI/CD", kw: ["ci","cd","deploy","deployment","versioning","rollback","release","reproducib"] }
  ];
  function detectIntents(qTerms) {
    const qstr = qTerms.join(" ");
    const hits = new Set();
    INTENT.forEach(it => { if (it.kw.some(k => qstr.includes(k))) hits.add(it.sec); });
    return hits;
  }

  /* ---------------- pipeline ---------------- */
  async function run(query) {
    const qTerms = terms(query);
    const qSet = new Set(qTerms);
    const qBigrams = new Set(bigrams(qTerms));
    const intents = detectIntents(qTerms);
    const qVec = tfidfVec(qTerms);

    // stage 1 embed
    setStage(0); clear();
    await sleep(220);

    // stage 2 retrieve
    const scored = docs.map((d, i) => ({ d, i, cos: cosine(qVec, docVecs[i]) }))
      .sort((a, b) => b.cos - a.cos);
    const K = Math.min(6, scored.length);
    const retrieved = scored.slice(0, K);
    const maxCos = retrieved[0].cos || 1;
    setStage(1);
    await renderDocs(elRetr, retrieved.map((r, rank) => ({
      doc: r.d, score: r.cos, scoreNorm: r.cos / maxCos, rank, qSet
    })), false);
    await sleep(260);

    // stage 3 rerank
    setStage(2);
    const reranked = retrieved.map((r) => {
      const dT = docTerms[r.i];
      const dSet = new Set(dT);
      const dBig = new Set(bigrams(dT));
      let covered = 0; qSet.forEach(w => { if (dSet.has(w)) covered++; });
      const coverage = qSet.size ? covered / qSet.size : 0;
      let big = 0; qBigrams.forEach(b => { if (dBig.has(b)) big++; });
      const bigramMatch = qBigrams.size ? big / qBigrams.size : 0;
      const prior = intents.has(r.d.section) ? 1 : 0;
      const cosN = r.cos / maxCos;
      const rerankScore = 0.40 * cosN + 0.32 * coverage + 0.16 * bigramMatch + 0.12 * prior;
      return { doc: r.d, retrievalRank: retrieved.indexOf(r), score: rerankScore, qSet };
    }).sort((a, b) => b.score - a.score);

    const maxR = reranked[0].score || 1;
    await renderDocs(elRerank, reranked.map((r, rank) => ({
      doc: r.doc, score: r.score, scoreNorm: r.score / maxR, rank,
      move: r.retrievalRank - rank, qSet
    })), true);
    await sleep(280);

    // stage 4 generate
    setStage(3);
    await generate(query, reranked, intents);
    markDone();
  }

  /* ---------------- rendering ---------------- */
  function clear() { elRetr.innerHTML = ""; elRerank.innerHTML = ""; elAnswer.innerHTML = '<span style="color:var(--mute)">…</span>'; elNote.innerHTML = ""; }
  function setStage(n) {
    tabs.forEach((t, i) => {
      t.classList.toggle("active", i === n);
      t.classList.toggle("done", i < n);
    });
  }
  function markDone() { tabs.forEach(t => { t.classList.remove("active"); t.classList.add("done"); }); }

  async function renderDocs(container, list, isRerank) {
    container.innerHTML = "";
    for (let i = 0; i < list.length; i++) {
      const { doc, score, scoreNorm, move, qSet } = list[i];
      const elD = document.createElement("div");
      elD.className = "doc" + (isRerank && move > 0 ? " up" : "");
      elD.style.animationDelay = (i * 70) + "ms";
      let moveTag = "";
      if (isRerank) {
        if (move > 0) moveTag = `<span class="rankmove up">▲ ${move}</span>`;
        else if (move < 0) moveTag = `<span class="rankmove down">▼ ${-move}</span>`;
        else moveTag = `<span class="rankmove same">—</span>`;
      }
      elD.innerHTML = `
        <div class="meta">
          <span class="sect">${doc.section}</span>
          <span class="scoreval">${score.toFixed(3)} ${moveTag}</span>
        </div>
        <div class="title">${escapeHtml(doc.title)}</div>
        <div class="txt">${highlight(snippet(doc.text), qSet)}</div>
        <div class="score-bar"><i style="width:0%"></i></div>`;
      container.appendChild(elD);
      requestAnimationFrame(() => {
        const bar = elD.querySelector(".score-bar i");
        if (bar) bar.style.width = Math.max(4, scoreNorm * 100).toFixed(0) + "%";
      });
      await sleep(60);
    }
  }

  function snippet(t) { return t.length > 180 ? t.slice(0, 180).replace(/\s+\S*$/, "") + "…" : t; }
  function highlight(text, qSet) {
    return escapeHtml(text).replace(/[A-Za-z0-9]+/g, w =>
      qSet.has(w.toLowerCase()) ? `<mark>${w}</mark>` : w);
  }

  /* ---------------- generation ---------------- */
  async function generate(query, reranked, intents) {
    const top = reranked.slice(0, 3);
    if (window.RAG_BACKEND) {
      try { return await generateLive(query, top); }
      catch (e) { /* fall through to offline */ }
    }
    generateOffline(query, top, intents);
  }

  function bestSentence(text, qSet) {
    const sents = text.split(/(?<=[.!?])\s+/);
    let best = sents[0], bestScore = -1;
    sents.forEach(s => {
      const t = terms(s); let hit = 0; const set = new Set(t);
      qSet.forEach(w => { if (set.has(w)) hit++; });
      const score = hit + Math.min(t.length, 24) * 0.01;
      if (score > bestScore) { bestScore = score; best = s; }
    });
    return best.trim();
  }

  function generateOffline(query, top, intents) {
    const qSet = new Set(terms(query));
    const intentLabel = [...intents].slice(0, 3).join(", ").toLowerCase() || "this";
    let html = `<p>Here's what's grounded in the retrieved evidence on ${escapeHtml(intentLabel)}:</p><p>`;
    top.forEach((r, i) => {
      const sent = bestSentence(r.doc.text, qSet);
      html += `${escapeHtml(ensurePeriod(sent))} <span class="cite" title="${escapeHtml(r.doc.title)}">[${i + 1}]</span> `;
    });
    html += `</p>`;
    elAnswer.innerHTML = html;
    elNote.innerHTML =
      `<span class="gen-mode"><span class="led"></span>offline mode</span> · answer composed extractively from the top reranked passages ` +
      top.map((r, i) => `<b>[${i + 1}]</b> ${escapeHtml(r.doc.title)}`).join(" · ") +
      `. Wire up a Claude backend (see README) for fully generative answers.`;
  }

  async function generateLive(query, top) {
    elAnswer.innerHTML = '<span style="color:var(--mute)">Generating with Claude…</span>';
    const context = top.map((r, i) => `[${i + 1}] ${r.doc.title}: ${r.doc.text}`).join("\n\n");
    const res = await fetch(window.RAG_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, context })
    });
    if (!res.ok) throw new Error("backend " + res.status);
    const data = await res.json();
    const answer = (data.answer || data.text || "").trim();
    if (!answer) throw new Error("empty");
    elAnswer.innerHTML = `<p>${escapeHtml(answer).replace(/\n/g, "<br>")}</p>`;
    elNote.innerHTML = `<span class="gen-mode"><span class="led" style="background:var(--cyan);box-shadow:0 0 10px var(--cyan)"></span>live · Claude</span> · grounded in ` +
      top.map((r, i) => `<b>[${i + 1}]</b> ${escapeHtml(r.doc.title)}`).join(" · ");
  }

  /* ---------------- utils ---------------- */
  function ensurePeriod(s) { return /[.!?]$/.test(s) ? s : s + "."; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function sleep(ms) { return new Promise(r => setTimeout(r, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms)); }

  /* ---------------- wire up ---------------- */
  let running = false;
  async function trigger() {
    if (running) return; running = true;
    elRun.disabled = true; elRun.textContent = "Running…";
    try { await run(elInput.value || ""); }
    finally { running = false; elRun.disabled = false; elRun.textContent = "Run pipeline"; }
  }
  function init() {
    examples.forEach(ex => {
      const c = document.createElement("span");
      c.className = "chip"; c.textContent = ex;
      c.addEventListener("click", () => { elInput.value = ex; trigger(); });
      elChips.appendChild(c);
    });
    elRun.addEventListener("click", trigger);
    elInput.addEventListener("keydown", e => { if (e.key === "Enter") trigger(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
