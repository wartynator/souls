import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n.jsx";
import Dialog from "./Dialog.jsx";

const FORMATS = [
  "aztec", "code_128", "code_39", "code_93", "codabar",
  "data_matrix", "ean_13", "ean_8", "itf", "pdf417",
  "qr_code", "upc_a", "upc_e",
];

/**
 * Returns a BarcodeDetector instance.
 * Uses the native API when available (Android Chrome, Safari 17.4+),
 * otherwise lazy-loads the ZXing-WASM polyfill so desktop browsers work too.
 */
async function buildDetector() {
  const Ctor =
    "BarcodeDetector" in window
      ? window.BarcodeDetector
      : (await import("barcode-detector/pure")).BarcodeDetector;

  try {
    return new Ctor({ formats: FORMATS });
  } catch {
    return new Ctor(); // some implementations reject unknown formats
  }
}

export default function BarcodeScanner({ onScan, onClose }) {
  const { t } = useLocale();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);
  const activeRef = useRef(true);

  const [phase, setPhase] = useState("starting"); // starting | scanning | detected | error
  const [detected, setDetected] = useState(null);

  // ── setup: detector + camera ─────────────────────────────────────────────

  useEffect(() => {
    activeRef.current = true;

    async function start() {
      try {
        detectorRef.current = await buildDetector();
      } catch {
        if (activeRef.current) setPhase("error");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        });
        if (!activeRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setPhase("scanning");
      } catch {
        if (activeRef.current) setPhase("error");
      }
    }

    start();

    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── scan loop ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "scanning") return;
    let loopActive = true;

    async function scan() {
      if (!loopActive || !videoRef.current || !detectorRef.current) return;
      if (videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0 && loopActive) {
          setDetected(barcodes[0].rawValue);
          setPhase("detected");
          return;
        }
      } catch {
        // frame not ready — keep looping
      }
      rafRef.current = requestAnimationFrame(scan);
    }

    scan();
    return () => {
      loopActive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // ── error state — shown as a proper dialog ───────────────────────────────

  if (phase === "error") {
    return (
      <Dialog open onClose={onClose} size="small">
        <div className="dialog__form">
          <header className="dialog__head">
            <h2 className="dialog__title">{t("scanBarcode")}</h2>
            <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>
          <div className="dialog__body">
            <p className="confirm__text">{t("scannerCameraError")}</p>
          </div>
          <footer className="dialog__foot">
            <div className="dialog__foot-end" style={{ marginLeft: "auto" }}>
              <button type="button" className="btn btn--primary" onClick={onClose}>
                {t("btnClose")}
              </button>
            </div>
          </footer>
        </div>
      </Dialog>
    );
  }

  // ── camera overlay ───────────────────────────────────────────────────────

  return (
    <div className="scanner-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>

      {phase === "detected" ? (
        <div className="scanner__card">
          <p className="scanner__card-label">{t("scannerDetected")}</p>
          <p className="scanner__result-value">{detected}</p>
          <div className="scanner__actions">
            <button className="btn btn--ghost" onClick={() => setPhase("scanning")}>
              {t("scannerRescan")}
            </button>
            <button className="btn btn--primary" onClick={() => onScan(detected)}>
              {t("scannerUse")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="scanner__frame">
            <video
              ref={videoRef}
              className="scanner__video"
              playsInline
              muted
              aria-label={t("scannerHint")}
            />
            <div className="scanner__reticle" aria-hidden="true" />
          </div>
          <p className="scanner__hint">{t("scannerHint")}</p>
          <button className="btn scanner__cancel" onClick={onClose}>
            {t("btnCancel")}
          </button>
        </>
      )}

    </div>
  );
}
