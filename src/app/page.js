"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { DEFAULT_QUANTITY, IVA_RATE, CATEGORIES, loadState, format, parsePrice } from "@/utils/constants";
import { useTheme } from "@/hooks/useTheme";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import BarcodeScanner from "@/components/BarcodeScanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

export default function Home() {
  const saved = useMemo(() => loadState(), []);
  const [products, setProducts] = useState(saved?.products ?? []);
  const [budget, setBudget] = useState(saved?.budget ?? "");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [showIva, setShowIva] = useState(saved?.showIva ?? false);
  const [editingId, setEditingId] = useState(null);
  const [filterCat, setFilterCat] = useState("");
  const [scanning, setScanning] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState(null);
  const removedRef = useRef(null);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const idCounter = useRef(saved?.nextId ?? 1);
  const { theme, toggleTheme } = useTheme();
  const { beep } = useAudioFeedback();

  const genId = useCallback(() => idCounter.current++, []);

  const persist = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "checkcompra_state",
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

  const filtered = useMemo(
    () => (filterCat ? products.filter((p) => p.category === filterCat) : products),
    [products, filterCat]
  );

  const catTotals = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const c = p.category || "Otros";
      map[c] = (map[c] || 0) + p.quantity * p.price;
    });
    return map;
  }, [products]);

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity * p.price, 0),
    [products]
  );

  const iva = useMemo(() => (showIva ? total * IVA_RATE : 0), [total, showIva]);
  const grandTotal = useMemo(() => total + iva, [total, iva]);

  const budgetPercent = useMemo(
    () => (budget && parsePrice(budget) > 0 ? (grandTotal / parsePrice(budget)) * 100 : 0),
    [grandTotal, budget]
  );

  const totalClass = useMemo(() => {
    if (budgetPercent >= 100) return "danger";
    if (budgetPercent >= 80) return "warn";
    return "";
  }, [budgetPercent]);

  function addProduct(e) {
    e.preventDefault();
    const qty = Math.max(1, Number(quantity) || DEFAULT_QUANTITY);
    const prc = parsePrice(price);
    if (!prc || prc <= 0) return;
    setProducts((prev) => [
      ...prev,
      {
        id: genId(),
        name: name.trim() || "Producto",
        quantity: qty,
        price: prc,
        category: category || "Otros",
      },
    ]);
    setName("");
    setQuantity(DEFAULT_QUANTITY);
    setPrice("");
    setCategory("");
    beep(900, 60);
    inputRef.current?.focus();
  }

  function removeProduct(id) {
    const product = products.find((p) => p.id === id);
    removedRef.current = product;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    beep(400, 50, "square");
    setToast({ message: "Producto eliminado", action: "Deshacer", onAction: undoRemove });
  }

  function undoRemove() {
    if (!removedRef.current) return;
    setProducts((prev) => [...prev, removedRef.current]);
    removedRef.current = null;
  }

  function updateQuantity(id, delta) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      )
    );
  }

  function finishEdit(id, field, value) {
    const clean =
      field === "price" ? Math.max(0.01, parsePrice(value) || 0) : value.trim() || "Producto";
    if (field === "price" && clean <= 0) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: clean } : p))
    );
    setEditingId(null);
  }

  function clearAll() {
    if (products.length === 0) return;
    setConfirmClear(true);
  }

  function confirmClearAll() {
    setProducts([]);
    setConfirmClear(false);
  }

  async function shareList() {
    const text = products
      .map((p) => `• ${p.name} x${p.quantity} = $${format(p.quantity * p.price)}`)
      .join("\n");
    const msg = `🛒 *Mi compra* — Total: $${format(grandTotal)}\n\n${text}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Mi compra", text: msg }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(msg);
        setToast({ message: "Lista copiada al portapapeles" });
      } catch {}
    }
  }

  async function startScan() {
    if (!("BarcodeDetector" in window)) {
      setToast({ message: "Tu navegador no soporta el lector de códigos de barras" });
      return;
    }
    setScanning(true);
  }

  function handleScan(code) {
    beep(1200, 100);
    setName(`Código: ${code}`);
    setScanning(false);
    inputRef.current?.focus();
  }

  const container = { maxWidth: 480, margin: "0 auto", padding: "16px 12px 100px", minHeight: "100vh", display: "flex", flexDirection: "column" };

  return (
    <div style={container}>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        showIva={showIva}
        setShowIva={setShowIva}
        products={products}
        shareList={shareList}
        budget={budget}
        setBudget={setBudget}
        total={total}
        iva={iva}
        grandTotal={grandTotal}
        budgetPercent={budgetPercent}
        totalClass={totalClass}
      />

      <ProductForm
        inputRef={inputRef}
        name={name}
        setName={setName}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        category={category}
        setCategory={setCategory}
        onSubmit={addProduct}
        onStartScan={startScan}
      />

      <BarcodeScanner
        scanning={scanning}
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />

      <CategoryFilter
        products={products}
        catTotals={catTotals}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
      />

      <ProductList
        products={products}
        filtered={filtered}
        editingId={editingId}
        onEditStart={(id) => setEditingId((prev) => (prev === id ? null : id))}
        onFinishEdit={finishEdit}
        onCancelEdit={() => setEditingId(null)}
        onRemove={removeProduct}
        onUpdateQuantity={updateQuantity}
        onClearAll={clearAll}
      />

      <Footer count={products.length} total={grandTotal} />

      {confirmClear && (
        <ConfirmDialog
          message="¿Vaciar todo el carrito?"
          onConfirm={confirmClearAll}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onAction={toast.onAction}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
