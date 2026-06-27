/* ============================================================================
   data.js — single source of truth for the whole site.
   Everything below is real content. Edit text here and the UI updates.
   The `CORPUS` array at the bottom is what the in-browser RAG engine searches.
   ========================================================================== */

window.SITE = {
  profile: {
    name: "Abhishek Jadhav",
    role: "AI Engineer",
    tagline: "I build production AI systems that stay reliable under real-world scale, latency, cost, and quality constraints.",
    location: "Buffalo, NY · open to relocation anywhere in the US",
    email: "abhicjadhav@gmail.com",
    phone: "716-239-3515",
    linkedin: "https://www.linkedin.com/in/abhishekdata",
    github: "https://github.com/abhi-dataprofile",
    // Replace with your real Medium profile URL
    medium: "https://medium.com/@abhicjadhav",
    resumeUrl: "" // optional: drop a /assets/resume.pdf path here to show a download button
  },

  // Hero constellation: you at the center, real production-grade skills clustered
  // close + bright, and "other candidates" drifting far out with demo-grade tags.
  // Edit freely — `skills` should be short production terms/tools; `others` are
  // the things that keep the rest of the field at a distance.
  constellation: {
    you: "you",
    youSub: "ships to prod",
    skills: ["RAG + rerank", "Evals · LLM-judge", "Observability", "LangGraph agents", "Guardrails", "FastAPI", "pgvector memory"],
    others: [
      { label: "demo-only", quip: "great in the notebook" },
      { label: "fake agent", quip: "it's an if-statement" },
      { label: "no evals", quip: "ships on vibes" },
      { label: "toy RAG", quip: "one PDF, no rerank" },
      { label: "prompt & pray", quip: "no guardrails" }
    ]
  },

  // Headline numbers — each ties to a concrete claim from real work.
  metrics: [
    { value: "52%", label: "lower LLM inference cost", note: "semantic caching · model routing · retrieval pruning" },
    { value: "11.2s → 3.8s", label: "p95 agent latency", note: "async retrieval · parallel tools · speculative context" },
    { value: "71% → 91%", label: "workflow success rate", note: "reflection loops · confidence scoring · retries" },
    { value: "43%", label: "fewer hallucinations", note: "grounding validation · response verification" }
  ],

  // Order is real and meaningful, so the timeline is numbered/dated.
  experience: [
    {
      role: "AI Engineer (Contract)",
      org: "Blackstone Launchpad — University at Buffalo",
      period: "Aug 2024 — Jun 2026",
      summary: "Owned the reliability, cost, and observability layers of agentic LLM systems in production.",
      points: [
        "Cut LLM inference cost 52% via semantic caching, model routing, retrieval pruning, and dynamic context-window construction.",
        "Reduced p95 agent latency from 11.2s to 3.8s with async retrieval, parallel tool execution, and speculative context loading.",
        "Lifted end-to-end workflow success from 71% to 91% using reflection loops, confidence scoring, and automated retries.",
        "Built 500+ benchmark scenarios and automated eval suites, cutting model-regression incidents 82%.",
        "Stood up distributed tracing and AI observability dashboards, dropping incident resolution time 64%."
      ],
      tags: ["Agentic AI", "Reliability", "Evaluation", "Observability", "Cost"]
    },
    {
      role: "AI Data Engineer",
      org: "Locke Solutions",
      period: "May 2025 — Dec 2025",
      summary: "Translated operational problems into AI and data products adopted across the business.",
      points: [
        "Built an LLM email assistant generating customer responses from project status, history, and business context.",
        "Shipped customer-health analytics on Python/AWS/Snowflake/Streamlit with 92% churn-prediction accuracy.",
        "Delivered exec analytics consolidating ERP, CRM, manufacturing, and finance with real-time view of $5M+ quarterly revenue.",
        "Built inventory forecasting that reduced stockouts 40% and lifted standard-product sales 30%.",
        "Modernized infra with CI/CD and IaC, cutting deployment time 70%."
      ],
      tags: ["LLM apps", "RAG", "Snowflake", "AWS", "Forecasting"]
    },
    {
      role: "Software Engineer",
      org: "Pitney Bowes",
      period: "Feb 2023 — Jul 2024",
      summary: "Built data products and LLM tooling supporting analytics, governance, and AI initiatives.",
      points: [
        "Built and deployed 13+ production ETL pipelines across AWS, Snowflake, and MongoDB processing terabytes.",
        "Developed Azure OpenAI apps automating SQL generation for non-technical stakeholders.",
        "Led cloud cost optimization cutting infrastructure spend $90K+ per year.",
        "Built automated recovery, monitoring, and data-quality frameworks for high availability.",
        "Automated provisioning with Terraform, Docker, and GitLab CI/CD."
      ],
      tags: ["ETL", "Azure OpenAI", "Terraform", "Governance", "Cost"]
    }
  ],

  // Grouped by the production concerns a senior reviewer actually probes.
  skillGroups: [
    {
      name: "Languages & libraries",
      items: ["Python", "JavaScript", "React", "C#", "PySpark", "pandas", "SQL", "TypeScript"]
    },
    {
      name: "Agentic & LLM systems",
      items: ["Agentic AI", "Multi-Agent Architectures", "Tool / Function Calling", "Structured Outputs", "Reflection Loops", "Self-Correction", "Prompt Engineering", "Guardrails"]
    },
    {
      name: "Retrieval (RAG)",
      items: ["Hybrid Retrieval", "Reranking", "Context Compression", "Relevance-Aware Chunking", "Vector Databases", "Grounding Validation"]
    },
    {
      name: "Memory",
      items: ["Hierarchical Memory", "Importance Ranking", "Memory Aging & Decay", "Semantic Deduplication", "Summarization & Consolidation"]
    },
    {
      name: "Evaluation & observability",
      items: ["LLM-as-Judge", "Golden Datasets", "Regression Testing", "Distributed Tracing", "Drift Detection", "Telemetry"]
    },
    {
      name: "Production AI",
      items: ["Semantic Caching", "Model Routing", "Token Optimization", "Prompt-Injection Defense", "Circuit Breakers", "Fallback Models"]
    },
    {
      name: "Infra & data",
      items: ["AWS", "Azure", "Snowflake", "Docker", "Kubernetes", "Terraform", "CI/CD", "FastAPI", "LangGraph", "Airflow"]
    }
  ],

  // Each project is clickable -> opens a detail view with a one-line `tagline`,
  // a longer `detail`, `highlights`, an architecture `diagram`, and (where it
  // exists) a live `demo` you can open in the browser.
  projects: [
    {
      name: "Production RAG — GC Project Console",
      tagline: "Ask a construction project anything — then verify every answer.",
      blurb: "A production RAG system over a real general-contractor project's records (RFIs, change orders, daily logs, submittals, safety, schedule). Grounded, cited answers you can audit by opening the source file.",
      detail: "Built for the way a GC actually works: the value is connecting documents, not reading them one at a time. The pipeline is hybrid retrieval (dense + BM25) → reciprocal rank fusion → cross-encoder rerank → grounded generation, served over a streaming FastAPI and orchestrated with LangGraph. It separates two modes cleanly — grounded Q&A that answers only from context, and a 'strategize' mode that reasons over records you've pinned to working memory to draft a schedule-recovery plan or quantify cost/schedule exposure.",
      highlights: [
        "Hybrid dense + BM25 retrieval — BM25 nails exact IDs (RFI-017, CO-003, spec 03 30 00); dense handles natural language. RRF merges them without matching score scales.",
        "Cross-encoder rerank trims ~20 candidates to the ~5 that enter the prompt for precision.",
        "Click-to-verify: every record shows a relevance score and opens its source file (guarded against path traversal).",
        "Pin-to-memory + strategize: curated context drives action prompts while every number stays grounded.",
        "Ragas evaluation gate fails CI on a retrieval or prompt regression instead of shipping it silently."
      ],
      stack: ["Python", "FastAPI", "LangGraph", "Qdrant", "BM25", "Cross-Encoder", "Ragas"],
      diagram: "assets/production-rag-architecture.svg",
      demo: "assets/demos/production-rag-console.html",
      link: "https://github.com/abhi-dataprofile",
      kind: "Flagship · Applied RAG"
    },
    {
      name: "LLM Observatory",
      tagline: "See what your LLM app is actually doing in production.",
      blurb: "A self-hostable observability & evaluation platform for LLM apps — distributed tracing, automatic cost accounting, an evaluation engine, and a zero-build dashboard. Inspired by Langfuse / LangSmith.",
      detail: "LLM apps fail in ways traditional software doesn't: silent quality regressions, runaway token cost, latency spikes from one slow provider call. Observatory instruments your code with a lightweight SDK, ships traces to a FastAPI ingestion API, and renders latency, cost, errors, and quality scores from a dependency-free dashboard. It runs anywhere — a single SQLite file on a laptop, or Postgres in production.",
      highlights: [
        "Distributed tracing for LLM workflows — nested spans and generations with full input/output capture, token usage and cost.",
        "Automatic cost accounting across OpenAI, Anthropic, Google and Meta models, via an extensible registry.",
        "Evaluation engine: heuristic evaluators (PII leakage, refusals, JSON validity, latency/cost guards) plus pluggable LLM-as-judge scoring.",
        "Real dashboard: overview KPIs, latency/cost time-series, a trace waterfall explorer, and score distributions — no CDN, no build step.",
        "@observe decorator for one-line instrumentation, or manual traces/spans for full control."
      ],
      stack: ["Python", "FastAPI", "SQLite", "Postgres", "JavaScript", "Tracing", "LLM-as-Judge"],
      diagram: "assets/observatory-architecture.svg",
      demo: "assets/demos/observatory-dashboard.html",
      link: "https://github.com/abhi-dataprofile",
      kind: "Platform · Observability"
    },
    {
      name: "LLM Post-Training Pipeline",
      tagline: "Turn an open base model into a real assistant — reproducibly.",
      blurb: "An end-to-end, YAML-configured recipe that takes an open base model through SFT → DPO → (optional GRPO) → eval → serve, built on Oumi across six reference datasets for chat, instruction-following, code and math.",
      detail: "Everything is configuration and reproducible. Stage 1 supervised fine-tuning blends multi-turn chat, instruction following, code and grade-school math; Stage 2 DPO aligns to preferences; an optional Stage 3 GRPO targets GSM8K reasoning. LoRA adapters are merged between stages, evaluation runs against GSM8K/MMLU/IFEval/ARC/HellaSwag/HumanEval, and a smoke target validates the whole pipeline in minutes before committing GPU hours.",
      highlights: [
        "Three-stage alignment: SFT → DPO → optional GRPO, with LoRA adapters merged into base weights between stages.",
        "Six reference datasets mixed by role (chat backbone, instruction following, code, math reasoning, preference pairs).",
        "Resumable orchestration via run_pipeline.sh; `make smoke` exercises every code path on a tiny model/data first.",
        "FSDP full fine-tune and vLLM inference configs; cloud launch via Oumi.",
        "Evaluation across GSM8K, MMLU, IFEval, ARC, HellaSwag, HumanEval."
      ],
      stack: ["Python", "Oumi", "LoRA / QLoRA", "DPO", "GRPO", "FSDP", "vLLM"],
      diagram: null,
      demo: null,
      link: "https://github.com/abhi-dataprofile",
      kind: "Training · Alignment"
    },
    {
      name: "Local LLM Service",
      tagline: "Local LLMs that return JSON you can trust.",
      blurb: "A production FastAPI service wrapping a local LLM (via Ollama) that returns schema-validated, structured JSON using Instructor + Pydantic — turning 'the model usually returns JSON' into a typed contract.",
      detail: "You define a Pydantic model; the endpoint either returns an instance that satisfies it or a clean, categorized error. When the model's output fails validation, Instructor feeds the error back and re-prompts up to a configurable retry limit — the 'amber loop' that makes structured output reliable. All LLM details sit behind one LLMService class, so swapping the model, the coercion mode, or even the provider is a one-file change.",
      highlights: [
        "Typed contract: Pydantic schema in, validated instance out — or a categorized error, never silent malformed JSON.",
        "Self-healing retries: validation errors are re-prompted back to the model up to LLM_MAX_RETRIES times.",
        "Runs fully local with no API keys — Ollama exposes an OpenAI-compatible endpoint; quantized GGUF models fit modest RAM/VRAM.",
        "Production HTTP surface: OpenAPI docs, DI, async I/O, API-key auth, structured logging with request correlation IDs.",
        "Health/readiness probes and a bundled single-page console; tests run with the LLM stubbed (no Ollama needed)."
      ],
      stack: ["Python", "FastAPI", "Ollama", "Instructor", "Pydantic", "GGUF"],
      diagram: "assets/local-llm-architecture.svg",
      demo: null,
      link: "https://github.com/abhi-dataprofile",
      kind: "Service · Structured Output"
    },
    {
      name: "Mnemos",
      tagline: "A code reviewer that remembers your repo.",
      blurb: "AI code reviewer with persistent, per-repository memory. Postgres + pgvector store review history so feedback compounds over time instead of resetting every PR.",
      detail: "Most AI reviewers are stateless — they re-litigate the same points every pull request. Mnemos keeps a persistent, per-repository memory in Postgres + pgvector so prior decisions, conventions and recurring issues carry forward, letting review feedback compound instead of resetting. Open source under Apache-2.0.",
      highlights: [
        "Persistent per-repository memory in Postgres + pgvector.",
        "Review feedback compounds across PRs instead of resetting each time.",
        "Retrieval over past decisions to keep conventions consistent.",
        "Open source, Apache-2.0 licensed."
      ],
      stack: ["Python", "pgvector", "RAG", "Agents"],
      diagram: null,
      demo: null,
      link: "https://github.com/abhi-dataprofile",
      kind: "Open source · Apache-2.0"
    },
    {
      name: "Stakeholder Analytics Chatbot",
      tagline: "Ask your data questions in plain English.",
      blurb: "Text-to-data chatbot for the Buffalo Center for Arts & Technology on Azure OpenAI + Snowflake. Self-service analytics that cut reporting time ~50%.",
      detail: "A natural-language analytics assistant that let non-technical stakeholders query organizational data directly, translating plain-English questions into governed queries against Snowflake via Azure OpenAI. Self-service reporting replaced manual pulls and cut reporting time roughly in half.",
      highlights: [
        "Natural-language to query over Snowflake, served through Azure OpenAI.",
        "Self-service analytics for non-technical stakeholders.",
        "Cut reporting turnaround time by ~50%.",
        "Delivered as a Streamlit application."
      ],
      stack: ["Python", "Azure OpenAI", "Snowflake", "Streamlit"],
      diagram: null,
      demo: null,
      link: "https://github.com/abhi-dataprofile",
      kind: "Applied · Text-to-Data"
    }
  ],

  // Replace `url` values with your real Medium / LinkedIn article links.
  articles: [
    {
      title: "The Hunger Model: a framework for agentic AI systems",
      summary: "A practitioner framework for how agents prioritize, pursue, and stop pursuing goals under uncertainty.",
      tag: "Framework",
      url: "https://medium.com/@abhicjadhav"
    },
    {
      title: "Memory architecture for AI agents",
      summary: "Hierarchical memory, importance ranking, and decay policies that keep long-running agents fast and grounded.",
      tag: "Memory",
      url: "https://medium.com/@abhicjadhav"
    },
    {
      title: "Within-session summarization for long agent runs",
      summary: "Compressing conversation state mid-run to hold context without blowing the token budget.",
      tag: "Context",
      url: "https://medium.com/@abhicjadhav"
    }
  ],

  /* ==========================================================================
     CORPUS — the documents the in-browser RAG engine retrieves & reranks.
     Keep chunks focused (one idea each). `section` powers the rerank priors.
     ======================================================================== */
  corpus: [
    { id: "cost-1", section: "Cost", title: "Inference cost reduction",
      text: "Reduced LLM inference cost by 52 percent using semantic caching, model routing, retrieval pruning, and dynamic context window construction. Lowered average token consumption from 18k to 7k tokens per request while keeping answer quality above 94 percent on internal benchmarks." },
    { id: "cost-2", section: "Cost", title: "Model routing economics",
      text: "Routed low-complexity requests to smaller models, cutting expensive-model utilization by 68 percent and improving cost-per-successful-task by 41 percent. Reduced annual infrastructure cost by over 90 thousand dollars through intelligent workload allocation." },
    { id: "lat-1", section: "Latency", title: "Agent latency optimization",
      text: "Reduced p95 agent response latency from 11.2 seconds to 3.8 seconds with asynchronous retrieval, parallel tool execution, and speculative context loading. Increased workflow throughput 2.7x by redesigning synchronous pipelines into event-driven execution graphs." },
    { id: "rel-1", section: "Reliability", title: "Workflow success rate",
      text: "Increased end-to-end agent workflow success from 71 percent to 91 percent using reflection loops, confidence scoring, and automated retry policies. Reduced tool execution failures 58 percent through schema validation, output guardrails, and fallback strategies." },
    { id: "rel-2", section: "Reliability", title: "Hallucination reduction",
      text: "Reduced hallucination rates 43 percent using retrieval grounding validation and response verification pipelines. Improved answer groundedness scores from 0.74 to 0.92 with hybrid retrieval and reranking." },
    { id: "rag-1", section: "Retrieval", title: "Hybrid retrieval and reranking",
      text: "Built hybrid retrieval combining lexical and semantic search with cross-encoder reranking to improve groundedness. Used relevance-aware chunk selection and context compression to cut context payload size 63 percent while preserving answer quality." },
    { id: "mem-1", section: "Memory", title: "Long-term memory retrieval",
      text: "Increased long-term memory retrieval precision 39 percent through hierarchical memory architectures and importance-based memory ranking. Reduced irrelevant memory retrievals 44 percent via memory aging, decay policies, and semantic deduplication." },
    { id: "mem-2", section: "Memory", title: "Memory storage control",
      text: "Reduced memory storage growth 61 percent through summarization and consolidation pipelines, keeping long-running agents fast and affordable without losing important context." },
    { id: "eval-1", section: "Evaluation", title: "Evaluation infrastructure",
      text: "Reduced model regression incidents 82 percent through automated evaluation suites and prompt regression testing. Added 500-plus benchmark scenarios covering retrieval quality, hallucinations, tool correctness, and factuality. Cut manual QA effort 70 percent with automated LLM evaluation pipelines." },
    { id: "obs-1", section: "Observability", title: "AI observability",
      text: "Reduced production incident resolution time 64 percent through distributed tracing and AI observability dashboards. Improved root-cause time from hours to minutes by tracking retrieval quality, token consumption, and tool execution traces. Caught 55 percent more silent workflow failures with real-time monitoring and anomaly detection." },
    { id: "sec-1", section: "Security", title: "Security and governance",
      text: "Reduced prompt injection attack success 78 percent through input sanitization and tool permissioning. Cut unauthorized tool access incidents 95 percent with RBAC and scoped permissions. Added end-to-end traceability across prompts, model versions, and retrieval pipelines." },
    { id: "mt-1", section: "Scale", title: "Multi-tenant scale",
      text: "Enabled 10,000-plus concurrent user sessions through asynchronous execution and stateless service design. Reduced cross-tenant data exposure risk to near zero with tenant-aware retrieval and RBAC. Improved deployment scalability 5x using containerized AI services and autoscaling." },
    { id: "hitl-1", section: "Human-in-the-loop", title: "Human-in-the-loop systems",
      text: "Increased annotation throughput 3.1x with AI-assisted labeling and prioritization. Reduced human review needs 57 percent via confidence-based routing, and improved dataset quality scores 36 percent through automated validation." },
    { id: "cicd-1", section: "CI/CD", title: "CI/CD and versioning",
      text: "Reduced deployment rollback frequency 60 percent with canary releases and evaluation gates. Cut prompt deployment cycles from days to minutes with automated prompt versioning. Reached 100 percent experiment reproducibility through versioned prompts, models, embeddings, and datasets." },
    { id: "locke-1", section: "Experience", title: "Locke Solutions — AI data products",
      text: "At Locke Solutions, built an LLM email assistant that generates customer responses from project status and history, shipped customer-health analytics with 92 percent churn-prediction accuracy, and delivered executive analytics over ERP, CRM, manufacturing, and finance data covering 5 million dollars in quarterly revenue." },
    { id: "pb-1", section: "Experience", title: "Pitney Bowes — data platform and LLM tooling",
      text: "At Pitney Bowes, built 13-plus production ETL pipelines across AWS, Snowflake, and MongoDB processing terabytes, developed Azure OpenAI apps that automate SQL generation for non-technical users, and led cost optimization saving over 90 thousand dollars per year. Recipient of the ACE Award of the Year." },
    { id: "proj-mnemos", section: "Projects", title: "Mnemos — code reviewer with memory",
      text: "Mnemos is an open-source AI code reviewer with persistent per-repository memory built on Postgres and pgvector, so review feedback compounds across pull requests instead of resetting each time. Licensed Apache 2.0." },
    { id: "proj-eval", section: "Projects", title: "LLM Evaluation Harness",
      text: "A configurable LLM-as-judge framework with rubric scoring, run tracking, and leaderboards for benchmarking models on custom datasets across retrieval quality, hallucinations, and tool correctness." },
    { id: "stack-1", section: "Skills", title: "Core stack",
      text: "Core stack spans agentic AI, multi-agent architectures, RAG, hybrid retrieval, tool and function calling, structured outputs, LLM evaluation and LLM-as-judge, guardrails, semantic caching, context compression, model routing, memory systems, FastAPI, LangGraph, Airflow, Docker, Kubernetes, Terraform, AWS, Azure, and Snowflake." }
  ]
};
