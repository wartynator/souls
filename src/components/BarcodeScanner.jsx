import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n.jsx";

// Formats supported by BarcodeDetector — most common device/product codes
const FORMATS = [
  "aztec", "code_128", "code_39", "code_93", "codabar",
  "data_matrix", "ean_13", "ean_8", "itf", "pdf417",
  "qr_code", "upc_a", "upc_e",
];

export default function BarcodeScanner({ onScan, onClose }) {
  const { t } = useLocale();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);
  const activeRef = useRef(true);

  const [phase, setPhase] = useState("starting"); // starting | scanning | detected | error
  const [errorKind, setErrorKind] = useState(null); // notSupported | camera
  const [detected, setDetected] = useState(null);

  // ── camera + detector setup ──────────────────────────────────────────────

  useEffect(() => {
    activeRef.current = true;

    async function start() {
      if (!("BarcodeDetector" in window)) {
        setPhase("error");
        setErrorKind("notSupported");
        return;
      }

      try {
        detectorRef.current = new window.BarcodeDetector({ formats: FORMATS });
      } catch {
        // Some implementations don't accept all formats
        detectorRef.current = new window.BarcodeDetector();
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        });
        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setPhase("scanning");
      } catch {
        if (!activeRef.current) return;
        setPhase("error");
        setErrorKind("camera");
      }
    }

    start();

    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── scan loop — runs whenever phase === "scanning" ────────────────────────

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
        // Frame not ready yet — keep trying
      }
      rafRef.current = requestAnimationFrame(scan);
    }

    scan();

    return () => {
      loopActive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // ── backdrop click closes ────────────────────────────────────────────────

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="scanner-overlay" onClick={handleBackdrop}>

      {/* Error states */}
      {phase === "error" && (
        <div className="scanner__card">
          <p className="scanner__card-text">
            {errorKind === "notSupported"
              ? t("scannerNotSupported")
              : t("scannerCameraError")}
          </p>
          <button className="btn btn--ghost" onClick={onClose}>
            {t("btnClose")}
          </button>
        </div>
      )}

      {/* Detected */}
      {phase === "detected" && (
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
      )}

      {/* Camera view */}
      {(phase === "starting" || phase === "scanning") && (
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
