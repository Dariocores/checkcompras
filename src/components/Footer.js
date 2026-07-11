import { format } from "@/utils/constants";

const s = {
  footer: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", padding: "12px 16px", textAlign: "center", fontSize: 13, color: "var(--text-dim)", borderTop: "1px solid var(--surface2)" },
};

export default function Footer({ count, total }) {
  return (
    <footer style={s.footer}>
      {count} producto{count !== 1 ? "s" : ""} · ${format(total)}
    </footer>
  );
}
