import ProductItem from "./ProductItem";

const s = {
  list: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  empty: { textAlign: "center", color: "var(--text-dim)", marginTop: 40, fontSize: 15 },
  clearBtn: { width: "100%", background: "transparent", color: "var(--danger)", fontSize: 14, padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--danger)", marginTop: 12, cursor: "pointer" },
};

export default function ProductList({
  products, filtered, editingId, onEditStart,
  onFinishEdit, onCancelEdit, onRemove, onUpdateQuantity, onClearAll,
}) {
  return (
    <>
      <div style={s.list}>
        {products.length === 0 && <p style={s.empty}>Agregá productos para empezar</p>}
        {filtered.map((p) => (
          <ProductItem
            key={p.id}
            product={p}
            isEditing={editingId === p.id}
            onEditStart={onEditStart}
            onFinishEdit={onFinishEdit}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
            onCancelEdit={onCancelEdit}
          />
        ))}
      </div>
      {products.length > 0 && <button onClick={onClearAll} style={s.clearBtn}>Vaciar carrito</button>}
    </>
  );
}
