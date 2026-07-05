import { RequestLog, CacheTier } from "../lib/mock";

interface Props {
  logs: RequestLog[];
  agentNames: Record<string, string>;
}

const TIER_META: Record<CacheTier, { label: string; color: string; bg: string }> = {
  exact_response_cache: { label: "EXACT",    color: "#4ade80", bg: "#052e1c" },
  semantic_cache:       { label: "SEMANTIC", color: "#22d3ee", bg: "#042330" },
  no_cache:             { label: "MISS",     color: "#64748b", bg: "#0f172a" },
};

function TierBadge({ tier }: { tier: CacheTier }) {
  const m = TIER_META[tier];
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.color}44`,
      borderRadius: "4px", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "0.1em", padding: "2px 6px", fontWeight: 700,
    }}>
      {m.label}
    </span>
  );
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 2000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

const COL: React.CSSProperties = {
  padding: "10px 12px", fontSize: "11px",
  fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8",
  borderBottom: "1px solid #0f1e2e", whiteSpace: "nowrap",
};
const HEAD: React.CSSProperties = {
  ...COL, fontSize: "9px", color: "#334155", letterSpacing: "0.12em",
  textTransform: "uppercase", borderBottom: "1px solid #1e293b", background: "#080f1a",
};

export function LiveTelemetryFeed({ logs, agentNames }: Props) {
  const recent = [...logs].reverse().slice(0, 80);
  return (
    <div style={{
      background: "#080f1a", border: "1px solid #1e293b",
      borderRadius: "12px", overflow: "hidden", flex: 1,
    }}>
      <div style={{
        padding: "14px 16px 10px", borderBottom: "1px solid #1e293b",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#22d3ee", boxShadow: "0 0 6px #22d3ee",
          display: "inline-block", animation: "pulse 1.4s ease-in-out infinite",
        }} />
        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#475569", letterSpacing: "0.1em" }}>
          LIVE TELEMETRY
        </span>
        <span style={{ marginLeft: "auto", fontSize: "10px", color: "#22d3ee", fontFamily: "monospace" }}>
          {logs.length} events
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Agent","Model","Cache","Saved","Charged","Latency","When"].map((h) => (
                <th key={h} style={h === "Saved" ? { ...HEAD, color: "#22d3ee88" } : HEAD}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={7} style={{ ...COL, textAlign: "center", color: "#1e293b", padding: "40px" }}>
                Waiting for requests…
              </td></tr>
            )}
            {recent.map((log, i) => (
              <tr key={log.id} style={{ background: i === 0 ? "#0d1e31" : "transparent", transition: "background 0.4s" }}>
                <td style={{ ...COL, color: "#e2e8f0" }}>{agentNames[log.agent_id] ?? log.agent_id.slice(0, 8)}</td>
                <td style={{ ...COL, color: "#64748b" }}>{log.model}</td>
                <td style={COL}><TierBadge tier={log.btl_cache_tier} /></td>
                <td style={{ ...COL, color: log.saved_cents > 0 ? "#4ade80" : "#334155", fontWeight: log.saved_cents > 0 ? 700 : 400 }}>
                  {log.saved_cents > 0 ? `+$${(log.saved_cents / 100).toFixed(3)}` : "—"}
                </td>
                <td style={COL}>${(log.customer_charge_cents / 100).toFixed(3)}</td>
                <td style={{ ...COL, color: log.latency_ms < 50 ? "#4ade80" : log.latency_ms < 150 ? "#22d3ee" : "#f59e0b" }}>
                  {log.latency_ms}ms
                </td>
                <td style={{ ...COL, color: "#334155" }}>{timeAgo(log.ts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}