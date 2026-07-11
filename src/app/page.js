"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { DEFAULT_QUANTITY, IVA_RATE, STORAGE_KEY, format, parsePrice } from "@/utils/constants";
import { useTheme } from "@/hooks/useTheme";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useOnline } from "@/hooks/useOnline";
import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import BarcodeScanner from "@/components/BarcodeScanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import OfflineBanner from "@/components/OfflineBanner";
import ListSelector from "@/components/ListSelector";
import SearchBar from "@/components/SearchBar";
import SortBar from "@/components/SortBar";

function loadAll() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.lists) return data;
    return {
      lists: {
        list_1: {
          name: "Mi compra",
          products: data.products ?? [],
          budget: data.budget ?? "",
          showIva: data.showIva ?? false,
          nextId: data.nextId ?? 1,
        },
      },
      activeList: "list_1",
    };
  } catch {
    return null;
  }
}

function makeId() {
  return `list_${Date.now()}`;
}

export default function Home() {
  const saved = useMemo(() => loadAll(), []);
  const [lists, setLists] = useState(saved?.lists ?? { list_1: { name: "Mi compra", products: [], budget: "", showIva: false, nextId: 1 } });
  const [activeList, setActiveList] = useState(saved?.activeList ?? "list_1");

  const list = lists[activeList] ?? Object.values(lists)[0];
  const products = list.products;
  const budget = list.budget;
  const showIva = list.showIva;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [scanning, setScanning] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState(null);
  const removedRef = useRef(null);
  const importRef = useRef(null);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const idCounter = useRef(list.nextId ?? 1);
  const { theme, toggleTheme } = useTheme();
  const { beep } = useAudioFeedback();
  const online = useOnline();

  const genId = useCallback(() => idCounter.current++, []);

  function updateList(patch) {
    setLists((prev) => ({
      ...prev,
      [activeList]: { ...prev[activeList], ...patch },
    }));
  }

  const persist = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const current = lists[activeList];
        if (!current) return;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            lists: { ...lists, [activeList]: { ...current, nextId: idCounter.current } },
            activeList,
          })
        );
      } catch {}
    }, 400);
  }, [lists, activeList]);

  useEffect(() => {
    persist();
    return () => clearTimeout(debounceRef.current);
  }, [persist]);

  const catFiltered = useMemo(
    () => (filterCat ? products.filter((p) => p.category === filterCat) : products),
    [products, filterCat]
  );

  const searched = useMemo(
    () => {
      if (!search) return catFiltered;
      const q = search.toLowerCase();
      return catFiltered.filter((p) => p.name.toLowerCase().includes(q));
    },
    [catFiltered, search]
  );

  const filtered = useMemo(() => {
    if (!sortBy) return searched;
    const sorted = [...searched];
    switch (sortBy) {
      case "name": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "category": sorted.sort((a, b) => (a.category || "Otros").localeCompare(b.category || "Otros")); break;
      case "quantity": sorted.sort((a, b) => b.quantity - a.quantity); break;
    }
    return sorted;
  }, [searched, sortBy]);

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
    updateList({
      products: [...products, {
        id: genId(),
        name: name.trim() || "Producto",
        quantity: qty,
        price: prc,
        category: category || "Otros",
      }],
    });
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
    updateList({ products: products.filter((p) => p.id !== id) });
    beep(400, 50, "square");
    setToast({ message: "Producto eliminado", action: "Deshacer", onAction: undoRemove });
  }

  function undoRemove() {
    if (!removedRef.current) return;
    updateList({ products: [...products, removedRef.current] });
    removedRef.current = null;
  }

  function updateQuantity(id, delta) {
    updateList({
      products: products.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      ),
    });
  }

  function finishEdit(id, field, value) {
    const clean =
      field === "price" ? Math.max(0.01, parsePrice(value) || 0)
      : field === "category" ? (value || "Otros")
      : value.trim() || "Producto";
    if (field === "price" && clean <= 0) return;
    updateList({
      products: products.map((p) => (p.id === id ? { ...p, [field]: clean } : p)),
    });
    setEditingId(null);
  }

  function clearAll() {
    if (products.length === 0) return;
    setConfirmClear(true);
  }

  function confirmClearAll() {
    updateList({ products: [] });
    setConfirmClear(false);
  }

  function setBudgetVal(v) { updateList({ budget: v }); }
  function toggleIva() { updateList({ showIva: !showIva }); }

  function createList() {
    const id = makeId();
    const name = prompt("Nombre de la nueva lista:");
    if (!name) return;
    setLists((prev) => ({
      ...prev,
      [id]: { name: name.trim(), products: [], budget: "", showIva: false, nextId: 1 },
    }));
    setActiveList(id);
  }

  function deleteList(id) {
    setLists((prev) => {
      const next = { ...prev };
      delete next[id];
      if (Object.keys(next).length === 0) {
        next.list_1 = { name: "Mi compra", products: [], budget: "", showIva: false, nextId: 1 };
      }
      return next;
    });
    if (activeList === id) {
      setActiveList(Object.keys(lists).find((k) => k !== id) ?? Object.keys(lists)[0]);
    }
  }

  function exportList() {
    const data = { name: list.name, products, budget, showIva };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Lista exportada" });
  }

  function importList() {
    importRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.products || !Array.isArray(data.products)) throw new Error("Formato inválido");
        const id = makeId();
        setLists((prev) => ({
          ...prev,
          [id]: {
            name: data.name || "Importada",
            products: data.products,
            budget: data.budget || "",
            showIva: data.showIva ?? false,
            nextId: Math.max(...data.products.map((p) => p.id ?? 0), 0) + 1,
          },
        }));
        setActiveList(id);
        setToast({ message: `Lista "${data.name || "Importada"}" cargada` });
      } catch {
        setToast({ message: "Archivo no válido" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function shareList() {
    const text = products
      .map((p) => `• ${p.name} x${p.quantity} = $${format(p.quantity * p.price)}`)
      .join("\n");
    const msg = `🛒 *${list.name}* — Total: $${format(grandTotal)}\n\n${text}`;
    if (navigator.share) {
      try { await navigator.share({ title: list.name, text: msg }); } catch {}
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
      <OfflineBanner online={online} />

      <ListSelector
        lists={lists}
        activeList={activeList}
        onSelectList={(id) => { setActiveList(id); setFilterCat(""); setSearch(""); setSortBy(""); setEditingId(null); }}
        onCreateList={createList}
        onDeleteList={deleteList}
      />

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        showIva={showIva}
        setShowIva={toggleIva}
        products={products}
        shareList={shareList}
        budget={budget}
        setBudget={setBudgetVal}
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

      <SearchBar value={search} onChange={setSearch} />

      <SortBar sortBy={sortBy} setSortBy={setSortBy} onExport={exportList} onImport={importList} />
      <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />

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
