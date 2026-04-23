import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

export default function DeviceForm({
  open,
  deviceId,
  presetOwnerId,
  devices,
  contacts,
  onClose,
  onDelete,
}) {
  const toast = useToast();
  const { t } = useLocale();
  const createDevice = useMutation(api.devices.create);
  const updateDevice = useMutation(api.devices.update);

  const editing = deviceId ? devices.find((d) => d._id === deviceId) ?? null : null;

  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedContacts = [...contacts].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || "");
      setOwnerId(editing.contactId);
      setNotes(editing.notes || "");
    } else {
      setName("");
      setOwnerId(presetOwnerId || sortedContacts[0]?._id || "");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deviceId, presetOwnerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) {
      toast.show(t("toastDeviceNameRequired"));
      return;
    }
    if (!ownerId) {
      toast.show(t("toastOwnerRequired"));
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateDevice({
          id: editing._id,
          contactId: ownerId,
          name,
          notes: notes || undefined,
        });
        toast.show(t("toastDeviceUpdated"));
      } else {
        await createDevice({
          contactId: ownerId,
          name,
          notes: notes || undefined,
        });
        toast.show(t("toastDeviceAdded"));
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.show(t("toastCouldNotSaveDevice"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form className="dialog__form" onSubmit={handleSubmit}>
        <header className="dialog__head">
          <h2 className="dialog__title">{editing ? t("deviceFormEdit") : t("deviceFormNew")}</h2>
          <button
            type="button"
            className="dialog__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="dialog__body">
          <label className="field">
            <span className="field__label">{t("fieldDeviceName")}</span>
            <input
              className="field__input"
              type="text"
              maxLength={100}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fieldDeviceNamePlaceholder")}
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field__label">{t("fieldOwner")}</span>
            <select
              className="field__input"
              required
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              {sortedContacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">{t("fieldNotes")}</span>
            <textarea
              className="field__input field__input--area"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("fieldNotesPlaceholder")}
            />
          </label>
        </div>
        <footer className="dialog__foot">
          {editing ? (
            <button
              type="button"
              className="btn btn--text btn--danger"
              onClick={onDelete}
            >
              {t("btnDelete")}
            </button>
          ) : (
            <span />
          )}
          <div className="dialog__foot-end">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t("btnCancel")}
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? t("btnSaving") : t("btnSave")}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
