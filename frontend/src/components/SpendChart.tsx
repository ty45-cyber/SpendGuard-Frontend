import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { RequestLog } from "../lib/mock";

interface Props { logs: RequestLog[]; }

function buildSeries(logs: RequestLog[]) {
  let cumSaved = 0, cumCharged = 0;
  return logs.map((log) => {
    cumSaved   += log.saved_cents / 100;
    cumCharged += log.customer_charge_cents / 100;
    const d = new Date(log.ts);
    return {
      t: `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`,
      saved:   parseFloat(cumSaved.toFixed(3)),
      charged: parseFloat(cumCharged.toFixed(3)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0b1623", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
      <div style={{ color: "#475569", marginBottom: "6px" }}>{label}</div>
      <div style={{ color: "#4ade80" }}>saved: ${payload[0]?.value?.toFixed(3)}</div>
      <div style={{ color: "#94a3b8" }}>charged: ${payload[1]?.value?.toFixed(3)}</div>
    </div>
  );
};

export function SpendChart({ logs }: Props) {
  const data = buildSeries(logs).slice(-40);
  return (
    <div style={{ background: "#080f1a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px 20px 8px" }}>
      <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#334155", letterSpacing: "0.14em", marginBottom: "14px" }}>
        CUMULATIVE SAVINGS vs SPEND
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chargedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#475569" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#475569" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#0f1e2e" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: "#334155", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#334155", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="saved"   stroke="#4ade80" strokeWidth={2}   fill="url(#savedGrad)"   dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey="charged" stroke="#334155" strokeWidth={1.5} fill="url(#chargedGrad)" dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "18px", marginTop: "8px" }}>
        {[{ color: "#4ade80", label: "BTL savings" }, { color: "#334155", label: "charged" }].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "20px", height: "2px", background: color, display: "inline-block", borderRadius: "2px" }} />
            <span style={{ fontSize: "9px", color: "#334155", fontFamily: "monospace", letterSpacing: "0.1em" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}