"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

const DEFAULT_QUANTITY = 1;
const STORAGE_KEY = "checkcompra_state";
const THEME_KEY = "checkcompra_theme";
const IVA_RATE = 0.21;

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

function loadTheme() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(THEME_KEY) || "dark";
}

function vibrate(ms = 15) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function format(n) {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

let _nextId = 1;

function genId() {
  return _nextId++;
}

export default function Home() {
  const saved = useMemo(loadState, []);
  const [products, setProducts] = useState(saved?.products ?? []);
  const [budget, setBudget] = useState(saved?.budget ?? "");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [price, setPrice] = useState("");
  const [showIva, setShowIva] = useState(saved?.showIva ?? false);
  const [theme, setTheme] = useState(loadTheme);
  const [editingId, setEditingId] = useState(null);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const idCounter = useRef(saved?.nextId ?? 1);

  _nextId = idCounter.current;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const persist = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      idCounter.current = _nextId;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            products,
            budget,
            showIva,
            nextId: idCounter.current,
          })
        );
      } catch {}
    }, 400);
  }, [products, budget, showIva]);

  useEffect(() => {
    persist();
    return () => clearTimeout(debounceRef.current);
  }, [persist]);

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity * p.price, 0),
    [products]
  );

  const iva = useMemo(() => (showIva ? total * IVA_RATE : 0), [total, showIva]);

  const grandTotal = useMemo(() => total + iva, [total, iva]);

  const budgetPercent = useMemo(
    () => (budget && Number(budget) > 0 ? (grandTotal / Number(budget)) * 100 : 0),
    [grandTotal, budget]
  );

  const totalClass = useMemo(() => {
    if (budgetPercent >= 100) return "danger";
    if (budgetPercent >= 80) return "warn";
    return "";
  }, [budgetPercent]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function addProduct(e) {
    e.preventDefault();
    const qty = Math.max(1, Number(quantity) || DEFAULT_QUANTITY);
    const prc = Number(price);
    if (!prc || prc <= 0) return;
    setProducts((prev) => [
      ...prev,
      {
        id: genId(),
        name: name.trim() || "Producto",
        quantity: qty,
        price: prc,
      },
    ]);
    setName("");
    setQuantity(DEFAULT_QUANTITY);
    setPrice("");
    vibrate(10);
    inputRef.current?.focus();
  }

  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    vibrate(8);
  }

  function updateQuantity(id, delta) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      )
    );
  }

  function updateField(id, field, value) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function finishEdit(id, field, value) {
    const clean =
      field === "price" ? Math.max(0.01, Number(value) || 0) : value.trim() || "Producto";
    if (field === "price" && clean <= 0) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: clean } : p))
    );
    setEditingId(null);
  }

  function clearAll() {
    if (products.length === 0) return;
    if (window.confirm("¿Vaciar todo el carrito?")) {
      setProducts([]);
    }
  }

  function handleEditStart(id) {
    if (editingId === id) {
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  }

  return (
    <div style={s.container}>
      <header style={{ ...s.header, background: "var(--header-bg)" }}>
        <div style={s.headerTop}>
          <h1 style={s.title}>🛒 Carrito</h1>
          <div style={s.headerActions}>
            <label style={s.ivaLabel}>
              <input
                type="checkbox"
                checked={showIva}
                onChange={() => setShowIva((v) => !v)}
                style={s.ivaCheckbox}
              />
              IVA 21%
            </label>
            <button onClick={toggleTheme} className="theme-btn" style={s.themeBtn}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        <div style={s.budgetRow}>
          <label style={s.budgetLabel}>Presupuesto máximo</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ej: 5000"
            style={s.budgetInput}
          />
        </div>
        <div
          style={{
            ...s.totalBox,
            ...(totalClass === "warn" ? s.totalWarn : {}),
            ...(totalClass === "danger" ? s.totalDanger : {}),
          }}
        >
          <div style={s.totalLabel}>TOTAL</div>
          <div style={s.totalAmount}>$ {format(grandTotal)}</div>
          {showIva && (
            <div style={s.ivaRow}>
              <span>Subtotal: $ {format(total)}</span>
              <span>IVA (21%): $ {format(iva)}</span>
            </div>
          )}
          {budget && Number(budget) > 0 && (
            <div style={s.progressWrap}>
              <div style={s.progressBg}>
                <div
                  style={{
                    ...s.progressFill,
                    width: `${Math.min(budgetPercent, 100)}%`,
                    background:
                      totalClass === "danger"
                        ? "var(--danger)"
                        : totalClass === "warn"
                        ? "var(--warn)"
                        : "var(--accent)",
                  }}
                />
              </div>
              <span style={s.progressText}>{budgetPercent.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </header>

      <form onSubmit={addProduct} style={s.form}>
        <div style={s.formRow}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Producto (opcional)"
            style={{ ...s.input, flex: 3 }}
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Cant"
            min="1"
            style={{ ...s.input, flex: 1 }}
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio $"
            min="0.01"
            step="0.01"
            style={{ ...s.input, flex: 2 }}
          />
        </div>
        <button type="submit" className="add-btn" style={s.addBtn}>
          + Agregar
        </button>
      </form>

      <div style={s.list}>
        {products.length === 0 && (
          <p style={s.empty}>Agregá productos para empezar</p>
        )}
        {products.map((p) => (
          <div key={p.id} style={s.item}>
            <div style={s.itemInfo} onClick={() => handleEditStart(p.id)}>
              {editingId === p.id ? (
                <div style={s.editGroup}>
                  <input
                    type="text"
                    defaultValue={p.name}
                    autoFocus
                    onBlur={(e) => finishEdit(p.id, "name", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishEdit(p.id, "name", e.target.value);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    style={s.editInput}
                  />
                  <input
                    type="number"
                    defaultValue={p.price}
                    step="0.01"
                    min="0.01"
                    onBlur={(e) => finishEdit(p.id, "price", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishEdit(p.id, "price", e.target.value);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    style={s.editInput}
                  />
                </div>
              ) : (
                <>
                  <span style={s.itemName}>{p.name}</span>
                  <span style={s.itemPrice}>
                    $ {format(p.quantity * p.price)}
                    {p.quantity > 1 && (
                      <span style={s.itemUnit}>
                        {" "}
                        ({p.quantity} × $ {format(p.price)})
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
            <div style={s.itemActions}>
              <button
                onClick={() => removeProduct(p.id)}
                className="del-btn"
                style={s.delBtn}
              >
                ✕
              </button>
              <div style={s.qtyGroup}>
                <button
                  onClick={() => updateQuantity(p.id, -1)}
                  className="qty-btn"
                  style={s.qtyBtn}
                >
                  −
                </button>
                <span style={s.qtyValue}>{p.quantity}</span>
                <button
                  onClick={() => updateQuantity(p.id, 1)}
                  className="qty-btn"
                  style={s.qtyBtn}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <button onClick={clearAll} style={s.clearBtn}>
          Vaciar carrito
        </button>
      )}

      <footer style={s.footer}>
        {products.length} producto{products.length !== 1 ? "s" : ""} · $
        {format(grandTotal)}
      </footer>
    </div>
  );
}

const s = {
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
    paddingBottom: 12,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  ivaLabel: {
    fontSize: 12,
    color: "var(--text-dim)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
  },
  ivaCheckbox: {
    width: 16,
    height: 16,
    cursor: "pointer",
  },
  themeBtn: {
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 20,
    width: 40,
    height: 40,
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
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
  ivaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 4,
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
    cursor: "pointer",
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
  itemUnit: {
    fontSize: 12,
    color: "var(--text-dim)",
    opacity: 0.7,
  },
  editGroup: {
    display: "flex",
    gap: 4,
  },
  editInput: {
    flex: 1,
    background: "var(--surface2)",
    color: "var(--text)",
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    minWidth: 0,
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
