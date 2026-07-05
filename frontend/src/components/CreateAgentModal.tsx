import { useState } from "react";

interface Props {
  onClose: () => void;
  onCreate: (name: string, budgetCents: number) => void;
}

const INPUT: React.CSSProperties = {
  width: "100%",
  background: "#0b1623",
  border: "1px solid #1e293b",
  borderRadius: "6px",
  color: "#e2e8f0",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "13px",
  padding: "10px 12px",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "'JetBrains Mono', monospace",
  color: "#475569",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "6px",
};

export function CreateAgentModal({ onClose, onCreate }: Props) {
  const [name, setName]         = useState("");
  const [budget, setBudget]     = useState("");
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) { setError("Agent name is required"); return; }
    const dollars = parseFloat(budget);
    if (isNaN(dollars) || dollars <= 0) { setError("Enter a valid monthly budget in USD"); return; }
    onCreate(name.trim(), Math.round(dollars * 100));
    onClose();
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "#000000bb",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200,
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0b1623",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          padding: "28px",
          width: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0" }}>
            New Agent
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              color: "#475569", fontSize: "18px", cursor: "pointer", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Name */}
        <div>
          <label style={LABEL}>Agent Name</label>
          <input
            style={INPUT}
            placeholder="e.g. kyc-bot"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        {/* Budget */}
        <div>
          <label style={LABEL}>Monthly Budget (USD)</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "#475569",
              fontFamily: "monospace", fontSize: "13px",
            }}>$</span>
            <input
              style={{ ...INPUT, paddingLeft: "24px" }}
              placeholder="50.00"
              value={budget}
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => { setBudget(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          {budget && !isNaN(parseFloat(budget)) && (
            <div style={{ fontSize: "10px", color: "#334155", marginTop: "4px", fontFamily: "monospace" }}>
              = {Math.round(parseFloat(budget) * 100)} cents / month
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: "11px", color: "#ef4444",
            fontFamily: "monospace", background: "#ef444411",
            border: "1px solid #ef444433", borderRadius: "6px", padding: "8px 12px",
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "transparent", border: "1px solid #1e293b",
              borderRadius: "6px", color: "#475569", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", letterSpacing: "0.08em", padding: "10px", cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1, background: "#22d3ee14", border: "1px solid #22d3ee44",
              borderRadius: "6px", color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", letterSpacing: "0.08em", padding: "10px", cursor: "pointer",
              fontWeight: 700,
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#22d3ee22"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#22d3ee14"; }}
          >
            CREATE AGENT
          </button>
        </div>
      </div>
    </div>
  );
}