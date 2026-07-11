const s = {
  wrap: { position: "relative", marginBottom: 8 },
  input: { width: "100%", background: "var(--surface)", color: "var(--text)", padding: "12px 12px 12px 36px", borderRadius: "var(--radius-sm)", fontSize: 15, border: "none", outline: "none" },
  icon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text-dim)", pointerEvents: "none" },
  clear: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", color: "var(--text-dim)", fontSize: 16, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" },
};

export default function SearchBar({ value, onChange }) {
  return (
    <div style={s.wrap}>
      <span style={s.icon}>🔍</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Buscar producto..." style={s.input} aria-label="Buscar producto" />
      {value && <button onClick={() => onChange("")} style={s.clear} aria-label="Limpiar búsqueda">✕</button>}
    </div>
  );
}
