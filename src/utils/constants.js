export const DEFAULT_QUANTITY = 1;
export const STORAGE_KEY = "checkcompra_state";
export const THEME_KEY = "checkcompra_theme";
export const IVA_RATE = 0.21;

export const CATEGORIES = [
  "Almacén", "Bebidas", "Limpieza", "Frutas/Verduras",
  "Carnes", "Lácteos", "Congelados", "Panadería", "Otros",
];

let _nextId = 1;

export function genId() {
  return _nextId++;
}

export function setNextId(value) {
  _nextId = value;
}

export function format(n) {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadTheme() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(THEME_KEY) || "dark";
}
