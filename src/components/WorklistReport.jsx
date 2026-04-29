import { createPortal } from "react-dom";
import { useLocale } from "../i18n.jsx";

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

  const contactName = [contact.name, contact.surname].filter(Boolean).join(" ");
  const ref = `#${entry._id.slice(-6).toUpperCase()}`;

  return createPortal(
    <div className="report-overlay">
      {/* Toolbar — hidden when printing */}
      <div className="report-toolbar no-print">
        <button className="report-toolbar__close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          {t("btnClose")}
        </button>
        <span className="report-toolbar__label">
          {t("reportTitle")} — {contactName}
        </span>
        <button className="report-toolbar__export" onClick={() => window.print()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9V2h12v7"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8" rx="1"/>
          </svg>
          {t("reportPrint")}
        </button>
      </div>

      {/* Document */}
      <div className="report-doc-wrap">
        <article className="report">

          {/* Header: ref left · title center · logo right */}
          <header className="report__header">
            <span className="report__ref">{ref}</span>
            <div className="report__header-center">
              <h1 className="report__title">{t("reportTitle")}</h1>
              <p className="report__date">{formatDate(entry.date)}</p>
            </div>
            <img className="report__logo" src="/termos-logo.png" alt="Termos" />
          </header>

          {/* Customer + Device — two-column grid */}
          <div className="report__cols">
            <div className="report__col">
              <p className="report__col-title">{t("reportSection1")}</p>
              {contactName && <ReportRow label={t("fieldName")} value={contactName} />}
              {contact.phone && <ReportRow label={t("fieldPhone")} value={contact.phone} />}
              {contact.email && <ReportRow label={t("fieldEmail")} value={contact.email} />}
              {contact.address && <ReportRow label={t("fieldAddress")} value={contact.address} />}
              {contact.city && <ReportRow label={t("fieldCity")} value={contact.city} />}
            </div>
            <div className="report__col">
              <p className="report__col-title">{t("reportSection2")}</p>
              {device.name && <ReportRow label={t("fieldDeviceName")} value={device.name} />}
              {device.manufacturer && <ReportRow label={t("fieldManufacturer")} value={device.manufacturer} />}
              {device.type && <ReportRow label={t("fieldDeviceType")} value={device.type} />}
              {device.year && <ReportRow label={t("fieldYear")} value={device.year} />}
              {(device.serialNumber || device.barcode) && (
                <ReportRow label={t("fieldSerialNumber")} value={device.serialNumber || device.barcode} />
              )}
            </div>
          </div>

          {/* Service */}
          <section className="report__section">
            <div className="report__section-head">
              <span className="report__num">03</span>
              <span className="report__section-title">{t("reportSection3")}</span>
            </div>
            <div className="report__section-body">
              {action.name && <p className="report__action-name">{action.name}</p>}
              {action.notes && <p className="report__notes">{action.notes}</p>}
              {entry.notes && <p className="report__notes">{entry.notes}</p>}
              {action.price != null && (
                <div className="report__price-row">
                  <span className="report__price-label">{locale === "sk" ? "Celkom" : "Total"}</span>
                  <span className="report__price-value">{formatPrice(action.price)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Signature */}
          <footer className="report__signature">
            <div className="report__sig-grid">
              <div className="report__sig-item">
                <span className="report__sig-label">{t("reportSignatureTech")}</span>
                <div className="report__sig-line" />
              </div>
              <div className="report__sig-row">
                <div className="report__sig-item">
                  <span className="report__sig-label">{t("reportSignatureCustomer")}</span>
                  <div className="report__sig-line" />
                </div>
                <div className="report__sig-item">
                  <span className="report__sig-label">{t("reportSignatureDate")}</span>
                  <div className="report__sig-line" />
                </div>
              </div>
            </div>
          </footer>

        </article>
      </div>
    </div>,
    document.body,
  );
}

function ReportRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="report__row">
      <span className="report__row-label">{label}</span>
      <span className="report__row-value">{value}</span>
    </div>
  );
}
