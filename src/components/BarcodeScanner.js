import { useRef, useEffect, useCallback } from "react";

const s = {
  overlay: { position: "fixed", inset: 0, zIndex: 100, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 },
  video: { width: "100%", maxWidth: 400, borderRadius: "var(--radius)" },
  close: { background: "var(--danger)", color: "#fff", fontSize: 16, padding: "12px 24px", borderRadius: "var(--radius)", border: "none", cursor: "pointer" },
};

export default function BarcodeScanner({ scanning, onScan, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 480, height: 360 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const detector = new BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });

        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onScan(codes[0].rawValue);
              stop();
            }
          } catch {}
        }, 500);
      } catch {
        onClose();
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [scanning, onScan, onClose, stop]);

  if (!scanning) return null;

  return (
    <div style={s.overlay}>
      <video ref={videoRef} autoPlay playsInline style={s.video} />
      <button onClick={stop} style={s.close}>✕ Cerrar cámara</button>
    </div>
  );
}
