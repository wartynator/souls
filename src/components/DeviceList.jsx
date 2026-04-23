import { useMemo } from "react";

export default function DeviceList({ devices, query, onOpen }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = devices;
    if (q) {
      list = list.filter((d) => {
        const hay = [d.name, d.notes, d.ownerName].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
    );
  }, [devices, query]);

  if (devices.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">No devices yet</p>
        <p className="empty__text">
          Devices must be assigned to a contact. Add a contact first, then add their
          devices.
        </p>
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="empty" style={{ padding: "60px 20px" }}>
        <p className="empty__title">No matches</p>
        <p className="empty__text">Nothing found for &ldquo;{query}&rdquo;.</p>
      </div>
    );
  }

  return (
    <div className="list">
      {filtered.map((d) => (
        <div key={d._id} className="row" onClick={() => onOpen(d._id)}>
          <div className="row__avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="5" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 17v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="row__main">
            <p className="row__name">{d.name || "Unnamed device"}</p>
            <p className="row__owner">
              {d.ownerName ? (
                <em>{d.ownerName}</em>
              ) : (
                <em style={{ color: "var(--ink-faint)" }}>Owner removed</em>
              )}
              {d.notes && ` · ${d.notes}`}
            </p>
          </div>
          <svg
            className="row__chev"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m9 6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
