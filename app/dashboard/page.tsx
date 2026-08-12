"use client";

import React, { useEffect, useRef, useState } from "react";

/* ============================ exact CV constants ============================ */
const FS = 13, LH = 1, LEFTCOL = 15, YEARCOL = 5.835, PAGE_MM = 210, PAD_MM = 8,
  PAGE_BORDER = 1, CELL_PADL = 2, CELL_PADR = 2.5, CELL_BORDER = 1, INDENT = 14;
const ACCEPT_LO = 0.97, ACCEPT_HI = 1.0, SOFT_LO = 0.95, OVER_MAX = 1.03;
const MAXROUNDS = 4, NVAR = 5, BOLD_HARD = 0.6;
const REQ_FILLS = [0.96, 0.98, 0.99, 1.0, 1.01];

type DomainDef = { label: string; verbs: string[]; jargon: string[] };
const DOMAINS: Record<string, DomainDef> = {
  general: { label: "General Management / Leadership", verbs: ["Led", "Spearheaded", "Orchestrated", "Drove", "Delivered", "Championed", "Mobilized", "Executed", "Scaled"], jargon: ["stakeholder", "cross-functional", "P&L", "strategy", "execution", "scalability", "alignment", "roadmap", "KPIs", "ROI", "end-to-end", "turnaround", "growth", "transformation"] },
  consulting: { label: "Strategy & Consulting", verbs: ["Advised", "Diagnosed", "Structured", "Synthesized", "Recommended", "Benchmarked", "Streamlined", "Formulated"], jargon: ["go-to-market", "operating model", "value chain", "hypothesis-driven", "stakeholder alignment", "cost optimization", "market entry", "due diligence", "scalability", "TAM", "synergies", "framework", "KPIs", "ROI"] },
  marketing: { label: "Marketing & Brand", verbs: ["Launched", "Positioned", "Amplified", "Segmented", "Drove", "Converted", "Orchestrated", "Spearheaded"], jargon: ["brand equity", "funnel", "CAC", "LTV", "engagement", "positioning", "GTM", "conversion rate", "campaign", "CTR", "reach", "SEO", "retention", "A/B testing", "ROAS"] },
  finance: { label: "Finance & Investment Banking", verbs: ["Modeled", "Valued", "Forecasted", "Structured", "Underwrote", "Optimized", "Audited", "Hedged"], jargon: ["DCF", "NPV", "IRR", "EBITDA", "working capital", "valuation", "due diligence", "liquidity", "portfolio", "cash flow", "ROE", "P&L", "WACC", "comps", "basis points"] },
  operations: { label: "Operations & Supply Chain", verbs: ["Streamlined", "Optimized", "Automated", "Reengineered", "Standardized", "Coordinated", "Reduced", "Scaled"], jargon: ["throughput", "lead time", "cycle time", "OEE", "lean", "Six Sigma", "bottleneck", "SKU", "inventory turns", "SLA", "TAT", "root-cause", "Kaizen", "JIT", "capacity utilization", "defect rate"] },
  sales: { label: "Sales & Business Development", verbs: ["Closed", "Negotiated", "Secured", "Prospected", "Onboarded", "Upsold", "Expanded", "Drove"], jargon: ["pipeline", "quota", "conversion", "CRM", "lead generation", "account", "churn", "upsell", "cross-sell", "deal cycle", "win rate", "territory", "ARR", "prospecting"] },
  product: { label: "Product Management", verbs: ["Shipped", "Prioritized", "Defined", "Launched", "Iterated", "Validated", "Scoped", "Roadmapped"], jargon: ["roadmap", "MVP", "user stories", "backlog", "sprint", "A/B testing", "retention", "activation", "north-star metric", "PRD", "user research", "feature adoption", "NPS", "agile"] },
  data: { label: "Data & Analytics", verbs: ["Engineered", "Modeled", "Automated", "Analyzed", "Visualized", "Predicted", "Optimized", "Deployed"], jargon: ["pipeline", "ETL", "regression", "classification", "dashboard", "Power BI", "SQL", "feature engineering", "A/B testing", "precision", "recall", "forecasting", "KPIs", "data-driven", "throughput"] },
  tech: { label: "Technology & Software", verbs: ["Built", "Engineered", "Architected", "Automated", "Deployed", "Optimized", "Integrated", "Scaled"], jargon: ["OOP", "API", "CI/CD", "microservices", "latency", "throughput", "scalability", "backend", "pipeline", "cloud", "REST", "caching", "refactored", "uptime", "containerized"] },
  hr: { label: "HR & People", verbs: ["Recruited", "Onboarded", "Facilitated", "Mentored", "Streamlined", "Coordinated", "Championed", "Retained"], jargon: ["talent acquisition", "onboarding", "engagement", "attrition", "retention", "L&D", "DEI", "performance management", "headcount", "culture", "employer branding", "upskilling", "stakeholder"] },
  sustainability: { label: "Sustainability & ESG", verbs: ["Spearheaded", "Mobilized", "Implemented", "Reduced", "Championed", "Scaled", "Engaged", "Drove"], jargon: ["ESG", "carbon footprint", "circular economy", "decarbonization", "net-zero", "renewable", "impact", "CSR", "life-cycle", "emissions", "waste reduction", "stakeholder", "compliance"] },
  custom: { label: "Custom (your own jargon)", verbs: [], jargon: [] },
};

const FRAMEWORKS: Record<string, { name: string; desc: string }> = {
  ras: { name: "RAS (Result–Action–Situation)", desc: "Lead with the quantified RESULT/impact, then the ACTION taken, then a brief SITUATION/context — one line." },
  star: { name: "STAR (Situation–Task–Action–Result)", desc: "Compress STAR into one line: brief situation/task, the action, ending on the quantified result." },
};

const PROVIDERS: Record<string, any> = {
  gemini: { label: "Google Gemini", free: true, model: "gemini-2.5-flash", kind: "gemini" },
  groq: { label: "Groq · Llama 3.3 70B", free: true, model: "llama-3.3-70b-versatile", kind: "openai", url: "https://api.groq.com/openai/v1/chat/completions", json: true },
  cerebras: { label: "Cerebras", free: true, model: "llama-3.3-70b", kind: "openai", url: "https://api.cerebras.ai/v1/chat/completions" },
  mistral: { label: "Mistral", free: true, model: "mistral-large-latest", kind: "openai", url: "https://api.mistral.ai/v1/chat/completions", json: true },
  openrouter: { label: "OpenRouter · free", free: true, model: "meta-llama/llama-3.3-70b-instruct:free", kind: "openai", url: "https://openrouter.ai/api/v1/chat/completions", extra: { "HTTP-Referer": "http://localhost", "X-Title": "CV Pointer Studio" } },
  openai: { label: "OpenAI · ChatGPT", free: false, model: "gpt-4o-mini", kind: "openai", url: "https://api.openai.com/v1/chat/completions", json: true },
  anthropic: { label: "Anthropic · Claude", free: false, model: "claude-sonnet-4-20250514", kind: "anthropic", url: "https://api.anthropic.com/v1/messages" },
};

const BEST_ORDER = ["gemini", "groq", "cerebras", "mistral", "openrouter", "openai", "anthropic"];
const WEAK: Record<string, string> = { "responsible for": "Led", "worked on": "Engineered", "helped": "Enabled", "assisted in": "Drove", "assisted with": "Supported", "in charge of": "Led", "took care of": "Managed", "was part of": "Contributed to", "participated in": "Drove", "involved in": "Drove", "worked with": "Partnered with", "dealt with": "Resolved", "made": "Built", "did": "Executed", "used": "Leveraged", "handled": "Managed", "got": "Secured" };
const FILLERS = ["very", "really", "successfully", "effectively", "efficiently", "various", "numerous", "a lot of", "in order to", "basically", "actually", "quite", "several", "multiple"];

/* ============================ pure helpers ============================ */
const plain = (h: string) => String(h).replace(/<[^>]+>/g, "").replace(/\*{1,2}|__/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
const DANGLING = /(?:\b(?:by|and|to|of|with|the|a|an|for|in|on|at|as|via|which|that|from|into|per)\b|[,&\-–])\s*\.?\s*$/i;
function isComplete(t: string) { t = (t || "").trim(); if (t.length < 12) return false; if (DANGLING.test(t)) return false; if (/\b(?:by|to|of|for|with)\s+\d*\s*$/i.test(t)) return false; return /[A-Za-z0-9%)\.]$/.test(t); }

function stripRedundantAcronyms(text: string) {
  return String(text).replace(/\b([A-Za-z][A-Za-z'&.\- ]+?)\s*\(([A-Za-z]{2,6})\)/g, (m, words, abbr) => {
    const init = String(words).trim().split(/\s+/).map((w: string) => (w[0] || "").toUpperCase()).join("");
    const A = String(abbr).toUpperCase().replace(/[^A-Z]/g, "");
    return (init === A || init.endsWith(A)) ? String(words).trim() : m;
  });
}

function applyBold(text: string, spans: string[]) {
  let out = text;
  (spans || []).filter(Boolean).sort((a, b) => b.length - a.length).forEach((s) => {
    const i = out.toLowerCase().indexOf(s.toLowerCase());
    if (i >= 0 && out.slice(Math.max(0, i - 3), i).indexOf("<") < 0) out = out.slice(0, i) + "<b>" + out.slice(i, i + s.length) + "</b>" + out.slice(i + s.length);
  });
  return out;
}

function normalizeBold(text: string, spans: string[]) {
  let t = String(text).replace(/<\/?strong>/gi, (m) => (m[1] === "/" ? "</b>" : "<b>"))
    .replace(/\*\*([^*]+?)\*\*/g, "<b>$1</b>").replace(/__([^_]+?)__/g, "<b>$1</b>")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<b>$2</b>").replace(/[*_]+/g, "");
  if (!/<b>/i.test(t) && spans && spans.length) t = applyBold(t, spans);
  return t.replace(/<b>\s*<b>/gi, "<b>").replace(/<\/b>\s*<\/b>/gi, "</b>");
}

function boldFraction(html: string) {
  const total = plain(html).replace(/\s+/g, "").length || 1;
  const b = (html.match(/<b>([\s\S]*?)<\/b>/gi) || []).map((m) => m.replace(/<[^>]+>/g, "")).join("").replace(/\s+/g, "").length;
  return b / total;
}

function capBold(html: string, maxFrac: number, locked: string[]) {
  let h = html, guard = 0;
  while (boldFraction(h) > maxFrac && guard++ < 8) {
    const runs = [...h.matchAll(/<b>([\s\S]*?)<\/b>/gi)] as any[]; if (runs.length <= 1) break;
    const lk = locked.map((s) => s.toLowerCase());
    const cand = runs.filter((r) => !/\d/.test(r[1]) && !lk.some((l) => l && r[1].toLowerCase().includes(l)));
    if (!cand.length) break;
    const lg = cand.reduce((a, b) => (b[1].length > a[1].length ? b : a));
    h = h.slice(0, lg.index) + lg[1] + h.slice(lg.index + lg[0].length);
  }
  return h;
}

const stripEndPeriod = (html: string) => String(html).replace(/\s*\.\s*$/, "").replace(/\.\s*(<\/b>)\s*$/, "$1");

function ensureLockedBold(html: string, locked: string[]) {
  locked.forEach((w) => { const re = new RegExp("<b>[^<]*" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); if (!re.test(html)) html = applyBold(html, [w]); });
  return html;
}

const hasLocked = (t: string, locked: string[]) => { const low = (t || "").toLowerCase(); return locked.every((w) => low.includes(w.toLowerCase())); };

function lenientJSON(raw: string) {
  const t = String(raw).replace(/^```(?:json)?|```$/gm, "").trim();
  try { 
    return JSON.parse(t); 
  } catch (e) { 
    const m = t.match(/\{[\s\S]*\}/); 
    if (!m) throw new Error("no JSON in reply"); 
    return JSON.parse(m[0]); 
  }
}

const parseVariants = (raw: string) => (lenientJSON(raw).variants || []).map((v: any) => ({ text: String(v.text || "").trim(), bold: v.bold || [] }));

function localDefense(text: string, ctx: string) {
  const flags: string[] = [];
  const nums = (text.match(/\d[\d,\.]*\s?%?/g) || []).map((s) => s.replace(/[,\s]/g, ""));
  const c = (ctx || "").replace(/[,\s]/g, "");
  nums.forEach((n) => { const bare = n.replace("%", ""); if (bare.length >= 2 && !c.includes(bare)) flags.push("“" + n + "” isn’t in your project doc — be ready to back it."); });
  const sup = text.match(/\b(best|world-?class|revolutionary|cutting-edge|unprecedented|massive|huge|amazing)\b/gi) || [];
  if (sup.length) flags.push("Vague superlative: " + [...new Set(sup.map((s) => s.toLowerCase()))].join(", ") + " — swap for a number.");
  return flags;
}

function lint(text: string, jargon: string[]) {
  const low = " " + text.toLowerCase() + " ";
  const swaps = Object.keys(WEAK).filter((w) => low.includes(" " + w + " ") || low.includes(" " + w + ",")).map((w) => ({ from: w, to: WEAK[w] }));
  const fillers = FILLERS.filter((f) => low.includes(" " + f + " "));
  const have = text.toLowerCase();
  const jar = jargon.filter((j) => !have.includes(j.toLowerCase())).slice(0, 6);
  return { swaps, fillers, jar };
}

function qtier(a: any) { if (!a.complete) return 9; if (a.pct > OVER_MAX) return 8; if (a.pct < SOFT_LO) return 7; if (a.pct >= ACCEPT_LO && a.pct <= ACCEPT_HI) return 0; if (a.pct >= SOFT_LO && a.pct < ACCEPT_LO) return 1; return 2; }

function rank(pool: any[]) {
  const uniq: any[] = [], seen = new Set<string>();
  for (const a of pool) { const k = plain(a.html).toLowerCase(); if (!seen.has(k)) { seen.add(k); uniq.push(a); } }
  return uniq.sort((a, b) => qtier(a) - qtier(b) || Math.abs(0.99 - a.pct) - Math.abs(0.99 - b.pct)).slice(0, 6);
}

const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* ---------- prompt builders ---------- */
const SKIM = '"<b>Analyzed ₹6,372 Cr procurement spend</b> across 6,300+ purchase orders & <b>408 SKUs</b> spanning 5 years, <b>161 suppliers</b>" → reading only the bold gives "Analyzed ₹6,372 Cr procurement spend … 408 SKUs … 161 suppliers".';

function qualityRules(verbs: string[], jargon: string[], fw: any, locked: string[], targets: number[]) {
  return `QUALITY BAR (most important — quality beats exact length):
- A COMPLETE, grammatical, LOGICAL sentence a recruiter finds impressive: clear ACTION → IMPACT with a real KPI. Never pad or leave a clause hanging to hit a length.
- Frame around BUSINESS IMPACT / VALUE — what changed for the business (cost, revenue, efficiency, quality, risk, faster/better decisions) — not just the task. On a CV the value delivered matters most.
- Strong past-tense verb first (prefer: ${verbs.join(", ") || "strong verbs"}); weave truthful jargon (${jargon.join(", ") || "—"}); cut filler.
- NEVER write an abbreviation in parentheses after its full form (write "quality assurance" OR "QA", never both).
- No full stop at the end (CV bullets never end with a period).
- Structure per ${fw.name}: ${fw.desc}

BOLDING (bold is a SKIM LAYER): bold ONLY the action + the impact (verb + headline metric/scope) so the bold words READ ALONE still make sense, e.g. ${SKIM} ~30–45% bold, never over half. <b></b> only, never markdown ** or __.
${locked.length ? "- PRIORITY words — include EACH somewhere and BOLD it (anywhere, need NOT be adjacent), rephrase freely around them: " + locked.join(", ") : ""}

LENGTH: fill 95–103% of the line but ALWAYS prefer UNDER 100% (ideally 97–100%); never exceed 103%. Target ~${targets.join(", ")} characters respectively.`;
}

function buildPrompt(o: any) {
  return `You rewrite ONE résumé bullet ("pointer") for a one-line IIM Mumbai placement CV in the ${o.dLabel} domain.
Give ${NVAR} strong, DISTINCT rewrites of the SAME achievement (keep its core fact + metric).

${qualityRules(o.verbs, o.jargon, o.fw, o.locked, o.targets)}

Return STRICT JSON only: {"variants":[{"text":"...","bold":["action phrase","impact/metric"]}]} — exactly ${NVAR} variants.

ORIGINAL POINTER: ${plain(o.pointer)}
${o.feedback ? "FEEDBACK: " + o.feedback + "\n" : ""}
CONTEXT (the only source of facts):
${String(o.ctx).slice(0, 7000)}`;
}

function minePrompt(o: any) {
  const focus = o.kind === "achievements"
    ? "ACHIEVEMENTS = quantified OUTCOMES / impact / results (%, time saved, revenue, adoption, throughput)."
    : "PROJECT DETAILS = the ACTIONS / methods / technical scope you executed (what you built and how).";
  return `From the CONTEXT, write ${o.n} DISTINCT, high-quality ${o.kind} for a one-line IIM ${o.dLabel} placement CV.
${focus}
Each must be a DIFFERENT point — no overlap. ${o.kind === "achievements" ? "Each MUST carry a real metric." : "Prefer a real metric where truthful."}

${qualityRules(o.verbs, o.jargon, o.fw, o.locked, o.targets)}
${o.existing && o.existing.length ? "- Do NOT repeat these already-made points: " + o.existing.map((s: string) => '"' + s.slice(0, 38) + '"').join("; ") : ""}
${o.feedback ? "FEEDBACK: " + o.feedback + "\n" : ""}
Return STRICT JSON only: {"variants":[{"text":"...","bold":["action phrase","impact/metric"]}]} with exactly ${o.n} items.

CONTEXT (the only source of facts):
${String(o.ctx).slice(0, 7000)}`;
}

function defensePrompt(bullets: string[], ctx: string) {
  return `You are a strict placement-interview defensibility coach for résumé bullets.
Flag a bullet if: (a) a number/metric is NOT supported by the CONTEXT, (b) a claim is implausible/illogical (e.g. >100% reduction, inflated multiplier, vague "10x"), or (c) it uses hollow superlatives with no proof.
For each PROBLEM bullet give a SHORT reason and a defensible rewrite true to the CONTEXT.
Return STRICT JSON only: {"flags":[{"bullet":"...","issue":"...","fix":"..."}]}. Omit fine bullets; if all fine return {"flags":[]}.

BULLETS:
${bullets.map((b, i) => i + 1 + ". " + b).join("\n")}

CONTEXT:
${(ctx || "").slice(0, 7000)}`;
}

/* ---------- model calls ---------- */
async function callOnce(P: any, key: string, model: string, prompt: string) {
  let res: any, raw = "";
  if (P.kind === "gemini") {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.55, responseMimeType: "application/json" } }) });
    const d = await res.json().catch(() => ({})); if (!res.ok) throw new Error(d?.error?.message || "HTTP " + res.status); raw = d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (P.kind === "anthropic") {
    res = await fetch(P.url, { method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model, max_tokens: 1400, messages: [{ role: "user", content: prompt }] }) });
    const d = await res.json().catch(() => ({})); if (!res.ok) throw new Error(d?.error?.message || "HTTP " + res.status); raw = d?.content?.[0]?.text || "";
  } else {
    const body: any = { model, temperature: 0.55, messages: [{ role: "user", content: prompt }] }; if (P.json) body.response_format = { type: "json_object" };
    res = await fetch(P.url, { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Authorization: "Bearer " + key }, P.extra || {}), body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({})); if (!res.ok) throw new Error(d?.error?.message || d?.error || "HTTP " + res.status); raw = d?.choices?.[0]?.message?.content || "";
  }
  return raw;
}

/* ============================ component ============================ */
type Cand = { html: string; w: number; avail: number; pct: number; fits: boolean; complete?: boolean; trimmed?: boolean };

export default function PointerStudioDashboard() {
  const [domain, setDomain] = useState("data");
  const [framework, setFramework] = useState("ras");
  const [section, setSection] = useState<"det" | "por">("det");
  const [providerSel, setProviderSel] = useState("best");
  const [ctx, setCtx] = useState(`Project: ML-Based Automated Defect Detection System for Manufacturing Quality Control (SVR Degree College, 7 weeks).
Built and tuned a CNN on 15K+ annotated manufacturing images to automate defect detection.
Implemented agile model tuning with a closed-loop feedback cycle, improving defect traceability by 45%.
Boosted OEE by 25% by cutting inspection delays 40% across production stages.
Cut defect escape rate by 30% via real-time ML inspection; reduced data-prep time 35% with semi-automated annotation.`);
  const [locked, setLocked] = useState("");
  const [keys, setKeys] = useState<any>({});
  const [jar, setJar] = useState<any>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [heroPct, setHeroPct] = useState(0);
  const [heroPx, setHeroPx] = useState("");
  const [chips, setChips] = useState<any>({ swaps: [], fillers: [], jar: [] });
  const [defense, setDefense] = useState<any[]>([]);
  const [cands, setCands] = useState<Cand[]>([]);
  const [mined, setMined] = useState<Cand[]>([]);
  const [mineKind, setMineKind] = useState<"details" | "achievements">("details");
  const [mineN, setMineN] = useState(5);
  const [log, setLog] = useState("");
  const [apiCalls, setApiCalls] = useState(0);
  const [busy, setBusy] = useState<"" | "rewrite" | "mine" | "defense">("");
  const [activeProv, setActiveProv] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [showJar, setShowJar] = useState(false);
  const [ready, setReady] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false); // New Upgrade UI State

  const pointerRef = useRef<HTMLDivElement>(null);
  const detCell = useRef<HTMLTableCellElement>(null), detProbe = useRef<HTMLSpanElement>(null);
  const porCell = useRef<HTMLTableCellElement>(null), porProbe = useRef<HTMLSpanElement>(null);
  const fixesRef = useRef<string[]>([]);
  const apiCallsRef = useRef(0);
  const activeRef = useRef<string | null>(null);

  /* persistence (SSR-guarded) */
  useEffect(() => {
    try {
      setKeys(JSON.parse(localStorage.getItem("cvps_keys") || "{}"));
      setJar(JSON.parse(localStorage.getItem("cvps_jar") || "{}"));
      setSaved(JSON.parse(localStorage.getItem("cvps_saved") || "[]"));
      const p = JSON.parse(localStorage.getItem("cvps_prefs") || "{}");
      if (p.domain) setDomain(p.domain); if (p.framework) setFramework(p.framework); if (p.provider) setProviderSel(p.provider);
    } catch (e) {}
    const done = () => { setReady(true); sync(); };
    if ((document as any).fonts?.ready) (document as any).fonts.ready.then(done).catch(done); else done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { try { localStorage.setItem("cvps_keys", JSON.stringify(keys)); } catch (e) {} }, [keys]);
  useEffect(() => { try { localStorage.setItem("cvps_jar", JSON.stringify(jar)); } catch (e) {} }, [jar]);
  useEffect(() => { try { localStorage.setItem("cvps_saved", JSON.stringify(saved)); } catch (e) {} }, [saved]);
  useEffect(() => { try { localStorage.setItem("cvps_prefs", JSON.stringify({ domain, framework, provider: providerSel })); } catch (e) {} }, [domain, framework, providerSel]);

  useEffect(() => { 
    if (pointerRef.current && !pointerRef.current.innerHTML.trim()) {
      pointerRef.current.innerHTML = "Improved defect traceability by 45% through agile model tuning and enhanced closed-loop feedback mechanism design"; 
    }
    setTimeout(sync, 30); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setCtx(event.target.result as string);
    };
    reader.readAsText(file);
  };

  /* jargon / keys helpers */
  const activeJargon = () => { const d = DOMAINS[domain], o = jar[domain] || {}; return { verbs: (o.verbs && o.verbs.length ? o.verbs : d.verbs) || [], jargon: (o.jargon && o.jargon.length ? o.jargon : d.jargon) || [] }; };
  const lockedArr = () => locked.split(",").map((s) => s.trim()).filter(Boolean);
  const rawKey = (id: string) => (keys[id]?.key) || "";
  const keysOf = (id: string) => rawKey(id).split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
  const modelOf = (id: string) => (keys[id]?.model || "").trim() || PROVIDERS[id].model;
  const hasKey = (id: string) => keysOf(id).length > 0;
  const keyIdx = useRef<any>({});

  /* measurement via hidden replica */
  const availOf = (sec: string) => { const cell = sec === "det" ? detCell.current : porCell.current; return cell ? cell.clientWidth - CELL_PADL - CELL_PADR - INDENT : 600; };
  const textWidth = (html: string, sec: string) => { const p = sec === "det" ? detProbe.current : porProbe.current; if (!p) return 0; p.innerHTML = html; return p.getBoundingClientRect().width; };
  const fitOf = (html: string, sec: string): Cand => { const w = textWidth(html, sec), avail = availOf(sec) || 1; return { html, w, avail, pct: w / avail, fits: w <= avail }; };
  
  function safeTrim(html: string, sec: string): Cand | null {
    let cur = html;
    for (let i = 0; i < 4; i++) {
      const r = fitOf(cur, sec);
      if (r.pct <= ACCEPT_HI) { const p = plain(cur); return isComplete(p) && /\d/.test(p) ? { ...r, html: cur, trimmed: i > 0 } : null; }
      const li = cur.lastIndexOf(","); if (li < 24) return null; let cut = cur.slice(0, li).replace(/\s+$/, "");
      const op = (cut.match(/<b>/g) || []).length, cl = (cut.match(/<\/b>/g) || []).length; if (op > cl) cut += "</b>"; cur = cut;
    }
    return null;
  }

  function mk(text: string, bold: string[], sec: string): Cand {
    const lk = lockedArr();
    let html = stripEndPeriod(capBold(ensureLockedBold(normalizeBold(stripRedundantAcronyms(text), bold), lk), BOLD_HARD, lk));
    let r = fitOf(html, sec); if (r.pct > OVER_MAX) { const s = safeTrim(html, sec); if (s) r = s; }
    const p = plain(r.html); r.complete = isComplete(p) && hasLocked(p, lk); return r;
  }

  const logln = (m: string) => setLog((L) => (L + "\n" + m).trim());

  /* provider failover with Gemini key-pool rotation */
  function currentChain() {
    if (providerSel !== "best") return hasKey(providerSel) ? [providerSel] : [];
    let chain = BEST_ORDER.filter(hasKey);
    if (activeRef.current && chain.includes(activeRef.current)) chain = [activeRef.current, ...chain.filter((x) => x !== activeRef.current)];
    return chain;
  }

  async function callModel(id: string, prompt: string) {
    const kl = keysOf(id), model = modelOf(id); if (!kl.length) throw new Error("no key");
    const start = keyIdx.current[id] || 0; let err: any;
    for (let n = 0; n < kl.length; n++) {
      const ki = (start + n) % kl.length;
      try { apiCallsRef.current++; setApiCalls(apiCallsRef.current); const raw = await callOnce(PROVIDERS[id], kl[ki], model, prompt); keyIdx.current[id] = ki; if (kl.length > 1) logln("     ✓ " + PROVIDERS[id].label + " · key #" + (ki + 1) + "/" + kl.length); return raw; }
      catch (e: any) { err = e; if (kl.length > 1) logln("     ✕ key #" + (ki + 1) + "/" + kl.length + ": " + e.message + " → next key"); }
    }
    throw err;
  }

  async function smartRaw(prompt: string) {
    const chain = currentChain(); if (!chain.length) throw new Error('No API key set — open “🔑 API keys”.');
    let err: any;
    for (const id of chain) {
      try { 
        logln("   → " + PROVIDERS[id].label + (PROVIDERS[id].free ? " (free)" : "")); 
        const raw = await callModel(id, prompt); 
        activeRef.current = id; 
        setActiveProv(id); 
        return raw; 
      }
      catch (e: any) { 
        err = e; 
        logln("     ✕ " + PROVIDERS[id].label + ": " + e.message + " — failing over"); 
        if (id === activeRef.current) { 
          activeRef.current = null; 
          setActiveProv(null); 
        } 
      }
    }
    throw err || new Error("all providers failed");
  }

  /* hero + linter sync */
  function sync() {
    if (!pointerRef.current) return;
    const r = fitOf(pointerRef.current.innerHTML, section);
    setHeroPct(Math.round(r.pct * 100)); setHeroPx(r.w.toFixed(0) + " / " + r.avail.toFixed(0) + " px");
    setChips(lint(plain(pointerRef.current.innerHTML), activeJargon().jargon));
  }

  useEffect(() => { 
    sync(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [section, domain, locked]);

  function setPointer(html: string) { if (pointerRef.current) { pointerRef.current.innerHTML = html; sync(); } }
  
  function applySwap(from: string, to: string) {
    if (!pointerRef.current) return;
    const re = new RegExp("(^|[^\\w<])(" + from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?=[\\s,.]|$)", "i");
    pointerRef.current.innerHTML = pointerRef.current.innerHTML.replace(re, (m, pre, match) => pre + (/^[A-Z]/.test(match) ? to.charAt(0).toUpperCase() + to.slice(1) : to.charAt(0).toLowerCase() + to.slice(1)));
    sync();
  }

  function removeWord(w: string) {
    if (!pointerRef.current) return;
    const re = new RegExp("\\s*(^|[^\\w<])(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?=[\\s,.]|$)", "i");
    pointerRef.current.innerHTML = pointerRef.current.innerHTML.replace(re, (m, pre) => (pre === " " || pre === "" ? " " : pre)).replace(/\s{2,}/g, " ");
    sync();
  }

  function lockSelection() {
    const s = (window.getSelection && window.getSelection()?.toString() || "").trim().replace(/[.,;]+$/, "");
    if (!s) return; const cur = lockedArr(); if (!cur.some((w) => w.toLowerCase() === s.toLowerCase())) setLocked([...cur, s].join(", "));
  }

  /* rewrite (only-passing, prefer <100) */
  async function rewrite() {
    if (!pointerRef.current) return;
    const pointer = pointerRef.current.innerHTML.trim(); if (!plain(pointer).trim()) return alert("Type a pointer first.");
    if (!ctx.trim()) return alert("Paste the project context first.");
    
    // Check Backend Limits BEFORE running AI
    try {
      const savedKey = localStorage.getItem('cv_builder_key');
      const CLOUD_API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://aravindtupakula.pythonanywhere.com';
      const res = await fetch(`${CLOUD_API_URL}/api/usage/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: savedKey })
      });
      const data = await res.json();
      
      if (!data.allowed && data.error === "LIMIT_REACHED") {
        setShowUpgrade(true);
        return;
      }
    } catch (err) {
      console.warn("Usage tracking bypassed or offline");
    }

    setBusy("mine"); setLog(""); apiCallsRef.current = 0; setApiCalls(0); activeRef.current = null; setCands([]);
    const sec = section; let ppc = Math.max(fitOf(pointer, sec).w / Math.max(plain(pointer).length, 1), 4);
    const pool: Cand[] = [], keep: Cand[] = [], seen = new Set<string>(); let feedback = ""; const TARGET = 4;
    const aj = activeJargon(); const targets = () => REQ_FILLS.map((f) => Math.round(availOf(sec) * f / ppc));
    try {
      for (let round = 1; round <= MAXROUNDS; round++) {
        logln(`round ${round}: line=${availOf(sec).toFixed(0)}px ${feedback ? "[" + feedback + "]" : ""}`);
        const variants = parseVariants(await smartRaw(buildPrompt({ dLabel: DOMAINS[domain].label, verbs: aj.verbs, jargon: aj.jargon, fw: FRAMEWORKS[framework], locked: lockedArr(), targets: targets(), pointer, ctx, feedback })));
        const ws: number[] = [], ls: number[] = [];
        for (const v of variants) {
          const r = mk(v.text, v.bold, sec); ws.push(r.w); ls.push(plain(r.html).length); pool.push(r);
          const pass = !!r.complete && r.pct >= SOFT_LO && r.pct <= OVER_MAX, key = plain(r.html).toLowerCase().slice(0, 60);
          logln(`   ${(r.pct * 100).toFixed(1)}%  ${pass ? (r.pct <= ACCEPT_HI ? "✓ keep" : "~ over-ok") : (r.complete ? (r.pct < SOFT_LO ? "· short" : "✕ too long") : "✕ incomplete")}  ${plain(r.html).slice(0, 40)}`);
          if (pass && !seen.has(key)) { seen.add(key); keep.push(r); }
        }
        const under = keep.filter((a) => a.pct <= ACCEPT_HI).length;
        if (under >= TARGET || keep.length >= TARGET + 1) { logln(`✓ ${keep.length} passing (${under} under 100%)`); break; }
        const ratios = ws.map((w, i) => w / Math.max(ls[i], 1)).filter((x) => x > 0); if (ratios.length) ppc = median(ratios);
        const want = Math.max(1, TARGET - under);
        const tooLong = pool.filter((a) => a.pct > OVER_MAX).sort((a, b) => a.pct - b.pct)[0], inc = pool.find((a) => !a.complete), short = pool.filter((a) => a.complete && a.pct < SOFT_LO).sort((a, b) => b.pct - a.pct)[0];
        if (tooLong) feedback = `too long — give ${want} more, each ~${Math.ceil((tooLong.w - availOf(sec) * 0.99) / ppc)} chars shorter, complete sentence UNDER 100%, keep the metric`;
        else if (inc) feedback = `some got cut off — give ${want} more COMPLETE sentences at 97–100%`;
        else if (short) feedback = `give ${want} more, ~${Math.ceil((availOf(sec) * 0.99 - short.w) / ppc)} chars longer with real detail, complete`;
        else feedback = `give ${want} more complete options at 97–100% (prefer under 100%)`;
      }
      let show = rank(keep);
      if (!show.length) { show = pool.filter((a) => a.complete && a.pct <= OVER_MAX).sort((a, b) => Math.abs(0.99 - a.pct) - Math.abs(0.99 - b.pct)).slice(0, 3); if (!show.length) show = pool.filter((a) => a.complete).sort((a, b) => a.pct - b.pct).slice(0, 3); }
      setCands(show); if (show[0] && show[0].complete && show[0].pct >= SOFT_LO && show[0].pct <= OVER_MAX) setPointer(show[0].html);
    } catch (e: any) { logln("⚠ " + e.message); }
    setBusy("");
  }

  /* miner (all N at once) */
  async function mine() {
    if (!ctx.trim()) return alert("Paste the project context first.");
    setBusy("mine"); setLog(""); apiCallsRef.current = 0; setApiCalls(0); activeRef.current = null; setMined([]);
    const sec = section, count = Math.max(1, Math.min(10, mineN)); let ppc = 6.2;
    const good: Cand[] = [], seen = new Set<string>(); let feedback = ""; const aj = activeJargon();
    try {
      for (let round = 1; round <= 3 && good.length < count; round++) {
        const need = count - good.length, n = need + (round === 1 ? 1 : 0);
        const targets = Array.from({ length: n }, (_, i) => Math.round(availOf(sec) * REQ_FILLS[i % REQ_FILLS.length] / ppc));
        logln(`mine ${mineKind} · round ${round}: need ${need}`);
        const variants = parseVariants(await smartRaw(minePrompt({ dLabel: DOMAINS[domain].label, verbs: aj.verbs, jargon: aj.jargon, fw: FRAMEWORKS[framework], locked: lockedArr(), targets, kind: mineKind, n, existing: [...seen], feedback, ctx })));
        const ws: number[] = [], ls: number[] = [];
        for (const v of variants) {
          const r = mk(v.text, v.bold, sec); ws.push(r.w); ls.push(plain(r.html).length);
          const key = plain(r.html).toLowerCase().slice(0, 60); if (seen.has(key)) continue; seen.add(key);
          logln(`   ${(r.pct * 100).toFixed(1)}%  ${r.complete ? (r.fits ? "✓" : "over") : "incomplete"}  ${plain(r.html).slice(0, 44)}`);
          if (r.complete && r.pct >= SOFT_LO && r.pct <= OVER_MAX) good.push(r);
        }
        const ratios = ws.map((w, i) => w / Math.max(ls[i], 1)).filter((x) => x > 0); if (ratios.length) ppc = median(ratios);
        feedback = `give ${count - good.length} more DISTINCT, complete ${mineKind}; each a logical sentence with a real KPI, 97–100% (under 100%).`;
      }
      setMined(good.sort((a, b) => qtier(a) - qtier(b) || Math.abs(0.99 - a.pct) - Math.abs(0.99 - b.pct)).slice(0, count));
    } catch (e: any) { logln("⚠ " + e.message); }
    setBusy("");
  }

  /* defensibility */
  async function runDefense(bullets: string[]) {
    setBusy("defense"); setDefense([{ issue: "checking…", fix: "", local: true }]);
    try { const flags = (lenientJSON(await smartRaw(defensePrompt(bullets, ctx))).flags) || []; fixesRef.current = flags.map((f: any) => f.fix); setDefense(flags.length ? flags : [{ ok: true }]); }
    catch (e: any) { setDefense([{ issue: "coach unavailable: " + e.message, fix: "" }]); }
    setBusy("");
  }

  /* saved library */
  function savePointer() { if (!pointerRef.current) return; const html = stripEndPeriod(pointerRef.current.innerHTML.trim()); if (!plain(html).trim()) return; if (saved.some((s) => plain(s).toLowerCase() === plain(html).toLowerCase())) return; setSaved([...saved, html]); }
  const copy = (t: string) => navigator.clipboard?.writeText(t);
  const copyAllSaved = (fmt: string) => copy(fmt === "json" ? JSON.stringify(saved.map((h) => ({ id: String(Math.random()), text: h, hidden: false })), null, 2) : saved.join("\n"));

  const aj = activeJargon();
  const fillColor = (p: number) => (p > 103 ? "#ef4444" : p > 100 ? "#f59e0b" : p >= 97 ? "#22c55e" : p >= 95 ? "#f59e0b" : "#3b82f6");
  const fitTxt = (p: number) => (p > 103 ? "too long ✕" : p > 100 ? "just over ✓" : "fits ✓");

  return (
    <div className="cps-wrapper">

      {/* hidden ruler replica — measures the exact CV cell width */}
      <div aria-hidden className="cps-cv" style={{ position: "absolute", left: -99999, top: 0, visibility: "hidden", width: PAGE_MM + "mm", border: PAGE_BORDER + "px solid #ccc", padding: `16px ${PAD_MM}mm 3mm ${PAD_MM}mm`, fontSize: FS, lineHeight: LH }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup><col style={{ width: LEFTCOL + "%" }} /><col style={{ width: 100 - LEFTCOL + "%" }} /></colgroup>
          <tbody><tr>
            <td style={{ border: CELL_BORDER + "px solid #000", padding: "0 4px" }}>Project Details</td>
            <td ref={detCell} style={{ border: CELL_BORDER + "px solid #000", verticalAlign: "top", padding: `2.5px ${CELL_PADR}px 2.5px ${CELL_PADL}px` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ paddingLeft: INDENT, position: "relative", minHeight: FS }}><span ref={detProbe} style={{ position: "absolute", left: INDENT, top: 0, whiteSpace: "nowrap" }} /></div></div>
            </td>
          </tr></tbody>
        </table>
      </div>
      <div aria-hidden className="cps-cv" style={{ position: "absolute", left: -99999, top: 400, visibility: "hidden", width: PAGE_MM + "mm", border: PAGE_BORDER + "px solid #ccc", padding: `16px ${PAD_MM}mm 3mm ${PAD_MM}mm`, fontSize: FS, lineHeight: LH }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup><col style={{ width: LEFTCOL + "%" }} /><col style={{ width: 100 - LEFTCOL - YEARCOL + "%" }} /><col style={{ width: YEARCOL + "%" }} /></colgroup>
          <tbody><tr>
            <td style={{ border: CELL_BORDER + "px solid #000", padding: "0 4px" }}>Role</td>
            <td ref={porCell} style={{ border: CELL_BORDER + "px solid #000", verticalAlign: "top", padding: `2.5px ${CELL_PADR}px 2.5px ${CELL_PADL}px` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ paddingLeft: INDENT, position: "relative", minHeight: FS }}><span ref={porProbe} style={{ position: "absolute", left: INDENT, top: 0, whiteSpace: "nowrap" }} /></div></div>
            </td>
            <td style={{ border: CELL_BORDER + "px solid #000", padding: "2.5px 4px" }} />
          </tr></tbody>
        </table>
      </div>

      <div className="cps-container">
        <style>{CPS_CSS}</style>
        <div className="cps-row cps-head">
          <b>✨ CV Pointer Studio</b>
          <span className="cps-hint">domain-aware · multi-model · 95–103% fit</span>
        </div>

        {/* controls */}
        <div className="cps-row" style={{ gap: 10, marginTop: 16 }}>
          <select className="cps-in" value={domain} onChange={(e) => setDomain(e.target.value)}>
            {Object.keys(DOMAINS).map((k) => <option key={k} value={k}>{DOMAINS[k].label}</option>)}
          </select>
          <div className="cps-seg">
            {(["ras", "star"] as const).map((f) => <button key={f} className={framework === f ? "on" : ""} onClick={() => setFramework(f)}>{f.toUpperCase()}</button>)}
          </div>
          <div className="cps-seg">
            <button className={section === "det" ? "on" : ""} onClick={() => setSection("det")}>Int/Project</button>
            <button className={section === "por" ? "on" : ""} onClick={() => setSection("por")}>P.O.R/Awards</button>
          </div>
          <button className="cps-btn ghost" onClick={() => setShowJar(true)}>✎ Jargon</button>
        </div>

        {/* hero */}
        <div className="cps-hero">
          <div className="cps-row cps-head">
            <b>Pointer to rewrite</b>
            <span className="cps-row" style={{ gap: 6 }}>
              <button className="cps-mini" onClick={() => runDefense([plain(pointerRef.current?.innerHTML || "")])}>🛡 Defensibility</button>
              <button className="cps-mini" onMouseDown={(e) => { e.preventDefault(); document.execCommand("bold"); sync(); }}><b>B</b></button>
              <button className="cps-mini" onMouseDown={(e) => { e.preventDefault(); lockSelection(); }}>🔒 Lock</button>
              <button className="cps-mini save" onClick={savePointer}>✓ Save</button>
            </span>
          </div>
          <div ref={pointerRef} className="cps-pointer cps-cv" contentEditable suppressContentEditableWarning onInput={sync} />
          <input className="cps-in" style={{ marginTop: 8 }} placeholder="locked words — kept & bold, placed anywhere (comma-separated)" value={locked} onChange={(e) => setLocked(e.target.value)} />
          <div className="cps-track"><div className="cps-zone" /><div className="cps-fill" style={{ width: Math.min(heroPct, 110) / 110 * 100 + "%", background: fillColor(heroPct) }} /><div className="cps-limit" /></div>
          <div className="cps-row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <span className="cps-big" style={{ color: fillColor(heroPct) }}>{heroPct}<span style={{ fontSize: 14, color: "#94a3b8" }}>%</span> <span style={{ fontSize: 12 }}>{heroPct > 103 ? "✕ too long" : heroPct > 100 ? "◔ just over (ok)" : heroPct >= 97 ? "✓ perfect" : heroPct >= 95 ? "◑ fits" : "· short"}</span></span>
            <span className="cps-hint">{heroPx}{ready ? "" : " · loading font…"}</span>
          </div>
          {/* linter chips */}
          <div className="cps-chips">
            {chips.swaps.map((s: any, i: number) => <button key={"s" + i} className="cps-chip swap" onClick={() => applySwap(s.from, s.to)}><span style={{ opacity: .6 }}>{s.from}</span> → <b>{s.to}</b></button>)}
            {chips.fillers.map((f: string, i: number) => <button key={"f" + i} className="cps-chip filler" onClick={() => removeWord(f)}>✕ {f}</button>)}
            {chips.jar.length > 0 && <button className="cps-chip jar" onClick={() => copy(chips.jar.join(", "))}>💡 {chips.jar.join(", ")}</button>}
          </div>
          {/* defensibility flags */}
          {defense.map((f, i) => f.ok ? <div key={i} className="cps-flag ok">🛡 Looks defensible</div> : (
            <div key={i} className={"cps-flag " + (f.local ? "warn" : "bad")}><b>⚠ {f.issue}</b>{f.fix ? <div className="cps-row" style={{ gap: 8, marginTop: 6 }}><span className="cps-cv" style={{ background: "#fff", color: "#000", padding: "3px 6px", borderRadius: 5 }}>{f.fix}</span><button className="cps-mini" onClick={() => setPointer(normalizeBold(f.fix, []))}>Use fix</button></div> : null}</div>
          ))}
        </div>

        {/* my pointers */}
        <div className="cps-card">
          <div className="cps-row cps-head"><b>⭐ My pointers ({saved.length})</b><span className="cps-row" style={{ gap: 6 }}><button className="cps-mini" onClick={() => copyAllSaved("html")}>Copy all</button><button className="cps-mini" onClick={() => copyAllSaved("json")}>Copy JSON</button><button className="cps-mini" onClick={() => { if (confirm("Clear all?")) setSaved([]); }}>Clear</button></span></div>
          {saved.length === 0 ? <div className="cps-hint">Perfect a pointer, then ✓ Save — they collect here to copy all at once.</div> :
            saved.map((h, i) => <div key={i} className="cps-cand"><div className="cps-txt cps-cv" dangerouslySetInnerHTML={{ __html: h }} /><div className="cps-row" style={{ justifyContent: "flex-end", gap: 6, marginTop: 6 }}><button className="cps-mini" onClick={() => setPointer(h)}>Edit ↑</button><button className="cps-mini" onClick={() => copy(h)}>Copy</button><button className="cps-mini" onClick={() => setSaved(saved.filter((_, j) => j !== i))}>✕</button></div></div>)}
        </div>

        {/* context */}
        <div className="cps-card">
          <label className="cps-lbl">Project context — model may enrich only with facts here</label>
          <textarea className="cps-in" rows={8} value={ctx} onChange={(e) => setCtx(e.target.value)} />
          <div className="cps-row" style={{ marginTop: 8 }}>
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ border: 0, padding: 0, fontSize: 11, color: "#94a3b8", cursor: "pointer" }} />
          </div>
        </div>

        {/* model + actions */}
        <div className="cps-card">
          <div className="cps-row" style={{ gap: 10 }}>
            <select className="cps-in" value={providerSel} onChange={(e) => setProviderSel(e.target.value)}>
              <option value="best">🏆 Best available (auto-failover)</option>
              {BEST_ORDER.map((id) => <option key={id} value={id}>{PROVIDERS[id].label}{PROVIDERS[id].free ? " ⚡free" : " $paid"}</option>)}
            </select>
            <button className="cps-btn ghost" onClick={() => setShowKeys(true)}>🔑 API keys</button>
          </div>
          <div className="cps-row" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <button className="cps-btn" disabled={busy !== ""} onClick={rewrite}>{busy === "rewrite" ? "…" : "✨ Rewrite to 95–103%"}</button>
            <span className="cps-hint">API calls: {apiCalls}{activeProv ? " · " + PROVIDERS[activeProv].label : ""}</span>
          </div>
          {log && <pre className="cps-log">{log}</pre>}
        </div>

        {/* candidates */}
        {cands.length > 0 && (
          <div className="cps-card"><b className="cps-head">Candidates</b>
            {cands.map((c, i) => { const p = Math.round(c.pct * 100); return (
              <div key={i} className={"cps-cand" + (i === 0 ? " best" : "")}>{i === 0 ? <div className="cps-badge ok">★ best</div> : null}
                <div className="cps-txt cps-cv" dangerouslySetInnerHTML={{ __html: c.html }} />
                <div className="cps-ctrack"><div className="cps-czone" /><div className="cps-cfill" style={{ width: Math.min(p, 110) / 110 * 100 + "%", background: fillColor(p) }} /></div>
                <div className="cps-row" style={{ justifyContent: "space-between" }}><span className="cps-badge" style={{ color: fillColor(p) }}>{p}% · {fitTxt(p)} · {c.w.toFixed(0)}/{c.avail.toFixed(0)}px</span>
                  <span className="cps-row" style={{ gap: 6 }}><button className="cps-mini" onClick={() => setPointer(c.html)}>Use ↑</button><button className="cps-mini" onClick={() => copy(c.html)}>Copy</button></span></div>
              </div>); })}
          </div>
        )}

        {/* miner */}
        <div className="cps-card">
          <div className="cps-row cps-head"><b>⛏ Achievement Miner</b><span className="cps-hint">turn the doc into ready, fitted bullets</span></div>
          <div className="cps-row" style={{ gap: 10, marginTop: 8 }}>
            <div className="cps-seg">
              <button className={mineKind === "details" ? "on" : ""} onClick={() => setMineKind("details")}>Project Details</button>
              <button className={mineKind === "achievements" ? "on" : ""} onClick={() => setMineKind("achievements")}>Achievements</button>
            </div>
            <input className="cps-in" type="number" min={1} max={10} style={{ width: 70 }} value={mineN} onChange={(e) => setMineN(+e.target.value || 5)} />
            <button className="cps-btn" disabled={busy !== ""} onClick={mine}>{busy === "mine" ? "…" : "⛏ Mine"}</button>
            {mined.length > 0 && <><button className="cps-mini" onClick={() => copy(mined.map((x) => x.html).join("\n"))}>Copy all</button><button className="cps-mini" onClick={() => runDefense(mined.map((x) => plain(x.html)))}>🛡 Check all</button></>}
          </div>
          {mined.map((x, i) => { const p = Math.round(x.pct * 100); const loc = localDefense(plain(x.html), ctx); return (
            <div key={i} className="cps-cand"><div className="cps-txt cps-cv" dangerouslySetInnerHTML={{ __html: x.html }} />
              <div className="cps-ctrack"><div className="cps-czone" /><div className="cps-cfill" style={{ width: Math.min(p, 110) / 110 * 100 + "%", background: fillColor(p) }} /></div>
              <div className="cps-row" style={{ justifyContent: "space-between" }}><span className="cps-badge" style={{ color: fillColor(p) }}>{p}% {loc.length ? "⚠" : ""}</span>
                <span className="cps-row" style={{ gap: 6 }}><button className="cps-mini" onClick={() => setPointer(x.html)}>Use ↑</button><button className="cps-mini" onClick={() => copy(x.html)}>Copy</button></span></div>
            </div>); })}
        </div>

        {/* jargon modal */}
        {showJar && (
          <div className="cps-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowJar(false); }}>
            <div className="cps-msheet">
              <div className="cps-row cps-head"><b>Jargon · {DOMAINS[domain].label}</b><button className="cps-x" onClick={() => setShowJar(false)}>✕</button></div>
              <label className="cps-lbl">Power verbs (comma-separated)</label>
              <textarea className="cps-in" rows={2} value={(jar[domain]?.verbs || DOMAINS[domain].verbs).join(", ")} onChange={(e) => setJar({ ...jar, [domain]: { ...(jar[domain] || {}), verbs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} />
              <label className="cps-lbl">Domain jargon (comma-separated)</label>
              <textarea className="cps-in" rows={3} value={(jar[domain]?.jargon || DOMAINS[domain].jargon).join(", ")} onChange={(e) => setJar({ ...jar, [domain]: { ...(jar[domain] || {}), jargon: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })} />
              <div className="cps-row" style={{ marginTop: 10, gap: 8 }}><button className="cps-btn ghost" onClick={() => { const n = { ...jar }; delete n[domain]; setJar(n); }}>↺ Reset</button><button className="cps-btn" onClick={() => setShowJar(false)}>Done</button></div>
            </div>
          </div>
        )}

        {/* keys modal */}
        {showKeys && (
          <div className="cps-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowKeys(false); }}>
            <div className="cps-msheet">
              <div className="cps-row cps-head"><b>API keys & models</b><button className="cps-x" onClick={() => setShowKeys(false)}>✕</button></div>
              <div className="cps-hint" style={{ marginBottom: 10 }}>Free providers first. “Best available” uses whichever have keys and auto-fails-over. Gemini box accepts one key per line (rotates on quota). Stored locally.</div>
              {BEST_ORDER.map((id) => (
                <div key={id} className="cps-prow">
                  <div><span className="cps-dot" style={{ background: hasKey(id) ? "#22c55e" : "#475569" }} /> {PROVIDERS[id].label.split(" · ")[0]}{PROVIDERS[id].free ? <span className="cps-free">FREE</span> : <span className="cps-paid">PAID</span>}</div>
                  {id === "gemini"
                    ? <textarea className="cps-in" rows={3} placeholder="one Gemini key per line — rotates on quota" value={rawKey(id)} onChange={(e) => setKeys({ ...keys, [id]: { ...(keys[id] || {}), key: e.target.value } })} />
                    : <input className="cps-in" placeholder="API key (comma-separate for multiple)" value={rawKey(id)} onChange={(e) => setKeys({ ...keys, [id]: { ...(keys[id] || {}), key: e.target.value } })} />}
                  <input className="cps-in" placeholder="model" value={modelOf(id)} onChange={(e) => setKeys({ ...keys, [id]: { ...(keys[id] || {}), model: e.target.value } })} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    {/* PREMIUM UPGRADE MODAL */}
        {showUpgrade && (
          <div className="cps-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowUpgrade(false); }}>
            <div className="cps-msheet" style={{ maxWidth: 450, textAlign: 'center', padding: '30px 24px' }}>
              <div className="w-16 h-16 bg-purple-900/30 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.536a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Daily Limit Reached</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                You have exhausted your AI generation credits for today. Upgrade to Premium to unlock our powerful backend developer keys, higher limits, and advanced CV models.
              </p>
              <div className="cps-row" style={{ justifyContent: 'center', gap: 12 }}>
                <button onClick={() => setShowUpgrade(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-300 bg-[#1e293b] hover:bg-[#334155] transition">Maybe Later</button>
                <button onClick={() => window.open('https://your-payment-link.com', '_blank')} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-purple-600 text-white hover:bg-purple-500 transition shadow-[0_0_15px_rgba(147,51,234,0.3)]">Buy Premium</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

const CPS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:wght@400;500;600;700;800&display=swap');

/* Fixes the squished boxes by ensuring all elements calculate padding within their width */
.cps-wrapper * { box-sizing: border-box; }

.cps-wrapper{ min-height:100vh; background:#0b1220; display:flex; justify-content:center; align-items:flex-start; font-family:"Inter",system-ui,sans-serif; }

/* Increased max-width from 860px to 1200px to remove the odd empty space and utilize the screen */
.cps-container{ position:relative; width:100%; max-width:1200px; padding:24px 16px 80px; color:#e5e7eb; margin:0 auto; }

.cps-cv{ font-family:"EB Garamond", Garamond, "Cormorant Garamond", serif; font-variant-ligatures:none; font-kerning:none; font-feature-settings:"liga" 0,"clig" 0,"kern" 0; }
.cps-cv b, .cps-cv strong{ font-weight:700; }
.cps-launch{ font-family:inherit; font-weight:700; border:0; border-radius:8px; padding:8px 14px; background:#2563eb; color:#fff; cursor:pointer; font-size:13px; }
.cps-overlay{ position:fixed; inset:0; background:rgba(2,6,23,.6); backdrop-filter:blur(2px); z-index:9999; display:flex; justify-content:center; align-items:flex-start; overflow:auto; padding:24px 12px; font-family:"Inter",system-ui,sans-serif; }
.cps-sheet{ position:relative; width:min(1200px,100%); background:#0b1220; color:#e5e7eb; border:1px solid #1e293b; border-radius:14px; padding:16px; }
.cps-card,.cps-hero{ background:#111a2e; border:1px solid #1e293b; border-radius:12px; padding:14px; margin-top:12px; }
.cps-hero{ background:linear-gradient(180deg,#0f1a30,#111a2e); }
.cps-row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.cps-head{ justify-content:space-between; }
.cps-hint{ font-size:11px; color:#64748b; }
.cps-lbl{ font-size:12px; color:#94a3b8; display:block; margin:0 0 4px; }

/* Added width: 100% and resize: vertical to fix the squished context box */
.cps-in{ width: 100%; background:#0b1220; color:#e5e7eb; border:1px solid #334155; border-radius:8px; padding:8px 10px; font-size:13px; font-family:inherit; flex:1; min-width:120px; resize: vertical; }

.cps-seg{ display:inline-flex; background:#0b1220; border:1px solid #334155; border-radius:9px; padding:3px; gap:3px; }
.cps-seg button{ border:0; background:transparent; color:#94a3b8; padding:6px 10px; border-radius:7px; font-weight:600; font-size:12px; cursor:pointer; }
.cps-seg button.on{ background:#2563eb; color:#fff; }
.cps-btn{ font-family:inherit; font-weight:700; border:0; border-radius:8px; padding:9px 14px; background:#2563eb; color:#fff; cursor:pointer; font-size:13px; }
.cps-btn.ghost{ background:#1e293b; color:#cbd5e1; } .cps-btn:disabled{ opacity:.5; cursor:not-allowed; }
.cps-mini{ font-size:11px; font-weight:700; border:0; border-radius:6px; padding:5px 9px; cursor:pointer; background:#1e293b; color:#cbd5e1; } .cps-mini.save{ background:#166534; color:#fff; }
.cps-x{ border:0; background:transparent; color:#94a3b8; cursor:pointer; font-size:16px; }
.cps-pointer{ font-size:13px; line-height:1; min-height:34px; background:#fff; color:#000; border-radius:8px; padding:8px 10px; outline:none; margin-top:8px; }
.cps-track{ position:relative; height:24px; border-radius:8px; background:#1e293b; overflow:hidden; margin-top:10px; }
.cps-zone{ position:absolute; top:0; bottom:0; left:88.2%; width:2.7%; background:rgba(34,197,94,.22); border-left:1px dashed #22c55e; border-right:1px dashed #22c55e; }
.cps-fill{ position:absolute; left:0; top:0; bottom:0; border-radius:8px 0 0 8px; transition:width .1s; }
.cps-limit{ position:absolute; top:0; bottom:0; left:90.9%; width:2px; background:#f8fafc; opacity:.7; }
.cps-big{ font-size:26px; font-weight:800; font-variant-numeric:tabular-nums; }
.cps-chips{ display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
.cps-chip{ font-size:11px; font-weight:600; border-radius:20px; padding:4px 10px; cursor:pointer; border:1px solid #334155; background:#0b1220; color:#cbd5e1; }
.cps-chip.swap{ border-color:#3b82f6aa; color:#93c5fd; } .cps-chip.filler{ border-color:#ef4444aa; color:#fca5a5; } .cps-chip.jar{ border-color:#22c55e55; color:#86efac; }
.cps-cand{ background:#0b1220; border:1px solid #24324a; border-radius:10px; padding:10px 12px; margin-top:10px; } .cps-cand.best{ border-color:#22c55e; }
.cps-txt{ background:#fff; color:#000; border-radius:6px; padding:6px 8px 6px 22px; font-size:13px; line-height:1.15; position:relative; }
.cps-txt::before{ content:""; position:absolute; left:9px; top:8px; width:4px; height:4px; background:#000; }
.cps-ctrack{ position:relative; height:8px; border-radius:5px; background:#1e293b; overflow:hidden; margin:8px 0 6px; }
.cps-czone{ position:absolute; top:0; bottom:0; left:88.2%; width:2.7%; background:rgba(34,197,94,.25); }
.cps-cfill{ position:absolute; left:0; top:0; bottom:0; }
.cps-badge{ font-size:11px; font-weight:800; } .cps-badge.ok{ color:#22c55e; margin-bottom:4px; }
.cps-flag{ font-size:12px; border-radius:8px; padding:8px 10px; margin-top:8px; border:1px solid; }
.cps-flag.bad{ background:#2a0f0f; border-color:#7f1d1d; color:#fecaca; } .cps-flag.warn{ background:#2a1704; border-color:#78350f; color:#fde68a; } .cps-flag.ok{ background:#052e16; border-color:#166534; color:#bbf7d0; }
.cps-log{ font-family:ui-monospace,monospace; font-size:11px; background:#05080f; color:#7dd3fc; border:1px solid #1e293b; border-radius:8px; padding:9px; margin-top:10px; max-height:150px; overflow:auto; white-space:pre-wrap; }
.cps-modal{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; padding:16px; z-index:10000; }
.cps-msheet{ background:#0f1728; border:1px solid #24324a; border-radius:14px; padding:18px; width:min(560px,96vw); max-height:90vh; overflow:auto; }
.cps-prow{ display:grid; grid-template-columns:130px 1fr 120px; gap:8px; align-items:center; margin-bottom:8px; }
.cps-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; }
.cps-free{ font-size:9px; font-weight:800; color:#4ade80; border:1px solid #22c55e55; border-radius:10px; padding:0 5px; margin-left:6px; }
.cps-paid{ font-size:9px; font-weight:800; color:#fbbf24; border:1px solid #f59e0b55; border-radius:10px; padding:0 5px; margin-left:6px; }
@media(max-width:640px){ .cps-prow{ grid-template-columns:1fr; } }
`;
