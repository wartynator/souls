import { useEffect, useRef } from "react";

/**
 * Thin wrapper around the native <dialog> element.
 *
 * - `open` controls visibility (via showModal/close)
 * - Clicking the backdrop calls `onClose`
 * - Pressing Esc automatically calls the dialog's native close event,
 *   which we forward to `onClose`
 *
 * `size`: "normal" | "small"
 */
export default function Dialog({ open, onClose, size = "normal", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => onClose?.();
    d.addEventListener("close", handleClose);
    return () => d.removeEventListener("close", handleClose);
  }, [onClose]);

  const onBackdropClick = (e) => {
    if (e.target !== ref.current) return; // clicks on children shouldn't close
    const r = ref.current.getBoundingClientRect();
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    if (!inside) onClose?.();
  };

  return (
    <dialog
      ref={ref}
      className={`dialog${size === "small" ? " dialog--small" : ""}`}
      onClick={onBackdropClick}
    >
      {children}
    </dialog>
  );
}
