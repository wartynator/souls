import { createPortal } from "react-dom";
import { useLocale } from "../i18n.jsx";

function Row({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="report__row">
      <dt className="report__label">{label}</dt>
      <dd className="report__value">{value}</dd>
    </div>
  );
}

export default function WorklistReport({ open, entry, contact, device, action, onClose }) {
  const { locale, t } = useLocale();

  if (!open || !entry || !contact || !device || !action) return null;

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(
      locale === "sk" ? "sk-SK" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" },
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  return createPortal(
    <div className="report-overlay">
      {/* Toolbar — hidden when printing */}
      <div className="report-toolbar no-print">
        <button className="btn btn--ghost btn--small" onClick={onClose}>
          {t("btnClose")}
        </button>
        <button className="btn btn--primary btn--small" onClick={() => window.print()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="6" y="14" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {t("reportPrint")}
        </button>
      </div>

      {/* Report page */}
      <article className="report">
        <header className="report__header">
          <div>
            <h1 className="report__title">{t("reportTitle")}</h1>
            <p className="report__generated">{formatDate(entry.date)}</p>
          </div>
          <span className="report__ref">#{entry._id.slice(-6).toUpperCase()}</span>
        </header>

        {/* 01 — Customer */}
        <section className="report__section">
          <div className="report__section-head">
            <span className="report__num">01</span>
            <span className="report__section-title">{t("reportSection1")}</span>
          </div>
          <dl className="report__body">
            <Row label={t("fieldName")} value={[contact.name, contact.surname].filter(Boolean).join(" ")} />
            <Row label={t("fieldAddress")} value={contact.address} />
            <Row label={t("fieldCity")} value={contact.city} />
            <Row label={t("fieldPhone")} value={contact.phone} />
            <Row label={t("fieldEmail")} value={contact.email} />
            <Row label={t("fieldNotes")} value={contact.notes} />
          </dl>
        </section>

        {/* 02 — Device */}
        <section className="report__section">
          <div className="report__section-head">
            <span className="report__num">02</span>
            <span className="report__section-title">{t("reportSection2")}</span>
          </div>
          <dl className="report__body">
            <Row label={t("fieldDeviceName")} value={device.name} />
            <Row label={t("fieldManufacturer")} value={device.manufacturer} />
            <Row label={t("fieldDeviceType")} value={device.type} />
            <Row label={t("fieldYear")} value={device.year} />
            <Row label={t("fieldSerialNumber")} value={device.serialNumber || device.barcode} />
            <Row label={t("fieldNotes")} value={device.notes} />
          </dl>
        </section>

        {/* 03 — Service */}
        <section className="report__section">
          <div className="report__section-head">
            <span className="report__num">03</span>
            <span className="report__section-title">{t("reportSection3")}</span>
          </div>
          <dl className="report__body">
            <Row label={t("worklistFieldActionType")} value={action.name} />
            <Row label={t("fieldActionPrice")} value={action.price != null ? formatPrice(action.price) : null} />
            <Row label={t("fieldNotes")} value={action.notes} />
          </dl>
        </section>

        {/* 04 — Date & Notes */}
        <section className="report__section">
          <div className="report__section-head">
            <span className="report__num">04</span>
            <span className="report__section-title">{t("reportSection4")}</span>
          </div>
          <dl className="report__body">
            <Row label={t("worklistFieldDate")} value={formatDate(entry.date)} />
            <Row label={t("fieldNotes")} value={entry.notes} />
          </dl>
        </section>
      </article>
    </div>,
    document.body,
  );
}
