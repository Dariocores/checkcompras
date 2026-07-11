import { useEffect, useState } from "react";

const s = {
  bar: { position: "fixed", bottom: 60, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--text)", padding: "12px 20px", borderRadius: "var(--radius)", fontSize: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 150, maxWidth: 400, width: "calc(100% - 32px)" },
  msg: { flex: 1 },
  undo: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
};

export default function Toast({ message, action, onAction, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div style={s.bar}>
      <span style={s.msg}>{message}</span>
      {action && (
        <button onClick={() => { onAction(); setVisible(false); }} style={s.undo}>{action}</button>
      )}
    </div>
  );
}
