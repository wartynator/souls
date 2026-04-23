import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";
import BarcodeScanner from "./BarcodeScanner.jsx";

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
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
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
      setBarcode(editing.barcode || "");
    } else {
      setName("");
      setOwnerId(presetOwnerId || sortedContacts[0]?._id || "");
      setNotes("");
      setBarcode("");
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
          barcode: barcode || undefined,
        });
        toast.show(t("toastDeviceUpdated"));
      } else {
        await createDevice({
          contactId: ownerId,
          name,
          notes: notes || undefined,
          barcode: barcode || undefined,
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
    <>
    {scannerOpen && (
      <BarcodeScanner
        onScan={(value) => { setBarcode(value); setScannerOpen(false); }}
        onClose={() => setScannerOpen(false)}
      />
    )}
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
          <label className="field">
            <span className="field__label">{t("fieldBarcode")}</span>
            <div className="field__input-row">
              <input
                className="field__input"
                type="text"
                maxLength={100}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t("fieldBarcodePlaceholder")}
              />
              <button
                type="button"
                className="btn btn--ghost btn--small field__scan-btn"
                onClick={() => setScannerOpen(true)}
                title={t("scanBarcode")}
                aria-label={t("scanBarcode")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="2" height="16" fill="currentColor" />
                  <rect x="6" y="4" width="1" height="16" fill="currentColor" />
                  <rect x="9" y="4" width="2" height="16" fill="currentColor" />
                  <rect x="13" y="4" width="1" height="16" fill="currentColor" />
                  <rect x="16" y="4" width="3" height="16" fill="currentColor" />
                  <rect x="21" y="4" width="1" height="16" fill="currentColor" />
                </svg>
              </button>
            </div>
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
    </>
  );
}
