/* ============================================================================
   main.js — renders content from data.js, runs nav + reveals + hero field.
   ========================================================================== */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const make = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  /* ---------- hero text + meta ---------- */
  $("#heroSub").textContent = S.profile.tagline;
  const meta = $("#heroMeta");
  meta.innerHTML =
    `<span>${esc(S.profile.location)}</span>` +
    `<a href="${S.profile.github}" target="_blank" rel="noopener">GitHub ↗</a>` +
    `<a href="${S.profile.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>` +
    `<a href="mailto:${S.profile.email}">Email ↗</a>`;

  /* ---------- metrics ---------- */
  const m = $("#metrics");
  S.metrics.forEach(x => {
    m.appendChild(make("div", "metric",
      `<div class="v">${esc(x.value)}</div><div class="l">${esc(x.label)}</div><div class="n">${esc(x.note)}</div>`));
  });

  /* ---------- timeline ---------- */
  const tl = $("#timeline");
  S.experience.forEach((e, i) => {
    const item = make("div", "tl-item reveal");
    const left = make("div", "",
      `<div class="tl-idx mono">0${i + 1}</div><div class="tl-when">${esc(e.period)}</div>`);
    const right = make("div", "");
    right.appendChild(make("div", "tl-role", esc(e.role)));
    right.appendChild(make("div", "tl-org", esc(e.org)));
    right.appendChild(make("div", "tl-summary", esc(e.summary)));
    const ul = make("ul", "tl-points");
    e.points.forEach(p => ul.appendChild(make("li", "", esc(p))));
    right.appendChild(ul);
    const tags = make("div", "tl-tags");
    e.tags.forEach(t => tags.appendChild(make("span", "tag", esc(t))));
    right.appendChild(tags);
    item.appendChild(left); item.appendChild(right);
    tl.appendChild(item);
  });

  /* ---------- skills ---------- */
  const sk = $("#skills");
  S.skillGroups.forEach(g => {
    const card = make("div", "skill-card reveal");
    card.appendChild(make("h3", "", esc(g.name)));
    const items = make("div", "items");
    g.items.forEach(it => items.appendChild(make("span", "", esc(it))));
    card.appendChild(items);
    sk.appendChild(card);
  });

  /* ---------- projects (clickable cards -> detail modal) ---------- */
  const pr = $("#projects");
  S.projects.forEach((p, i) => {
    const card = make("button", "proj reveal");
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");
    const stack = p.stack.slice(0, 5).map(s => `<span>${esc(s)}</span>`).join("");
    const badges =
      (p.diagram ? `<span class="pbadge">◇ diagram</span>` : "") +
      (p.demo ? `<span class="pbadge live">▶ live demo</span>` : "");
    card.innerHTML =
      `<div class="kind mono">${esc(p.kind)}</div>` +
      `<h3>${esc(p.name)}</h3>` +
      (p.tagline ? `<p class="ptag">${esc(p.tagline)}</p>` : "") +
      `<p>${esc(p.blurb)}</p>` +
      `<div class="stack">${stack}</div>` +
      `<div class="pfoot"><span class="pbadges">${badges}</span>` +
      `<span class="go">Details <span class="arr">→</span></span></div>`;
    card.addEventListener("click", () => openProject(i));
    pr.appendChild(card);
  });

  /* ---------- project detail modal ---------- */
  const modal = make("div", "modal-overlay");
  modal.setAttribute("hidden", "");
  modal.innerHTML =
    `<div class="modal" role="dialog" aria-modal="true" aria-label="Project detail">` +
    `<button class="modal-x" aria-label="Close">×</button>` +
    `<div class="modal-body"></div></div>`;
  document.body.appendChild(modal);
  const modalBody = $(".modal-body", modal);
  const modalX = $(".modal-x", modal);
  let lastFocus = null;

  function openProject(i) {
    const p = S.projects[i];
    const highlights = (p.highlights || []).map(h => `<li>${esc(h)}</li>`).join("");
    const stack = p.stack.map(s => `<span>${esc(s)}</span>`).join("");
    const diagram = p.diagram
      ? `<figure class="modal-diagram"><figcaption class="mono">System architecture</figcaption>` +
        `<img src="${esc(p.diagram)}" alt="${esc(p.name)} architecture diagram" loading="lazy" /></figure>`
      : "";
    const actions =
      (p.demo ? `<a class="btn solid" href="${esc(p.demo)}" target="_blank" rel="noopener">Open live demo <span class="arr">↗</span></a>` : "") +
      `<a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">View on GitHub <span class="arr">↗</span></a>`;
    modalBody.innerHTML =
      `<div class="kind mono">${esc(p.kind)}</div>` +
      `<h3 class="modal-title">${esc(p.name)}</h3>` +
      (p.tagline ? `<p class="modal-tag">${esc(p.tagline)}</p>` : "") +
      `<p class="modal-detail">${esc(p.detail || p.blurb)}</p>` +
      (highlights ? `<h4 class="modal-h">What's inside</h4><ul class="modal-list">${highlights}</ul>` : "") +
      diagram +
      `<div class="modal-stack">${stack}</div>` +
      `<div class="modal-actions">${actions}</div>`;
    lastFocus = document.activeElement;
    modal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    modal.classList.add("show");
    modalX.focus();
  }
  function closeModal() {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    modal.setAttribute("hidden", "");
    modalBody.scrollTop = 0;
    if (lastFocus) lastFocus.focus();
  }
  modalX.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal(); });

  /* ---------- articles ---------- */
  const ar = $("#articles");
  S.articles.forEach(x => {
    const a = make("a", "art reveal");
    a.href = x.url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML =
      `<span class="tag mono">${esc(x.tag)}</span>` +
      `<h3>${esc(x.title)}</h3>` +
      `<p>${esc(x.summary)}</p>` +
      `<span class="read">Read on Medium <span class="arr">→</span></span>`;
    ar.appendChild(a);
  });

  /* ---------- contact + footer ---------- */
  $("#contactLede").textContent =
    "Open to AI engineering roles and collaborations. The fastest way to reach me is email — I read everything.";
  const cl = $("#contactLinks");
  cl.innerHTML =
    `<a class="btn solid" href="mailto:${S.profile.email}">Email me <span class="arr">→</span></a>` +
    `<a class="btn" href="${S.profile.linkedin}" target="_blank" rel="noopener">LinkedIn <span class="arr">→</span></a>` +
    `<a class="btn" href="${S.profile.github}" target="_blank" rel="noopener">GitHub <span class="arr">→</span></a>` +
    (S.profile.resumeUrl ? `<a class="btn" href="${S.profile.resumeUrl}" target="_blank" rel="noopener">Résumé <span class="arr">→</span></a>` : "");
  $("#footLeft").textContent = `© ${new Date().getFullYear()} ${S.profile.name} · ${S.profile.email}`;

  /* ---------- nav toggle ---------- */
  const toggle = $("#navToggle"), links = $("#navLinks");
  if (toggle) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- hero constellation: you vs. the field ---------- */
  heroConstellation();
  function heroConstellation() {
    const wrap = $("#constellation");
    const canvas = $("#consLines");
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cs = getComputedStyle(document.documentElement);
    const cyan = (cs.getPropertyValue("--cyan").trim() || "#6EE7D8");
    const violet = (cs.getPropertyValue("--violet").trim() || "#A78BFA");
    const faint = "#59657B";
    const C = S.constellation || { you: "you", skills: [], others: [] };
    const hexA = (hex, a) => {
      const h = hex.replace("#", "");
      return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
    };

    // build chips
    wrap.innerHTML = "";
    const you = make("div", "cons-chip cons-you",
      `<span class="ring"></span><b>${esc(C.you || "you")}</b>${C.youSub ? `<small>${esc(C.youSub)}</small>` : ""}`);
    wrap.appendChild(you);
    you.addEventListener("mouseenter", () => wrap.classList.add("spot"));
    you.addEventListener("mouseleave", () => wrap.classList.remove("spot"));

    let hovered = -1;
    const skills = (C.skills || []).map((label, i) => {
      const el = make("div", "cons-chip cons-skill", `<span class="dot"></span>${esc(label)}`);
      wrap.appendChild(el);
      el.addEventListener("mouseenter", () => { hovered = i; });
      el.addEventListener("mouseleave", () => { hovered = -1; });
      return { el, base: 0, x: 0, y: 0, phase: Math.random() * 6.28 };
    });
    const others = (C.others || []).map(o => {
      const label = typeof o === "string" ? o : o.label;
      const quip = typeof o === "string" ? "" : (o.quip || "");
      const el = make("div", "cons-chip cons-other", `<span class="dot"></span>${esc(label)}`);
      if (quip) el.dataset.quip = quip;
      wrap.appendChild(el);
      return { el, base: 0, x: 0, y: 0, phase: Math.random() * 6.28, drift: 0.4 + Math.random() * 0.5 };
    });

    let W = 0, H = 0, cx = 0, cy = 0, rS = 0, rO = 0, dpr = 1, t = 0, raf;
    function size() {
      dpr = window.devicePixelRatio || 1;
      W = wrap.clientWidth; H = wrap.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      const R = Math.min(W, H);
      rS = R * 0.31; rO = R * 0.42;
      you.style.left = cx + "px"; you.style.top = cy + "px";
      // measure each chip so we can keep the whole label inside the card
      [...skills, ...others].forEach(n => {
        n.hw = n.el.offsetWidth / 2 + 5;
        n.hh = n.el.offsetHeight / 2 + 5;
      });
      skills.forEach((s, i) => { s.base = (i / skills.length) * Math.PI * 2 - Math.PI / 2; });
      // interleave others between skill spokes
      others.forEach((o, i) => { o.base = ((i + 0.5) / others.length) * Math.PI * 2 - Math.PI / 2; });
    }
    function place(node, ang, r) {
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
      // clamp so the full chip stays within the rounded card
      const mx = W / 2 - (node.hw || 30), my = H / 2 - (node.hh || 16);
      node.x = Math.max(-mx, Math.min(mx, x));
      node.y = Math.max(-my, Math.min(my, y));
      node.el.style.left = cx + "px"; node.el.style.top = cy + "px";
      node.el.style.transform = `translate(-50%,-50%) translate(${node.x}px, ${node.y}px)`;
    }
    function layoutStatic() {
      skills.forEach(s => place(s, s.base, rS));
      others.forEach(o => place(o, o.base, rO));
    }
    function frame() {
      t += 0.006;
      const rot = t * 0.5;
      skills.forEach((s, i) => {
        const bob = Math.sin(t * 1.3 + s.phase) * 5;
        place(s, s.base + rot, rS + bob);
      });
      others.forEach(o => {
        const wob = Math.sin(t * 0.7 * o.drift + o.phase) * 9;
        place(o, o.base - rot * 0.35, rO + wob);
      });
      // draw lines
      ctx.clearRect(0, 0, W, H);
      skills.forEach((s, i) => {
        const pulse = 0.55 + 0.45 * Math.sin(t * 2 + i);
        const a = (hovered === i ? 0.95 : 0.32 + 0.22 * pulse);
        ctx.strokeStyle = hexA(i % 2 ? violet : cyan, a);
        ctx.lineWidth = hovered === i ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s.x, cy + s.y); ctx.stroke();
      });
      ctx.setLineDash([2, 5]);
      others.forEach(o => {
        ctx.strokeStyle = hexA(faint, 0.22);
        ctx.lineWidth = 1;
        // tenuous tether: only a short stub reaches out from center
        const mx = cx + o.x * 0.55, my = cy + o.y * 0.55;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();
      });
      ctx.setLineDash([]);
      raf = requestAnimationFrame(frame);
    }
    size();
    if (reduce) { layoutStatic(); drawStaticLines(); }
    else frame();
    function drawStaticLines() {
      ctx.clearRect(0, 0, W, H);
      skills.forEach((s, i) => {
        ctx.strokeStyle = hexA(i % 2 ? violet : cyan, 0.4); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s.x, cy + s.y); ctx.stroke();
      });
      ctx.setLineDash([2, 5]);
      others.forEach(o => {
        ctx.strokeStyle = hexA(faint, 0.2);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + o.x * 0.55, cy + o.y * 0.55); ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    let rt; window.addEventListener("resize", () => {
      clearTimeout(rt); rt = setTimeout(() => {
        cancelAnimationFrame(raf); size();
        if (reduce) { layoutStatic(); drawStaticLines(); } else frame();
      }, 150);
    });
  }
})();
