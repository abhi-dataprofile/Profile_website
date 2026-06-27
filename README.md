# Abhishek Jadhav — AI Engineer portfolio

A static, dependency-free portfolio that *shows* AI engineering instead of listing it. Two pieces are real, working instruments — both run entirely in the browser:

- **Attention explorer** — type a sentence, watch multi-head self-attention (`softmax(QKᵀ/√d)`) play out as an interactive arc diagram. Pick a head, pick a token, slide layer depth.
- **RAG engine** — ask a question and watch a full pipeline run: embed → retrieve (TF-IDF + cosine) → rerank (cross-encoder-style) → grounded answer with citations. The corpus is your real work.

No build step. No framework. No tracking. Just static files you can host anywhere.

---

## Deploy on GitHub Pages (2 minutes)

1. Create a repo (e.g. `website`) and push every file in this folder to the **root** of the `main` branch.
2. Repo **Settings → Pages → Build and deployment**: set **Source = Deploy from a branch**, **Branch = `main` / `root`**, save.
3. Wait ~1 minute. Your site is live at `https://<your-username>.github.io/<repo>/`.

For a clean root URL (`https://<your-username>.github.io/`), name the repo `<your-username>.github.io`.

```
# from this folder
git init
git add .
git commit -m "AI engineer portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/website.git
git push -u origin main
```

---

## Make it yours

Almost everything lives in **`data.js`** — edit text there and the page updates. No HTML changes needed.

- **Profile / links** → `SITE.profile` (email, LinkedIn, GitHub, Medium, optional résumé path).
- **Headline metrics** → `SITE.metrics`.
- **Experience** → `SITE.experience`.
- **Skills** → `SITE.skillGroups`.
- **Projects** → `SITE.projects` (point `link` at the real repos). Each card is clickable and opens a detail view with a one-line `tagline`, a longer `detail`, `highlights`, an architecture `diagram` (path under `assets/`), and an optional live `demo` (an HTML file under `assets/demos/`). Set `diagram`/`demo` to `null` if a project has none.
- **Writing** → `SITE.articles` (replace `url` with your real Medium/LinkedIn article links).
- **RAG corpus** → `SITE.corpus`. This is what the engine searches. Add a chunk per accomplishment: keep each to one idea, set a `section` (the section drives reranking priors).

To add a résumé download button: drop `resume.pdf` in `assets/` and set `SITE.profile.resumeUrl = "assets/resume.pdf"`.

### Colors & type
Theme tokens are CSS variables at the top of `styles.css` (`--cyan`, `--violet`, `--ink`, fonts). Change them in one place.

---

## Optional: live Claude answers in the RAG demo

By default the answer is composed extractively from the top reranked passages — fully offline, no key, safe to host publicly. To get real generative answers, deploy the included serverless proxy so your API key stays secret (it must **never** sit in client-side code on a public repo).

1. Deploy `backend/worker.js` to Cloudflare Workers — full steps are in the comment header of that file.
2. Add one line before `</body>` in `index.html`:
   ```html
   <script>window.RAG_BACKEND = "https://rag-backend.<you>.workers.dev";</script>
   ```
The demo detects the backend and switches to live Claude generation, falling back to offline mode automatically if the backend is unreachable.

---

## Files

```
index.html        page structure
styles.css        observatory theme + components
data.js           ← all your content + the RAG corpus
transformer.js    attention explorer
rag.js            retrieval + rerank + generation
main.js           renders content, hero field, nav, scroll reveals, project modals
backend/worker.js optional Cloudflare Worker for live Claude
assets/           architecture diagrams (.svg) + live project demos (demos/*.html)
.nojekyll         tells GitHub Pages to serve files as-is
```

Built to run in any modern browser. Respects `prefers-reduced-motion`, keyboard-focusable, responsive to mobile.
