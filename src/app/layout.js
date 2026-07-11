import "./globals.css";

export const metadata = {
  title: "Carrito — Control de Gastos",
  description: "Contador de carrito de compras en tiempo real",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Carrito", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
        }} />
      </body>
    </html>
  );
}
