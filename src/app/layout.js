import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Carrito — Control de Gastos",
  description: "Contador de carrito de compras en tiempo real",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Carrito", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
        }} />
      </body>
    </html>
  );
}
