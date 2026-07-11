const s = {
  banner: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, background: "var(--warn)", color: "#000", textAlign: "center", padding: "6px 12px", fontSize: 13, fontWeight: 600 },
};

export default function OfflineBanner({ online }) {
  if (online) return null;
  return <div style={s.banner} role="alert">Sin conexión — los cambios se guardan localmente</div>;
}
