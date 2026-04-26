import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

function contactFullName(c) {
  return [c.name, c.surname].filter(Boolean).join(" ");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_OPTIONS = ["pending", "in_progress", "done"];
const STATUS_COLORS = { pending: "#f59e0b", in_progress: "#3b82f6", done: "#22c55e" };

export default function WorklistForm({
  open,
  entryId,
  worklist,
  contacts,
  devices,
  actions,
  presetContactId,
  presetDeviceId,
  onClose,
  onDelete,
  onPrint,
}) {
  const toast = useToast();
  const { t } = useLocale();
  const createEntry = useMutation(api.worklist.create);
  const updateEntry = useMutation(api.worklist.update);

  const editing = entryId ? (worklist ?? []).find((e) => e._id === entryId) ?? null : null;

  const [contactId, setContactId] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactHighlight, setContactHighlight] = useState(0);
  const [deviceId, setDeviceId] = useState("");
  const [actionId, setActionId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);

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

  const contactOptions = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return sortedContacts;
    return sortedContacts.filter((c) =>
      contactFullName(c).toLowerCase().includes(q),
    );
  }, [sortedContacts, contactSearch]);

  const contactDevices = useMemo(
    () => (contactId ? devices.filter((d) => d.contactId === contactId) : []),
    [devices, contactId],
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const ownerContact = contacts.find((c) => c._id === editing.contactId);
      setContactId(editing.contactId);
      setContactSearch(ownerContact ? contactFullName(ownerContact) : "");
      setDeviceId(editing.deviceId);
      setActionId(editing.actionId);
      setDate(editing.date);
      setNotes(editing.notes || "");
      setStatus(editing.status ?? "pending");
    } else {
      const presetContact = presetContactId
        ? contacts.find((c) => c._id === presetContactId)
        : null;
      setContactId(presetContact?._id || "");
      setContactSearch(presetContact ? contactFullName(presetContact) : "");
      setDeviceId(presetDeviceId || "");
      setActionId(actions[0]?._id || "");
      setDate(todayISO());
      setNotes("");
      setStatus("pending");
    }
    setContactOpen(false);
    setContactHighlight(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entryId, presetContactId, presetDeviceId]);

  // reset device when contact changes
  useEffect(() => {
    if (!contactId) { setDeviceId(""); return; }
    const stillValid = contactDevices.some((d) => d._id === deviceId);
    if (!stillValid) setDeviceId(contactDevices[0]?._id || "");
  }, [contactId, contactDevices, deviceId]);

  const selectContact = (c) => {
    setContactId(c._id);
    setContactSearch(contactFullName(c));
    setContactOpen(false);
    setContactHighlight(0);
  };

  const handleContactKeyDown = (e) => {
    if (!contactOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setContactOpen(true);
        setContactHighlight(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setContactHighlight((h) => Math.min(h + 1, contactOptions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setContactHighlight((h) => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (contactOptions[contactHighlight]) selectContact(contactOptions[contactHighlight]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setContactOpen(false);
      const prev = contacts.find((c) => c._id === contactId);
      setContactSearch(prev ? contactFullName(prev) : "");
    }
  };

  const handleContactBlur = () => {
    setTimeout(() => {
      setContactOpen(false);
      if (contactId) {
        const sel = contacts.find((c) => c._id === contactId);
        setContactSearch(sel ? contactFullName(sel) : "");
      } else if (contactSearch.trim()) {
        const match = sortedContacts.find(
          (c) => contactFullName(c).toLowerCase() === contactSearch.trim().toLowerCase(),
        );
        if (match) {
          setContactId(match._id);
          setContactSearch(contactFullName(match));
        } else {
          setContactSearch("");
        }
      }
    }, 150);
  };

  const statusLabel = (s) => {
    if (s === "in_progress") return t("statusInProgress");
    if (s === "done") return t("statusDone");
    return t("statusPending");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!contactId) { toast.show(t("toastOwnerRequired")); return; }
    if (!deviceId) { toast.show(t("toastDeviceRequired")); return; }
    if (!actionId) { toast.show(t("toastActionTypeRequired")); return; }
    setSubmitting(true);
    try {
      if (entryId) {
        await updateEntry({ id: entryId, contactId, deviceId, actionId, date, notes: notes || undefined, status });
        toast.show(t("toastWorklistUpdated"));
      } else {
        await createEntry({ contactId, deviceId, actionId, date, notes: notes || undefined, status });
        toast.show(t("toastWorklistAdded"));
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.show(t("toastCouldNotSaveWorklist"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form className="dialog__form" onSubmit={handleSubmit}>
        <header className="dialog__head">
          <h2 className="dialog__title">
            {entryId ? t("worklistFormEdit") : t("worklistFormNew")}
          </h2>
          <div className="dialog__head-actions">
            {entryId && onPrint && (
              <button
                type="button"
                className="dialog__action-btn"
                onClick={onPrint}
                title={t("reportPrint")}
                aria-label={t("reportPrint")}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="6" y="14" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
            <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>
        <div className="dialog__body">
          {/* Status */}
          <div className="field">
            <span className="field__label">{t("worklistFieldStatus")}</span>
            <div className="status-selector">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-selector__btn${status === s ? " is-active" : ""}`}
                  style={{ "--sc": STATUS_COLORS[s] }}
                  onClick={() => setStatus(s)}
                >
                  <span className="status-selector__dot" />
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <label className="field">
            <span className="field__label">{t("worklistFieldContact")}</span>
            <div className="combobox">
              <input
                className="field__input"
                type="text"
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setContactId("");
                  setContactOpen(true);
                  setContactHighlight(0);
                }}
                onFocus={() => { setContactOpen(true); setContactHighlight(0); }}
                onBlur={handleContactBlur}
                onKeyDown={handleContactKeyDown}
                placeholder={t("fieldOwnerSearch")}
                autoComplete="off"
                autoFocus
              />
              {contactOpen && contactOptions.length > 0 && (
                <ul className="combobox__list" role="listbox">
                  {contactOptions.map((c, i) => (
                    <li
                      key={c._id}
                      role="option"
                      aria-selected={c._id === contactId}
                      className={`combobox__option${i === contactHighlight ? " is-highlight" : ""}${c._id === contactId ? " is-selected" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); selectContact(c); }}
                    >
                      {contactFullName(c) || t("contactUnnamed")}
                    </li>
                  ))}
                </ul>
              )}
              {contactOpen && contactOptions.length === 0 && (
                <div className="combobox__empty">{t("emptyNoMatchesTitle")}</div>
              )}
            </div>
          </label>

          {/* Device */}
          <label className="field">
            <span className="field__label">{t("worklistFieldDevice")}</span>
            {!contactId ? (
              <p className="field__hint">{t("worklistSelectContactFirst")}</p>
            ) : contactDevices.length === 0 ? (
              <p className="field__hint">{t("worklistNoDevices")}</p>
            ) : (
              <select
                className="field__input"
                required
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              >
                <option value="" disabled>{t("worklistPickDevice")}</option>
                {contactDevices.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}
          </label>

          {/* Action from catalog */}
          <label className="field">
            <span className="field__label">{t("worklistFieldActionType")}</span>
            {actions.length === 0 ? (
              <p className="field__hint">{t("worklistNoActions")}</p>
            ) : (
              <select
                className="field__input"
                required
                value={actionId}
                onChange={(e) => setActionId(e.target.value)}
              >
                <option value="" disabled>{t("worklistPickAction")}</option>
                {actions.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            )}
          </label>

          {/* Date */}
          <label className="field">
            <span className="field__label">{t("worklistFieldDate")}</span>
            <input
              className="field__input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {/* Notes */}
          <label className="field">
            <span className="field__label">{t("fieldNotes")}</span>
            <textarea
              className="field__input field__input--area"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("fieldNotesPlaceholder")}
            />
          </label>
        </div>
        <footer className="dialog__foot">
          {entryId ? (
            <button type="button" className="btn btn--text btn--danger" onClick={onDelete}>
              {t("btnDelete")}
            </button>
          ) : (
            <span />
          )}
          <div className="dialog__foot-end">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t("btnCancel")}
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || actions.length === 0}
            >
              {submitting ? t("btnSaving") : t("btnSave")}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
