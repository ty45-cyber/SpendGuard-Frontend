import { LedgerSummary } from "../lib/mock";

interface Props { summary: LedgerSummary; }

function Stat({ label, value, accent = "#22d3ee", sub }: {
  label: string; value: string; accent?: string; sub?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "140px" }}>
      <span style={{
        fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
        color: "#475569", letterSpacing: "0.14em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "28px", fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700, color: accent, lineHeight: 1, transition: "color 0.3s",
      }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "10px", color: "#334155", fontFamily: "monospace" }}>{sub}</span>}
    </div>
  );
}

function Divider() {
  return <div style={{ width: "1px", height: "48px", background: "#1e293b", alignSelf: "center" }} />;
}

export function SavingsLedger({ summary }: Props) {
  const savedDollars = (summary.total_saved_cents / 100).toFixed(2);
  const chargedDollars = (summary.total_charged_cents / 100).toFixed(2);
  const hitRate = summary.cache_hit_rate_pct.toFixed(1);
  const savingsPct = summary.total_charged_cents + summary.total_saved_cents > 0
    ? ((summary.total_saved_cents / (summary.total_saved_cents + summary.total_charged_cents)) * 100).toFixed(0)
    : "0";

  return (
    <div style={{
      background: "#080f1a", border: "1px solid #1e293b", borderRadius: "12px",
      padding: "20px 28px", display: "flex", gap: "32px", alignItems: "center", flexWrap: "wrap",
    }}>
      <Stat label="Saved via BTL Cache" value={`$${savedDollars}`} accent="#22d3ee" sub={`${savingsPct}% off benchmark`} />
      <Divider />
      <Stat
        label="Cache Hit Rate"
        value={`${hitRate}%`}
        accent={parseFloat(hitRate) >= 60 ? "#4ade80" : parseFloat(hitRate) >= 30 ? "#f59e0b" : "#ef4444"}
        sub={`${summary.cache_hits} of ${summary.total_requests} requests`}
      />
      <Divider />
      <Stat label="Total Spend" value={`$${chargedDollars}`} accent="#94a3b8" sub="customer charge" />
      <Divider />
      <Stat label="Requests" value={summary.total_requests.toLocaleString()} accent="#e2e8f0" sub="proxied through SpendGuard" />
    </div>
  );
}