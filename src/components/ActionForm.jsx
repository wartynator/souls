import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

export default function ActionForm({ open, actionId, onClose, onDelete }) {
  const { t } = useLocale();
  const toast = useToast();
  const allActions = useQuery(api.actions.list);
  const createAction = useMutation(api.actions.create);
  const updateAction = useMutation(api.actions.update);

  const editing = actionId ? allActions?.find((a) => a._id === actionId) : null;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setPrice(editing.price != null ? String(editing.price) : "");
      setNotes(editing.notes ?? "");
    } else {
      setName("");
      setPrice("");
      setNotes("");
    }
  }, [open, actionId, editing?.name]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.show(t("toastActionNameRequired")); return; }

    const parsedPrice = price.trim() ? parseFloat(price.replace(",", ".")) : undefined;
    if (price.trim() && isNaN(parsedPrice)) { toast.show(t("toastInvalidPrice")); return; }

    setSaving(true);
    try {
      if (actionId) {
        await updateAction({ id: actionId, name: name.trim(), price: parsedPrice, notes: notes.trim() || undefined });
        toast.show(t("toastActionUpdated"));
      } else {
        await createAction({ name: name.trim(), price: parsedPrice, notes: notes.trim() || undefined });
        toast.show(t("toastActionAdded"));
      }
      onClose();
    } catch {
      toast.show(t("toastSomethingWentWrong"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <form className="dialog__form" onSubmit={handleSubmit}>
        <header className="dialog__head">
          <h2 className="dialog__title">{actionId ? t("actionFormEdit") : t("actionFormNew")}</h2>
          <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="dialog__body">
          <div className="field">
            <label className="field__label">{t("fieldActionName")}</label>
            <input
              className="field__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fieldActionNamePlaceholder")}
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field__label">{t("fieldActionPrice")}</label>
            <input
              className="field__input"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("fieldActionPricePlaceholder")}
            />
          </div>
          <div className="field">
            <label className="field__label">{t("fieldNotes")}</label>
            <textarea
              className="field__input field__input--area"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("fieldActionNotesPlaceholder")}
            />
          </div>
        </div>
        <footer className="dialog__foot">
          <div>
            {actionId && (
              <button type="button" className="btn btn--text btn--danger" onClick={onDelete}>
                {t("btnDelete")}
              </button>
            )}
          </div>
          <div className="dialog__foot-end">
            <button type="button" className="btn btn--ghost" onClick={onClose}>{t("btnCancel")}</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? t("btnSaving") : t("btnSave")}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
