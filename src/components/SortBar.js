import { CATEGORIES } from "@/utils/constants";

const s = {
  wrap: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center" },
  label: { fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" },
  select: { flex: 1, background: "var(--surface)", color: "var(--text)", padding: "8px 10px", borderRadius: "var(--radius-sm)", fontSize: 13, border: "none", outline: "none" },
  exportBtn: { background: "var(--surface)", color: "var(--text)", fontSize: 13, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", whiteSpace: "nowrap" },
  importBtn: { background: "var(--surface)", color: "var(--text)", fontSize: 13, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", whiteSpace: "nowrap" },
};

export default function SortBar({ sortBy, setSortBy, onExport, onImport }) {
  return (
    <div style={s.wrap}>
      <span style={s.label}>Ordenar:</span>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={s.select} aria-label="Ordenar productos">
        <option value="">Manual</option>
        <option value="name">Nombre</option>
        <option value="price-asc">Precio ↑</option>
        <option value="price-desc">Precio ↓</option>
        <option value="category">Categoría</option>
        <option value="quantity">Cantidad</option>
      </select>
      <button onClick={onExport} style={s.exportBtn} title="Exportar lista como JSON" aria-label="Exportar datos">📥</button>
      <button onClick={onImport} style={s.importBtn} title="Importar lista desde JSON" aria-label="Importar datos">📤</button>
    </div>
  );
}
