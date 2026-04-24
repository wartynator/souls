import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

export default function ContactForm({ open, contactId, contacts, onClose, onDelete }) {
  const toast = useToast();
  const { t } = useLocale();
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);

  const editing = contactId
    ? contacts.find((c) => c._id === contactId) ?? null
    : null;

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || "");
      setSurname(editing.surname || "");
      setAddress(editing.address || "");
      setCity(editing.city || "");
      setPhone(editing.phone || "");
      setEmail(editing.email || "");
      setNotes(editing.notes || "");
    } else {
      setName("");
      setSurname("");
      setAddress("");
      setCity("");
      setPhone("");
      setEmail("");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) {
      toast.show(t("toastNameRequired"));
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateContact({
          id: editing._id,
          name,
          surname: surname || undefined,
          address: address || undefined,
          city: city || undefined,
          phone: phone || undefined,
          email: email || undefined,
          notes: notes || undefined,
        });
        toast.show(t("toastContactUpdated"));
      } else {
        await createContact({
          name,
          surname: surname || undefined,
          address: address || undefined,
          city: city || undefined,
          phone: phone || undefined,
          email: email || undefined,
          notes: notes || undefined,
        });
        toast.show(t("toastContactAdded"));
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.show(t("toastCouldNotSaveContact"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form className="dialog__form" onSubmit={handleSubmit}>
        <header className="dialog__head">
          <h2 className="dialog__title">{editing ? t("contactFormEdit") : t("contactFormNew")}</h2>
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
          <div className="field-row">
            <label className="field">
              <span className="field__label">{t("fieldName")}</span>
              <input
                className="field__input"
                type="text"
                autoComplete="given-name"
                maxLength={100}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>
            <label className="field">
              <span className="field__label">{t("fieldSurname")}</span>
              <input
                className="field__input"
                type="text"
                autoComplete="family-name"
                maxLength={100}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span className="field__label">{t("fieldAddress")}</span>
            <input
              className="field__input"
              type="text"
              autoComplete="street-address"
              maxLength={200}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">{t("fieldCity")}</span>
            <input
              className="field__input"
              type="text"
              autoComplete="address-level2"
              maxLength={100}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">{t("fieldPhone")}</span>
            <input
              className="field__input"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">{t("fieldEmail")}</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">{t("fieldNotes")}</span>
            <textarea
              className="field__input field__input--area"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
