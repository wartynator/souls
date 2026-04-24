import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DeviceActionForm({ open, deviceId, actions, onClose }) {
  const { t } = useLocale();
  const toast = useToast();
  const createDeviceAction = useMutation(api.deviceActions.create);

  const [actionId, setActionId] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActionId(actions[0]?._id ?? "");
    setDate(today());
    setNotes("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionId) { toast.show(t("toastActionRequired")); return; }

    setSaving(true);
    try {
      await createDeviceAction({
        deviceId,
        actionId,
        date,
        notes: notes.trim() || undefined,
      });
      toast.show(t("toastDeviceActionAdded"));
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
          <h2 className="dialog__title">{t("deviceActionFormTitle")}</h2>
          <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="dialog__body">
          <div className="field">
            <label className="field__label">{t("fieldActionName")}</label>
            <select
              className="field__input"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              required
            >
              {actions.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}{a.price != null ? ` — ${a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">{t("fieldActionDate")}</label>
            <input
              className="field__input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
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
          <span />
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
