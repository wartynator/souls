import { useEffect, useMemo, useState } from "react";
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
  onAddWorklist,
}) {
  const toast = useToast();
  const { t } = useLocale();
  const createDevice = useMutation(api.devices.create);
  const updateDevice = useMutation(api.devices.update);

  const editing = deviceId ? devices.find((d) => d._id === deviceId) ?? null : null;

  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [ownerHighlight, setOwnerHighlight] = useState(0);
  const [notes, setNotes] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const contactFullName = (c) =>
    [c.name, c.surname].filter(Boolean).join(" ");

  const sortedContacts = useMemo(
    () =>
      [...contacts].sort((a, b) =>
        ((a.surname || a.name) || "").localeCompare(
          (b.surname || b.name) || "",
          undefined,
          { sensitivity: "base" },
        ),
      ),
    [contacts],
  );

  const ownerOptions = useMemo(() => {
    const q = ownerSearch.trim().toLowerCase();
    if (!q) return sortedContacts;
    return sortedContacts.filter((c) =>
      contactFullName(c).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedContacts, ownerSearch]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || "");
      setOwnerId(editing.contactId);
      const ownerContact = contacts.find((c) => c._id === editing.contactId);
      setOwnerSearch(ownerContact ? contactFullName(ownerContact) : "");
      setNotes(editing.notes || "");
      setBarcode(editing.barcode || "");
    } else {
      setName("");
      const presetContact = presetOwnerId
        ? contacts.find((c) => c._id === presetOwnerId)
        : sortedContacts[0];
      setOwnerId(presetContact?._id || "");
      setOwnerSearch(presetContact ? contactFullName(presetContact) : "");
      setNotes("");
      setBarcode("");
    }
    setOwnerOpen(false);
    setOwnerHighlight(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deviceId, presetOwnerId]);

  const selectOwner = (contact) => {
    setOwnerId(contact._id);
    setOwnerSearch(contactFullName(contact));
    setOwnerOpen(false);
    setOwnerHighlight(0);
  };

  const handleOwnerKeyDown = (e) => {
    if (!ownerOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOwnerOpen(true);
        setOwnerHighlight(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setOwnerHighlight((h) => Math.min(h + 1, ownerOptions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setOwnerHighlight((h) => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (ownerOptions[ownerHighlight]) {
        selectOwner(ownerOptions[ownerHighlight]);
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOwnerOpen(false);
      const prev = contacts.find((c) => c._id === ownerId);
      setOwnerSearch(prev ? contactFullName(prev) : "");
    }
  };

  const handleOwnerBlur = () => {
    setTimeout(() => {
      setOwnerOpen(false);
      if (ownerId) {
        const selected = contacts.find((c) => c._id === ownerId);
        setOwnerSearch(selected ? contactFullName(selected) : "");
      } else if (ownerSearch.trim()) {
        const match = sortedContacts.find(
          (c) => contactFullName(c).toLowerCase() === ownerSearch.trim().toLowerCase(),
        );
        if (match) {
          setOwnerId(match._id);
          setOwnerSearch(contactFullName(match));
        } else {
          setOwnerSearch("");
        }
      }
    }, 150);
  };

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
          <div className="dialog__head-actions">
            {editing && onAddWorklist && (
              <button
                type="button"
                className="dialog__action-btn"
                onClick={() => onAddWorklist(editing._id, editing.contactId)}
                title={t("deviceLogWork")}
                aria-label={t("deviceLogWork")}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
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
            <div className="combobox">
              <input
                className="field__input"
                type="text"
                value={ownerSearch}
                onChange={(e) => {
                  setOwnerSearch(e.target.value);
                  setOwnerId("");
                  setOwnerOpen(true);
                  setOwnerHighlight(0);
                }}
                onFocus={() => { setOwnerOpen(true); setOwnerHighlight(0); }}
                onBlur={handleOwnerBlur}
                onKeyDown={handleOwnerKeyDown}
                placeholder={t("fieldOwnerSearch")}
                autoComplete="off"
              />
              {ownerOpen && ownerOptions.length > 0 && (
                <ul className="combobox__list" role="listbox">
                  {ownerOptions.map((c, i) => (
                    <li
                      key={c._id}
                      role="option"
                      aria-selected={c._id === ownerId}
                      className={`combobox__option${i === ownerHighlight ? " is-highlight" : ""}${c._id === ownerId ? " is-selected" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); selectOwner(c); }}
                    >
                      {contactFullName(c) || t("contactUnnamed")}
                    </li>
                  ))}
                </ul>
              )}
              {ownerOpen && ownerOptions.length === 0 && (
                <div className="combobox__empty">{t("emptyNoMatchesTitle")}</div>
              )}
            </div>
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
          {editing && (
            <button type="button" className="form-delete-link" onClick={onDelete}>
              {t("btnDeleteDevice")}
            </button>
          )}
        </div>
        <footer className="dialog__foot">
          <span />
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
