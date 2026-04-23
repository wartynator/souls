import Dialog from "./Dialog.jsx";

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
}) {
  const contact = contactId ? contacts.find((c) => c._id === contactId) : null;
  const linkedDevices = contact
    ? [...devices.filter((d) => d.contactId === contact._id)].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
      )
    : [];

  if (!contact) {
    // Contact has been deleted while detail was open — auto-close
    if (open) onClose();
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="dialog__form">
        <header className="dialog__head">
          <h2 className="dialog__title">{contact.name}</h2>
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
          <dl className="detail">
            {contact.phone && (
              <div className="detail__row">
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                </dd>
              </div>
            )}
            {contact.email && (
              <div className="detail__row">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
            )}
            {contact.notes && (
              <div className="detail__row">
                <dt>Notes</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{contact.notes}</dd>
              </div>
            )}
          </dl>

          <div className="devices-section">
            <div className="devices-section__head">
              <h3 className="devices-section__title">Devices</h3>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => onAddDevice(contact._id)}
              >
                + Add device
              </button>
            </div>
            {linkedDevices.length === 0 ? (
              <p className="devices-section__empty">No devices linked to this contact.</p>
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
        <footer className="dialog__foot">
          <button type="button" className="btn btn--text btn--danger" onClick={onDelete}>
            Delete contact
          </button>
          <div className="dialog__foot-end">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn--primary" onClick={onEdit}>
              Edit
            </button>
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
