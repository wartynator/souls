import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLocale } from "../i18n.jsx";

const COMPANY_FALLBACK = {
  name: "TERMOS",
  street: "M.R.Štefanika 2",
  city: "07501 TREBIŠOV",
  country: "SLOVENSKO",
};

export default function WorklistReport({ open, entry, contact, device, action, company, onClose }) {
  const co = company ?? COMPANY_FALLBACK;
  const { locale, t } = useLocale();
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

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
  const ref = entry._id.slice(-6).toUpperCase();

  const handleDownload = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH);
        y += pageH;
      }

      const filename = `report-${contactName.replace(/\s+/g, "-") || "service"}-${ref}.pdf`;
      pdf.save(filename);
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="report-overlay">
      {/* Toolbar */}
      <div className="report-toolbar">
        <button className="report-toolbar__close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          {t("btnClose")}
        </button>
        <span className="report-toolbar__label">
          {t("reportTitle")} — {contactName}
        </span>
        <button className="report-toolbar__export" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            t("btnSaving")
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 18v-6"/>
                <path d="m9 15 3 3 3-3"/>
              </svg>
              {t("reportPrint")}
            </>
          )}
        </button>
      </div>

      {/* Document */}
      <div className="report-doc-wrap">
        <article className="report" ref={reportRef}>

          {/* Header: logo left — company info right */}
          <header className="report__header">
            <img className="report__logo" src="/termos_logo.jpeg" alt="Termos" />
            <div className="report__company">
              <p className="report__company-name">{co.name}</p>
              {co.street && <p>{co.street}{co.city ? `, ${co.city}` : ""}{co.country ? `, ${co.country}` : ""}</p>}
              {!co.street && co.city && <p>{co.city}{co.country ? `, ${co.country}` : ""}</p>}
              {!co.street && !co.city && co.country && <p>{co.country}</p>}
              {(co.phone || co.email) && <p>{[co.phone, co.email].filter(Boolean).join(" · ")}</p>}
              {co.vatId && <p>{co.vatId}</p>}
            </div>
          </header>

          {/* Page title */}
          <h1 className="report__title">{t("reportTitle")}</h1>

          {/* Section 1 — Customer */}
          <ReportSection label={t("reportSection1")}>
            <div className="report__fields">
              <Field label={t("fieldName")} value={contactName} wide />
              {contact.address && <Field label={t("fieldAddress")} value={contact.address} />}
              {contact.city    && <Field label={t("fieldCity")}    value={contact.city}    />}
              {contact.phone   && <Field label={t("fieldPhone")}   value={contact.phone}   />}
              {contact.email   && <Field label={t("fieldEmail")}   value={contact.email}   />}
            </div>
          </ReportSection>

          {/* Section 2 — Device */}
          <ReportSection label={t("reportSection2")}>
            <div className="report__fields">
              {device.name         && <Field label={t("fieldDeviceName")}   value={device.name}         />}
              {device.manufacturer && <Field label={t("fieldManufacturer")} value={device.manufacturer} />}
              {device.type         && <Field label={t("fieldDeviceType")}   value={device.type}         />}
              {device.year         && <Field label={t("fieldYear")}         value={device.year}         />}
              {(device.serialNumber || device.barcode) && (
                <Field label={t("fieldSerialNumber")} value={device.serialNumber || device.barcode} />
              )}
            </div>
          </ReportSection>

          {/* Section 3 — Service */}
          <ReportSection label={t("reportSection3")}>
            <div className="report__fields">
              {action.name  && <Field label={locale === "sk" ? "Úkon" : "Service"}     value={action.name}  wide />}
              {action.notes && <Field label={locale === "sk" ? "Popis" : "Description"} value={action.notes} wide />}
              {entry.notes  && <Field label={locale === "sk" ? "Poznámky" : "Notes"}   value={entry.notes}  wide />}
              {action.price != null && (
                <Field
                  label={locale === "sk" ? "Celkom" : "Total"}
                  value={formatPrice(action.price)}
                />
              )}
            </div>
          </ReportSection>

          {/* Signature footer */}
          <footer className="report__signature">
            <div className="report__sig-cols">
              <div className="report__sig-col">
                <p className="report__sig-pre">{formatDate(entry.date)}</p>
                <div className="report__sig-line" />
                <p className="report__sig-label">{t("reportSignatureDate")}</p>
              </div>
              <div className="report__sig-col">
                <p className="report__sig-pre">&nbsp;</p>
                <div className="report__sig-line" />
                <p className="report__sig-label">{t("reportSignatureTech")}</p>
              </div>
              <div className="report__sig-col">
                <p className="report__sig-pre">&nbsp;</p>
                <div className="report__sig-line" />
                <p className="report__sig-label">{t("reportSignatureCustomer")}</p>
              </div>
            </div>
          </footer>

          {/* Reference */}
          <p className="report__ref">{ref}</p>

        </article>
      </div>
    </div>,
    document.body,
  );
}

function ReportSection({ label, children }) {
  return (
    <section className="report__section">
      <p className="report__section-label">{label}</p>
      <div className="report__rule" />
      {children}
    </section>
  );
}

function Field({ label, value, wide }) {
  if (value == null || value === "") return null;
  return (
    <div className={`report__field${wide ? " report__field--wide" : ""}`}>
      <span className="report__field-label">{label}</span>
      <span className="report__field-value">{value}</span>
    </div>
  );
}
