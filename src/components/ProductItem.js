import { format } from "@/utils/constants";

const s = {
  item: { background: "var(--surface)", borderRadius: "var(--radius)", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  itemInfo: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0, cursor: "pointer" },
  itemName: { fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemCat: { fontSize: 11, color: "var(--text-dim)", fontWeight: 400, marginLeft: 6 },
  itemPrice: { fontSize: 14, color: "var(--text-dim)" },
  itemUnit: { fontSize: 12, color: "var(--text-dim)", opacity: 0.7 },
  editGroup: { display: "flex", gap: 4 },
  editInput: { flex: 1, background: "var(--surface2)", color: "var(--text)", padding: "6px 8px", borderRadius: "var(--radius-sm)", fontSize: 14, minWidth: 0, border: "none", outline: "none" },
  itemActions: { display: "flex", alignItems: "center", gap: 6 },
  delBtn: { background: "transparent", color: "var(--danger)", fontSize: 18, width: 36, height: 36, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" },
  qtyGroup: { display: "flex", alignItems: "center", gap: 2, background: "var(--surface2)", borderRadius: "var(--radius-sm)", overflow: "hidden" },
  qtyBtn: { background: "transparent", color: "var(--text)", fontSize: 18, fontWeight: 600, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", border: "none", cursor: "pointer" },
  qtyValue: { minWidth: 28, textAlign: "center", fontSize: 15, fontWeight: 600 },
};

export default function ProductItem({
  product, isEditing, onEditStart, onFinishEdit,
  onRemove, onUpdateQuantity, onCancelEdit,
}) {
  const p = product;

  return (
    <div style={s.item}>
      <div style={s.itemInfo} onClick={() => onEditStart(p.id)}>
        {isEditing ? (
          <div style={s.editGroup}>
            <input type="text" defaultValue={p.name} autoFocus onBlur={(e) => onFinishEdit(p.id, "name", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onFinishEdit(p.id, "name", e.target.value); if (e.key === "Escape") onCancelEdit(); }} style={s.editInput} />
            <input type="number" defaultValue={p.price} step="0.01" min="0.01" onBlur={(e) => onFinishEdit(p.id, "price", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onFinishEdit(p.id, "price", e.target.value); if (e.key === "Escape") onCancelEdit(); }} style={s.editInput} />
          </div>
        ) : (
          <>
            <span style={s.itemName}>{p.name} <span style={s.itemCat}>{p.category}</span></span>
            <span style={s.itemPrice}>
              $ {format(p.quantity * p.price)}
              {p.quantity > 1 && <span style={s.itemUnit}> ({p.quantity} × $ {format(p.price)})</span>}
            </span>
          </>
        )}
      </div>
      <div style={s.itemActions}>
        <button onClick={() => onRemove(p.id)} className="del-btn" style={s.delBtn}>✕</button>
        <div style={s.qtyGroup}>
          <button onClick={() => onUpdateQuantity(p.id, -1)} className="qty-btn" style={s.qtyBtn}>−</button>
          <span style={s.qtyValue}>{p.quantity}</span>
          <button onClick={() => onUpdateQuantity(p.id, 1)} className="qty-btn" style={s.qtyBtn}>+</button>
        </div>
      </div>
    </div>
  );
}
