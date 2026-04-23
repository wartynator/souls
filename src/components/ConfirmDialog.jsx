import Dialog from "./Dialog.jsx";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  text = "",
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} size="small">
      <div className="dialog__form">
        <header className="dialog__head">
          <h2 className="dialog__title">{title}</h2>
        </header>
        <div className="dialog__body">
          {text && <p className="confirm__text">{text}</p>}
        </div>
        <footer className="dialog__foot">
          <div className="dialog__foot-end" style={{ marginLeft: "auto" }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn confirm__ok" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
