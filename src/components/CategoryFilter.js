import { format } from "@/utils/constants";

const s = {
  catFilter: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8, scrollbarWidth: "none" },
  catFilterBtn: { whiteSpace: "nowrap", background: "var(--surface)", color: "var(--text)", fontSize: 12, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", flexShrink: 0 },
  catFilterActive: { background: "var(--accent)", color: "#fff" },
};

export default function CategoryFilter({ products, catTotals, filterCat, setFilterCat }) {
  if (products.length === 0) return null;

  return (
    <div style={s.catFilter}>
      <button onClick={() => setFilterCat("")} style={{ ...s.catFilterBtn, ...(filterCat === "" ? s.catFilterActive : {}) }}>Todos</button>
      {Object.entries(catTotals).map(([c, t]) => (
        <button key={c} onClick={() => setFilterCat(c)} style={{ ...s.catFilterBtn, ...(filterCat === c ? s.catFilterActive : {}) }}>
          {c} ${format(t)}
        </button>
      ))}
    </div>
  );
}
