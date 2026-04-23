import Dialog from "./Dialog.jsx";
import { useLocale } from "../i18n.jsx";

export default function ConfirmDialog({
  open,
  title,
  text = "",
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const { t } = useLocale();
  return (
    <Dialog open={open} onClose={onCancel} size="small">
      <div className="dialog__form">
        <header className="dialog__head">
          <h2 className="dialog__title">{title ?? t("confirmDelete") + "?"}</h2>
        </header>
        <div className="dialog__body">
          {text && <p className="confirm__text">{text}</p>}
        </div>
        <footer className="dialog__foot">
          <div className="dialog__foot-end" style={{ marginLeft: "auto" }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              {t("btnCancel")}
            </button>
            <button type="button" className="btn confirm__ok" onClick={onConfirm}>
              {confirmLabel ?? t("confirmDelete")}
            </button>
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
