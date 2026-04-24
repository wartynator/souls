import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ActionForm({
  open,
  actionId,
  presetDeviceId,
  devices,
  onClose,
  onDelete,
}) {
  const { t } = useLocale();
  const toast = useToast();

  const existing = useQuery(
    api.actions.listByDevice,
    presetDeviceId ? { deviceId: presetDeviceId } : "skip",
  );

  const createAction = useMutation(api.actions.create);
  const updateAction = useMutation(api.actions.update);

  const [deviceId, setDeviceId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  // When editing, load the existing action data from the parent-passed list
  const allActions = useQuery(api.actions.list);
  const editingAction = actionId
    ? allActions?.find((a) => a._id === actionId)
    : null;

  useEffect(() => {
    if (!open) return;
    if (editingAction) {
      setDeviceId(editingAction.deviceId);
      setName(editingAction.name);
      setPrice(editingAction.price != null ? String(editingAction.price) : "");
      setNotes(editingAction.notes ?? "");
      setDate(editingAction.date);
    } else {
      setDeviceId(presetDeviceId ?? (devices[0]?._id ?? ""));
      setName("");
      setPrice("");
      setNotes("");
      setDate(today());
    }
  }, [open, actionId, presetDeviceId]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.show(t("toastActionNameRequired")); return; }
    if (!deviceId) { toast.show(t("toastOwnerRequired")); return; }

    const parsedPrice = price.trim() ? parseFloat(price.replace(",", ".")) : undefined;
    if (price.trim() && isNaN(parsedPrice)) { toast.show(t("toastInvalidPrice")); return; }

    setSaving(true);
    try {
      if (actionId) {
        await updateAction({ id: actionId, deviceId, name: name.trim(), price: parsedPrice, notes: notes.trim() || undefined, date });
        toast.show(t("toastActionUpdated"));
      } else {
        await createAction({ deviceId, name: name.trim(), price: parsedPrice, notes: notes.trim() || undefined, date });
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
          <h2 className="dialog__title">
            {actionId ? t("actionFormEdit") : t("actionFormNew")}
          </h2>
          <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="dialog__body">
          <div className="field">
            <label className="field__label">{t("fieldActionDevice")}</label>
            <select
              className="field__input"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              required
            >
              {devices.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

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
            <label className="field__label">{t("fieldActionDate")}</label>
            <input
              className="field__input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              <button type="button" className="btn btn--ghost btn--danger" onClick={onDelete}>
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
