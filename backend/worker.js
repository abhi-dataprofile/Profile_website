/**
 * Cloudflare Worker — secure proxy for live Claude generation.
 *
 * Why this exists: GitHub Pages is static, so you can NEVER put an Anthropic
 * API key in the website's client-side code (it would be public and stolen).
 * This tiny worker holds the key as a secret and answers requests from your
 * site. The browser calls the worker; the worker calls Claude.
 *
 * ── Deploy (free tier is plenty) ─────────────────────────────────────────
 *   1. npm i -g wrangler && wrangler login
 *   2. Save this file as src/worker.js with a wrangler.toml:
 *
 *        name = "rag-backend"
 *        main = "src/worker.js"
 *        compatibility_date = "2024-11-01"
 *
 *   3. wrangler secret put ANTHROPIC_API_KEY      (paste your key)
 *   4. (optional) lock it to your site origin:
 *        wrangler secret put ALLOWED_ORIGIN       (e.g. https://abhi-dataprofile.github.io)
 *   5. wrangler deploy   ->  copies a URL like https://rag-backend.<you>.workers.dev
 *
 * ── Turn it on in the site ───────────────────────────────────────────────
 *   In index.html, just before </body>, add:
 *        <script>window.RAG_BACKEND = "https://rag-backend.<you>.workers.dev";</script>
 *   The RAG demo auto-switches from offline mode to live Claude answers.
 */

const MODEL = "claude-sonnet-4-6"; // fast + cheap; swap if you like
const MAX_TOKENS = 400;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const allow = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow === "*" ? "*" : (origin === allow ? allow : allow),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }
    const query = (body.query || "").toString().slice(0, 600);
    const context = (body.context || "").toString().slice(0, 6000);
    if (!query) return json({ error: "missing query" }, 400, cors);

    const system =
      "You are answering questions about Abhishek Jadhav, an AI engineer, on his portfolio site. " +
      "Answer ONLY from the provided context passages. Be concise (2-4 sentences), specific, and " +
      "first-person where natural. Cite passages inline as [1], [2]. If the context does not cover " +
      "the question, say so briefly rather than inventing details.";

    const userMsg = `Question: ${query}\n\nContext passages:\n${context}`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await resp.json();
      if (!resp.ok) return json({ error: data.error?.message || "upstream error" }, 502, cors);
      const answer = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      return json({ answer }, 200, cors);
    } catch (e) {
      return json({ error: "request failed" }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}
