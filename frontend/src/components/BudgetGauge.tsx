import { Agent } from "../lib/mock";

interface Props {
  agent: Agent;
}

function arcPath(pct: number, r: number, cx: number, cy: number): string {
  const clamp = Math.min(pct, 99.99);
  const angle = (clamp / 100) * 2 * Math.PI - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const large = clamp > 50 ? 1 : 0;
  const start = { x: cx, y: cy - r };
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
}

export function BudgetGauge({ agent }: Props) {
  const pct = Math.min(
    (agent.current_spend_cents / agent.monthly_budget_cents) * 100,
    100
  );

  const color =
    agent.status === "killed"
      ? "#ef4444"
      : pct >= 90
      ? "#ef4444"
      : pct >= 80
      ? "#f59e0b"
      : "#22d3ee";

  const statusLabel =
    agent.status === "killed"
      ? "KILLED"
      : agent.status === "throttled"
      ? "THROTTLED"
      : pct >= 80
      ? "WARNING"
      : "ACTIVE";

  const cx = 60;
  const cy = 60;
  const r = 44;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width={120} height={120} style={{ overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
        {pct > 0 && (
          <path
            d={arcPath(pct, r, cx, cy)}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            style={{ transition: "stroke 0.4s ease" }}
          />
        )}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fill={color}
          fontSize={16}
          fontWeight={700}
          fontFamily="'JetBrains Mono', monospace"
        >
          {pct.toFixed(0)}%
        </text>
        <text
          x={cx} y={cy + 12}
          textAnchor="middle"
          fill="#64748b"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
        >
          OF BUDGET
        </text>
      </svg>
      <span style={{
        fontSize: "10px",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.12em",
        color,
        fontWeight: 700,
      }}>
        {statusLabel}
      </span>
      <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
        ${(agent.current_spend_cents / 100).toFixed(2)} / ${(agent.monthly_budget_cents / 100).toFixed(2)}
      </span>
    </div>
  );
}