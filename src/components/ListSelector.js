const s = {
  wrap: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8, scrollbarWidth: "none", alignItems: "center" },
  tab: { whiteSpace: "nowrap", background: "var(--surface)", color: "var(--text)", fontSize: 13, padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 },
  tabActive: { background: "var(--accent)", color: "#fff" },
  addBtn: { whiteSpace: "nowrap", background: "transparent", color: "var(--accent)", fontSize: 13, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px dashed var(--accent)", cursor: "pointer", flexShrink: 0 },
  delBtn: { background: "transparent", color: "var(--text-dim)", fontSize: 14, padding: 0, border: "none", cursor: "pointer", lineHeight: 1 },
};

export default function ListSelector({ lists, activeList, onSelectList, onCreateList, onDeleteList }) {
  const listIds = Object.keys(lists);

  return (
    <div style={s.wrap}>
      {listIds.map((id) => (
        <button key={id} onClick={() => onSelectList(id)} style={{ ...s.tab, ...(id === activeList ? s.tabActive : {}) }}>
          {lists[id].name}
          {listIds.length > 1 && (
            <span onClick={(e) => { e.stopPropagation(); onDeleteList(id); }} style={s.delBtn} aria-label={`Eliminar lista ${lists[id].name}`}>✕</span>
          )}
        </button>
      ))}
      <button onClick={onCreateList} style={s.addBtn} aria-label="Crear nueva lista">+ Nueva</button>
    </div>
  );
}
