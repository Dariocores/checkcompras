import { useEffect, useRef } from "react";

const s = {
  overlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  box: { background: "var(--surface)", borderRadius: "var(--radius)", padding: "24px 20px", maxWidth: 320, width: "100%", textAlign: "center" },
  msg: { fontSize: 16, marginBottom: 20, color: "var(--text)" },
  actions: { display: "flex", gap: 10 },
  cancel: { flex: 1, padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface2)", background: "transparent", color: "var(--text)", fontSize: 15, cursor: "pointer" },
  confirm: { flex: 1, padding: "12px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--danger)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
};

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <p style={s.msg}>{message}</p>
        <div style={s.actions}>
          <button ref={cancelRef} onClick={onCancel} style={s.cancel}>Cancelar</button>
          <button onClick={onConfirm} style={s.confirm}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}
