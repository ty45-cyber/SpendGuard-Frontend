import { useState, useEffect, useRef, useCallback } from "react";
import {
  MOCK_MODE, MOCK_AGENTS, generateMockLog, summarizeLogs,
  Agent, RequestLog, LedgerSummary,
} from "./lib/mock";
import { AgentList }          from "./components/AgentList";
import { SavingsLedger }      from "./components/SavingsLedger";
import { LiveTelemetryFeed }  from "./components/LiveTelemetryFeed";
import { SpendChart }         from "./components/SpendChart";
import { CreateAgentModal }   from "./components/CreateAgentModal";

const EMPTY_SUMMARY: LedgerSummary = {
  total_requests: 0, cache_hits: 0, cache_hit_rate_pct: 0,
  total_saved_cents: 0, total_charged_cents: 0,
};

const API = import.meta.env.VITE_API_BASE ?? "https://spendguard-backend-production-0407.up.railway.app";
const AUTH_HEADERS = {
  "Content-Type": "application/json",
  "X-SpendGuard-Key": "gw_btech-ab_1275d2dc4fedcf0174438e1cefcec0b8572d570c65401ef2",
};

function getWebSocketUrl() {
  return "wss://spendguard-backend-production-0407.up.railway.app/ws/telemetry";
}

export default function App() {
  const [agents, setAgents]       = useState<Agent[]>([]);
  const [logs, setLogs]           = useState<RequestLog[]>([]);
  const [summary, setSummary]     = useState<LedgerSummary>(EMPTY_SUMMARY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const agentNames: Record<string, string> = Object.fromEntries(
    agents.map((a) => [a.id, a.name])
  );

  const pushLog = useCallback((log: RequestLog) => {
    setLogs((prev) => {
      const next = [...prev, log];
      setSummary(summarizeLogs(next));
      return next;
    });
  }, []);

  // Mock mode — seed + simulate
  useEffect(() => {
    if (!MOCK_MODE) return;
    setAgents(MOCK_AGENTS.map((a) => ({ ...a })));
    setSelectedId(MOCK_AGENTS[0].id);

    const tick = () => {
      const agent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
      const log   = generateMockLog(agent.id);
      pushLog(log);
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== agent.id || a.status === "killed") return a;
          const next = { ...a, current_spend_cents: a.current_spend_cents + log.customer_charge_cents };
          if (next.current_spend_cents >= next.monthly_budget_cents) next.status = "throttled";
          return next;
        })
      );
    };

    for (let i = 0; i < 12; i++) tick();
    const interval = setInterval(tick, 900);
    return () => clearInterval(interval);
  }, [pushLog]);

  const authHeaders = {
    "Content-Type": "application/json",
    "X-SpendGuard-Key": "gw_btech-ab_1275d2dc4fedcf0174438e1cefcec0b8572d570c65401ef2",
  };

  // Live mode — fetch agents + WebSocket
  useEffect(() => {
    if (MOCK_MODE) return;
    fetch(`${API}/agents`, { headers: AUTH_HEADERS })
      .then((r) => r.json())
      .then((data: Agent[]) => { setAgents(data); if (data.length) setSelectedId(data[0].id); })
      .catch(console.error);

    const wsUrl = getWebSocketUrl();
    console.info("SpendGuard WS connect", { wsUrl, apiBase: API });
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => console.info("SpendGuard WS open", { readyState: ws.readyState });
    ws.onmessage = (e) => {
      try { pushLog(JSON.parse(e.data) as RequestLog); } catch (err) { console.error("SpendGuard WS parse error", err); }
    };
    ws.onerror = (e) => console.error("SpendGuard WS error", e, { readyState: ws.readyState });
    ws.onclose = (e) => console.warn("SpendGuard WS close", { code: e.code, reason: e.reason, wasClean: e.wasClean });
    return () => ws.close();
  }, [pushLog]);

  const handleKill = async (id: string) => {
    if (MOCK_MODE) {
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: "killed" } : a));
      return;
    }
    await fetch(`${API}/agents/${id}/kill-switch`, { method: "POST", headers: AUTH_HEADERS });
    const updated: Agent = await fetch(`${API}/agents/${id}`, { headers: AUTH_HEADERS }).then((r) => r.json());
    setAgents((prev) => prev.map((a) => a.id === id ? updated : a));
  };

  // State
  const [showCreate, setShowCreate] = useState(false);

  // Handler
  const handleCreate = async (name: string, budgetCents: number) => {
    if (MOCK_MODE) {
      const newAgent: Agent = {
        id: crypto.randomUUID(),
        name,
        monthly_budget_cents: budgetCents,
        current_spend_cents: 0,
        status: "active",
      };
      setAgents((prev) => [...prev, newAgent]);
      return;
    }
    const res = await fetch(`${API}/agents`, {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({ name, monthly_budget_cents: budgetCents }),
    });
    const created: Agent = await res.json();
    setAgents((prev) => [...prev, created]);
  };

  const visibleLogs    = selectedId ? logs.filter((l) => l.agent_id === selectedId) : logs;
  const visibleSummary = selectedId ? summarizeLogs(visibleLogs) : summary;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d16; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0b1623; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #22d3ee; }
          50%       { opacity: 0.4; box-shadow: 0 0 2px #22d3ee; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #0f1e2e", padding: "0 28px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#060d16", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="18" height="18" rx="4" stroke="#22d3ee" strokeWidth="1.5" />
            <path d="M7 15 L11 7 L15 15" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="8.5" y1="12" x2="13.5" y2="12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em", color: "#e2e8f0" }}>SpendGuard</span>
          <span style={{ fontSize: "10px", color: "#22d3ee", letterSpacing: "0.12em", marginLeft: "2px" }}>BTL RUNTIME OBSERVABILITY</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {MOCK_MODE && (
            <span style={{
              fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.14em",
              color: "#f59e0b", border: "1px solid #f59e0b44", borderRadius: "4px", padding: "2px 8px",
            }}>DEMO MODE</span>
          )}
          <span style={{ fontSize: "10px", color: "#1e293b" }}>{agents.length} agents</span>
        </div>
      </header>

      <div style={{
        display: "grid", gridTemplateColumns: "260px 1fr",
        height: "calc(100vh - 52px)", overflow: "hidden",
      }}>
        {/* Sidebar */}
        <aside style={{
          borderRight: "1px solid #0f1e2e", padding: "16px 14px",
          overflowY: "auto", background: "#060d16",
        }}>
          <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "0.14em", marginBottom: "12px", paddingLeft: "2px" }}>
            AGENTS
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              width: "100%", background: "transparent",
              border: "1px dashed #1e293b", borderRadius: "8px",
              color: "#334155", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px", letterSpacing: "0.1em", padding: "10px",
              cursor: "pointer", marginBottom: "12px", transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#22d3ee44";
              (e.target as HTMLButtonElement).style.color = "#22d3ee";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#1e293b";
              (e.target as HTMLButtonElement).style.color = "#334155";
            }}
          >
            + NEW AGENT
          </button>
          <AgentList agents={agents} selectedId={selectedId} onSelect={setSelectedId} onKill={handleKill} />
        </aside>

        {/* Main */}
        <main style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {selectedId && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0" }}>
                {agentNames[selectedId] ?? "All Agents"}
              </span>
              <span style={{ fontSize: "10px", color: "#334155" }}>/ live ledger</span>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  marginLeft: "auto", background: "transparent",
                  border: "1px solid #1e293b", borderRadius: "5px",
                  color: "#475569", fontSize: "9px", fontFamily: "monospace",
                  letterSpacing: "0.1em", padding: "3px 8px", cursor: "pointer",
                }}
              >
                VIEW ALL
              </button>
            </div>
          )}
          <SavingsLedger summary={visibleSummary} />
          <SpendChart logs={visibleLogs} />
          <LiveTelemetryFeed logs={visibleLogs} agentNames={agentNames} />
        </main>
      </div>
      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}