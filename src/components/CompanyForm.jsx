import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLocale } from "../i18n.jsx";

export default function CompanyForm({ open, company, onClose }) {
  const { t } = useLocale();
  const upsert = useMutation(api.companies.upsert);

  const [name, setName]       = useState("");
  const [street, setStreet]   = useState("");
  const [city, setCity]       = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [vatId, setVatId]     = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (open) {
      setName(company?.name    ?? "");
      setStreet(company?.street  ?? "");
      setCity(company?.city    ?? "");
      setCountry(company?.country ?? "");
      setPhone(company?.phone   ?? "");
      setEmail(company?.email   ?? "");
      setVatId(company?.vatId   ?? "");
    }
  }, [open, company]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await upsert({
        name: name.trim(),
        street:  street.trim()  || undefined,
        city:    city.trim()    || undefined,
        country: country.trim() || undefined,
        phone:   phone.trim()   || undefined,
        email:   email.trim()   || undefined,
        vatId:   vatId.trim()   || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__head">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
          <span className="dialog__title">{t("companyTitle")}</span>
          <button className="dialog__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="dialog__body" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label">{t("companyName")} *</label>
            <input
              className="field__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("companyNamePlaceholder")}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field__label">{t("fieldAddress")}</label>
            <input
              className="field__input"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder={t("companyStreetPlaceholder")}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label">{t("fieldCity")}</label>
              <input
                className="field__input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("companyCityPlaceholder")}
              />
            </div>
            <div className="field">
              <label className="field__label">{t("companyCountry")}</label>
              <input
                className="field__input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("companyCountryPlaceholder")}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label">{t("fieldPhone")}</label>
              <input
                className="field__input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("companyPhonePlaceholder")}
              />
            </div>
            <div className="field">
              <label className="field__label">{t("fieldEmail")}</label>
              <input
                className="field__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("companyEmailPlaceholder")}
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label">{t("companyVatId")}</label>
            <input
              className="field__input"
              value={vatId}
              onChange={(e) => setVatId(e.target.value)}
              placeholder={t("companyVatIdPlaceholder")}
            />
          </div>

          <div className="dialog__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t("btnCancel")}
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving || !name.trim()}>
              {saving ? t("btnSaving") : t("btnSave")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
