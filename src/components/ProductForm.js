import { CATEGORIES } from "@/utils/constants";

const s = {
  form: { marginBottom: 8 },
  formRow: { display: "flex", gap: 6, marginBottom: 6 },
  input: { background: "var(--surface)", color: "var(--text)", padding: "14px 12px", borderRadius: "var(--radius-sm)", fontSize: 16, minWidth: 0, border: "none", outline: "none" },
  catRow: { display: "flex", gap: 6, marginBottom: 8, alignItems: "stretch" },
  scanBtn: { background: "var(--surface)", color: "var(--text)", fontSize: 20, width: 48, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" },
  addBtn: { width: "100%", background: "var(--accent)", color: "#fff", fontSize: 16, fontWeight: 600, padding: "14px", borderRadius: "var(--radius)", transition: "background 0.2s", border: "none", cursor: "pointer" },
};

export default function ProductForm({
  inputRef, name, setName, quantity, setQuantity,
  price, setPrice, category, setCategory,
  onSubmit, onStartScan,
}) {
  return (
    <form onSubmit={onSubmit} style={s.form}>
      <div style={s.formRow}>
        <input ref={inputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Producto (opcional)" style={{ ...s.input, flex: 3 }} />
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Cant" min="1" style={{ ...s.input, flex: 1 }} />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio $" min="0.01" step="0.01" style={{ ...s.input, flex: 2 }} />
      </div>
      <div style={s.catRow}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...s.input, flex: 1 }}>
          <option value="">Sin categoría</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={onStartScan} style={s.scanBtn} title="Escanear código de barras">📷</button>
      </div>
      <button type="submit" className="add-btn" style={s.addBtn}>+ Agregar</button>
    </form>
  );
}
