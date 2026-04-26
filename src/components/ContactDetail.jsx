import "./ContactDetail.css";
import Dialog from "./Dialog.jsx";
import { useLocale } from "../i18n.jsx";

export default function ContactDetail({
  open,
  contactId,
  contacts,
  devices,
  onClose,
  onEdit,
  onDelete,
  onAddDevice,
  onOpenDevice,
  onAddWorklist,
}) {
  const { t } = useLocale();
  const contact = contactId ? contacts.find((c) => c._id === contactId) : null;
  const linkedDevices = contact
    ? [...devices.filter((d) => d.contactId === contact._id)].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
      )
    : [];

  if (!contact) {
    if (open) onClose();
    return null;
  }

  const fullName = [contact.name, contact.surname].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="dialog__form contact-detail-sheet">
        <header className="dialog__head contact-detail-sheet__head">
          <div className="contact-detail-sheet__title-wrap">
            <p className="contact-detail-sheet__eyebrow">Contact</p>
            <h2 className="dialog__title">{fullName || t("contactUnnamed")}</h2>
          </div>
          <div className="dialog__head-actions contact-detail-sheet__head-actions">
            <button
              type="button"
              className="contact-action contact-action--edit"
              onClick={onEdit}
              aria-label={t("btnEdit")}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m13.5 6 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>{t("btnEdit")}</span>
            </button>
            <button
              type="button"
              className="dialog__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>
        <div className="dialog__body contact-detail-sheet__body">
          <dl className="detail contact-detail-sheet__detail-card">
            {contact.phone && (
              <div className="detail__row">
                <dt>{t("detailPhone")}</dt>
                <dd>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                </dd>
              </div>
            )}
            {contact.email && (
              <div className="detail__row">
                <dt>{t("detailEmail")}</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
            )}
            {contact.address && (
              <div className="detail__row">
                <dt>{t("detailAddress")}</dt>
                <dd>{contact.address}</dd>
              </div>
            )}
            {contact.city && (
              <div className="detail__row">
                <dt>{t("detailCity")}</dt>
                <dd>{contact.city}</dd>
              </div>
            )}
            {contact.notes && (
              <div className="detail__row">
                <dt>{t("detailNotes")}</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{contact.notes}</dd>
              </div>
            )}
          </dl>

          <div className="devices-section contact-detail-sheet__devices">
            <div className="devices-section__head">
              <h3 className="devices-section__title">{t("detailDevices")}</h3>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => onAddDevice(contact._id)}
              >
                {t("detailAddDevice")}
              </button>
            </div>
            {linkedDevices.length === 0 ? (
              <p className="devices-section__empty">{t("detailNoDevices")}</p>
            ) : (
              <div className="devices-section__list">
                {linkedDevices.map((d) => (
                  <div
                    key={d._id}
                    className="device-item"
                    onClick={() => onOpenDevice(d._id)}
                  >
                    <div className="device-item__icon">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect
                          x="4"
                          y="5"
                          width="16"
                          height="12"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 20h6M12 17v3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="device-item__body">
                      <p className="device-item__name">{d.name}</p>
                      {d.notes && <p className="device-item__notes">{d.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <footer className="dialog__foot contact-detail-sheet__foot">
          <div className="contact-detail-sheet__actions" aria-label="Contact actions">
            {onAddWorklist && (
              <button type="button" className="contact-action" onClick={() => onAddWorklist(contact._id)}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 6h11M8 12h11M8 18h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>{t("detailLogWork")}</span>
              </button>
            )}
            <button type="button" className="contact-action" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <span>{t("btnClose")}</span>
            </button>
            <button type="button" className="contact-action contact-action--danger" onClick={onDelete}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("detailDeleteContact")}</span>
            </button>
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
