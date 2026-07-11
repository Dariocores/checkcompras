import { memo } from "react";
import { format, parsePrice } from "@/utils/constants";

const s = {
  header: { position: "sticky", top: 0, zIndex: 10, paddingBottom: 12, background: "var(--header-bg)" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  ivaLabel: { fontSize: 12, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" },
  ivaCheckbox: { width: 16, height: 16, cursor: "pointer" },
  shareBtn: { background: "var(--surface)", color: "var(--text)", fontSize: 18, width: 40, height: 40, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" },
  themeBtn: { background: "var(--surface)", color: "var(--text)", fontSize: 20, width: 40, height: 40, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", border: "none", cursor: "pointer" },
  title: { fontSize: 24, fontWeight: 700 },
  budgetRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  budgetLabel: { fontSize: 13, color: "var(--text-dim)", whiteSpace: "nowrap" },
  budgetInput: { flex: 1, background: "var(--surface)", color: "var(--text)", padding: "10px 12px", borderRadius: "var(--radius-sm)", fontSize: 15, border: "none", outline: "none" },
  totalBox: { background: "var(--surface)", borderRadius: "var(--radius)", padding: "14px 18px", transition: "background 0.3s" },
  totalWarn: { background: "var(--warn-bg)", boxShadow: "0 0 0 1px var(--warn)" },
  totalDanger: { background: "var(--danger-bg)", boxShadow: "0 0 0 1px var(--danger)" },
  totalLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)" },
  totalAmount: { fontSize: 32, fontWeight: 800, lineHeight: 1.2 },
  ivaRow: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginTop: 4 },
  progressWrap: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
  progressBg: { flex: 1, height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.3s, background 0.3s" },
  progressText: { fontSize: 12, color: "var(--text-dim)", minWidth: 40, textAlign: "right" },
};

function Header({
  theme, toggleTheme, showIva, setShowIva,
  products, shareList, budget, setBudget,
  total, iva, grandTotal, budgetPercent, totalClass,
}) {
  return (
    <header style={s.header}>
      <div style={s.headerTop}>
        <h1 style={s.title}>🛒 Carrito</h1>
        <div style={s.headerActions}>
          <label style={s.ivaLabel}>
            <input type="checkbox" checked={showIva} onChange={() => setShowIva((v) => !v)} style={s.ivaCheckbox} />
            IVA 21%
          </label>
          {products.length > 0 && (
            <button onClick={shareList} style={s.shareBtn} title="Compartir" aria-label="Compartir lista">📤</button>
          )}
          <button onClick={toggleTheme} className="theme-btn" style={s.themeBtn} aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
      <div style={s.budgetRow}>
        <label style={s.budgetLabel}>Presupuesto máximo</label>
        <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ej: 5000" style={s.budgetInput} />
      </div>
      <div style={{ ...s.totalBox, ...(totalClass === "warn" ? s.totalWarn : {}), ...(totalClass === "danger" ? s.totalDanger : {}) }}>
        <div style={s.totalLabel}>TOTAL</div>
        <div style={s.totalAmount}>$ {format(grandTotal)}</div>
        {showIva && (
          <div style={s.ivaRow}>
            <span>Subtotal: $ {format(total)}</span>
            <span>IVA (21%): $ {format(iva)}</span>
          </div>
        )}
        {budget && parsePrice(budget) > 0 && (
          <div style={s.progressWrap}>
            <div style={s.progressBg}>
              <div style={{ ...s.progressFill, width: `${Math.min(budgetPercent, 100)}%`, background: totalClass === "danger" ? "var(--danger)" : totalClass === "warn" ? "var(--warn)" : "var(--accent)" }} />
            </div>
            <span style={s.progressText}>{budgetPercent.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
