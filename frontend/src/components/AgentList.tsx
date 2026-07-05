import { Agent } from "../lib/mock";
import { BudgetGauge } from "./BudgetGauge";

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onKill: (id: string) => void;
}

export function AgentList({ agents, selectedId, onSelect, onKill }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {agents.map((agent) => {
        const selected = agent.id === selectedId;
        return (
          <div
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            style={{
              background: selected ? "#0f1e2e" : "#0b1623",
              border: `1px solid ${selected ? "#22d3ee33" : "#1e293b"}`,
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  letterSpacing: "0.04em",
                }}>
                  {agent.name}
                </div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>
                  {agent.id.slice(0, 8)}…
                </div>
              </div>

              {agent.status !== "killed" ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onKill(agent.id); }}
                  style={{
                    background: "transparent",
                    border: "1px solid #ef444466",
                    borderRadius: "5px",
                    color: "#ef4444",
                    fontSize: "9px",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.1em",
                    padding: "3px 7px",
                    cursor: "pointer",
                  }}
                >
                  KILL
                </button>
              ) : (
                <span style={{
                  fontSize: "9px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#ef4444",
                  letterSpacing: "0.1em",
                  border: "1px solid #ef444466",
                  borderRadius: "5px",
                  padding: "3px 7px",
                }}>
                  KILLED
                </span>
              )}
            </div>
            <BudgetGauge agent={agent} />
          </div>
        );
      })}
    </div>
  );
}