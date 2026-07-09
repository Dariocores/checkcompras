"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const DEFAULT_QUANTITY = 1;
const STORAGE_KEY = "checkcompra_state";

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

let nextId = 1;

function createProduct(name, quantity, price) {
  return { id: nextId++, name, quantity, price };
}

export default function Home() {
  const saved = useMemo(loadState, []);
  const [products, setProducts] = useState(saved?.products ?? []);
  const [budget, setBudget] = useState(saved?.budget ?? "");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [price, setPrice] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (saved?.nextId) nextId = saved.nextId;
  }, [saved]);

  useEffect(() => {
    saveState({ products, budget, nextId });
  }, [products, budget]);

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity * p.price, 0),
    [products]
  );

  const budgetPercent = useMemo(
    () => (budget && Number(budget) > 0 ? (total / Number(budget)) * 100 : 0),
    [total, budget]
  );

  const totalClass = useMemo(() => {
    if (budgetPercent >= 100) return "danger";
    if (budgetPercent >= 80) return "warn";
    return "";
  }, [budgetPercent]);

  function addProduct(e) {
    e.preventDefault();
    const qty = Math.max(1, Number(quantity) || DEFAULT_QUANTITY);
    const prc = Number(price);
    if (!prc || prc <= 0) return;
    setProducts((prev) => [
      ...prev,
      createProduct(name.trim() || `Producto`, qty, prc),
    ]);
    setName("");
    setQuantity(DEFAULT_QUANTITY);
    setPrice("");
    inputRef.current?.focus();
  }

  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function updateQuantity(id, delta) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      )
    );
  }

  function format(n) {
    return n.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function clearAll() {
    if (products.length === 0) return;
    if (window.confirm("¿Vaciar todo el carrito?")) {
      setProducts([]);
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🛒 Carrito</h1>
        <div style={styles.budgetRow}>
          <label style={styles.budgetLabel}>Presupuesto máximo</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ej: 5000"
            style={styles.budgetInput}
          />
        </div>
        <div style={{ ...styles.totalBox, ...(totalClass === "warn" ? styles.totalWarn : {}), ...(totalClass === "danger" ? styles.totalDanger : {}) }}>
          <div style={styles.totalLabel}>TOTAL</div>
          <div style={styles.totalAmount}>$ {format(total)}</div>
          {budget && Number(budget) > 0 && (
            <div style={styles.progressWrap}>
              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: `${Math.min(budgetPercent, 100)}%`, background: totalClass === "danger" ? "var(--danger)" : totalClass === "warn" ? "var(--warn)" : "var(--accent)" }} />
              </div>
              <span style={styles.progressText}>{budgetPercent.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </header>

      <form onSubmit={addProduct} style={styles.form}>
        <div style={styles.formRow}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Producto (opcional)"
            style={{ ...styles.input, flex: 3 }}
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Cant"
            min="1"
            style={{ ...styles.input, flex: 1 }}
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio $"
            min="0.01"
            step="0.01"
            style={{ ...styles.input, flex: 2 }}
          />
        </div>
        <button type="submit" style={styles.addBtn}>+ Agregar</button>
      </form>

      <div style={styles.list}>
        {products.length === 0 && (
          <p style={styles.empty}>Agregá productos para empezar</p>
        )}
        {products.map((p) => (
          <div key={p.id} style={styles.item}>
            <div style={styles.itemInfo}>
              <span style={styles.itemName}>{p.name}</span>
              <span style={styles.itemPrice}>$ {format(p.quantity * p.price)}</span>
            </div>
            <div style={styles.itemActions}>
              <button onClick={() => removeProduct(p.id)} style={styles.delBtn}>✕</button>
              <div style={styles.qtyGroup}>
                <button onClick={() => updateQuantity(p.id, -1)} style={styles.qtyBtn}>−</button>
                <span style={styles.qtyValue}>{p.quantity}</span>
                <button onClick={() => updateQuantity(p.id, 1)} style={styles.qtyBtn}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <button onClick={clearAll} style={styles.clearBtn}>Vaciar carrito</button>
      )}

      <footer style={styles.footer}>
        {products.length} producto{products.length !== 1 ? "s" : ""} · $ {format(total)}
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 12px 100px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "var(--bg)",
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  budgetRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 13,
    color: "var(--text-dim)",
    whiteSpace: "nowrap",
  },
  budgetInput: {
    flex: 1,
    background: "var(--surface)",
    color: "var(--text)",
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: 15,
  },
  totalBox: {
    background: "var(--surface)",
    borderRadius: "var(--radius)",
    padding: "14px 18px",
    transition: "background 0.3s",
  },
  totalWarn: {
    background: "var(--warn-bg)",
    boxShadow: "0 0 0 1px var(--warn)",
  },
  totalDanger: {
    background: "var(--danger-bg)",
    boxShadow: "0 0 0 1px var(--danger)",
  },
  totalLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-dim)",
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  progressBg: {
    flex: 1,
    height: 6,
    background: "var(--surface2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s, background 0.3s",
  },
  progressText: {
    fontSize: 12,
    color: "var(--text-dim)",
    minWidth: 40,
    textAlign: "right",
  },
  form: {
    marginBottom: 16,
  },
  formRow: {
    display: "flex",
    gap: 6,
    marginBottom: 8,
  },
  input: {
    background: "var(--surface)",
    color: "var(--text)",
    padding: "14px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: 16,
    minWidth: 0,
  },
  addBtn: {
    width: "100%",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    padding: "14px",
    borderRadius: "var(--radius)",
    transition: "background 0.2s",
  },
  list: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: {
    textAlign: "center",
    color: "var(--text-dim)",
    marginTop: 40,
    fontSize: 15,
  },
  item: {
    background: "var(--surface)",
    borderRadius: "var(--radius)",
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemPrice: {
    fontSize: 14,
    color: "var(--text-dim)",
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  delBtn: {
    background: "transparent",
    color: "var(--danger)",
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyGroup: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    background: "var(--surface2)",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
  },
  qtyBtn: {
    background: "transparent",
    color: "var(--text)",
    fontSize: 18,
    fontWeight: 600,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  qtyValue: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 15,
    fontWeight: 600,
  },
  clearBtn: {
    width: "100%",
    background: "transparent",
    color: "var(--danger)",
    fontSize: 14,
    padding: "12px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--danger)",
    marginTop: 12,
  },
  footer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--surface)",
    padding: "12px 16px",
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-dim)",
    borderTop: "1px solid var(--surface2)",
  },
};
