export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

export type AgentStatus = "active" | "throttled" | "killed";
export type CacheTier = "exact_response_cache" | "semantic_cache" | "no_cache";

export interface Agent {
  id: string;
  name: string;
  monthly_budget_cents: number;
  current_spend_cents: number;
  status: AgentStatus;
}

export interface RequestLog {
  id: string;
  agent_id: string;
  workflow_id: string | null;
  model: string;
  btl_cache_tier: CacheTier;
  benchmark_cost_cents: number;
  customer_charge_cents: number;
  saved_cents: number;
  latency_ms: number;
  ts: string;
}

export interface LedgerSummary {
  total_requests: number;
  cache_hits: number;
  cache_hit_rate_pct: number;
  total_saved_cents: number;
  total_charged_cents: number;
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: "a1b2c3d4-0000-0000-0000-000000000001",
    name: "kyc-bot",
    monthly_budget_cents: 5000,
    current_spend_cents: 1840,
    status: "active",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000002",
    name: "tax-assistant",
    monthly_budget_cents: 3000,
    current_spend_cents: 2670,
    status: "active",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000003",
    name: "support-agent",
    monthly_budget_cents: 2000,
    current_spend_cents: 420,
    status: "active",
  },
];

const MODELS = ["btl-2", "btl-2-mini", "btl-flash"];
const CACHE_TIERS: CacheTier[] = [
  "exact_response_cache",
  "exact_response_cache",
  "semantic_cache",
  "no_cache",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockLog(agentId: string): RequestLog {
  const tier = CACHE_TIERS[Math.floor(Math.random() * CACHE_TIERS.length)];
  const benchmark = randomBetween(8, 24);
  const charge = tier === "no_cache" ? benchmark : Math.floor(benchmark * 0.35);
  const saved = benchmark - charge;
  return {
    id: crypto.randomUUID(),
    agent_id: agentId,
    workflow_id: null,
    model: MODELS[Math.floor(Math.random() * MODELS.length)],
    btl_cache_tier: tier,
    benchmark_cost_cents: benchmark,
    customer_charge_cents: charge,
    saved_cents: saved,
    latency_ms:
      tier === "exact_response_cache"
        ? randomBetween(12, 40)
        : tier === "semantic_cache"
        ? randomBetween(60, 140)
        : randomBetween(180, 480),
    ts: new Date().toISOString(),
  };
}

export function summarizeLogs(logs: RequestLog[]): LedgerSummary {
  const hits = logs.filter((l) => l.btl_cache_tier !== "no_cache").length;
  return {
    total_requests: logs.length,
    cache_hits: hits,
    cache_hit_rate_pct: logs.length ? (hits / logs.length) * 100 : 0,
    total_saved_cents: logs.reduce((s, l) => s + l.saved_cents, 0),
    total_charged_cents: logs.reduce((s, l) => s + l.customer_charge_cents, 0),
  };
}