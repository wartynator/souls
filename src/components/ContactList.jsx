import { useMemo } from "react";

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstLetter(name = "") {
  const c = (name.trim()[0] || "#").toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function ContactList({ contacts, query, onOpen }) {
  const { grouped, filteredCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = contacts;
    if (q) {
      list = list.filter((c) => {
        const hay = [c.name, c.phone, c.email, c.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    list = [...list].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
    );

    const groups = [];
    let lastLetter = null;
    list.forEach((c) => {
      const letter = firstLetter(c.name);
      if (letter !== lastLetter) {
        groups.push({ type: "letter", letter });
        lastLetter = letter;
      }
      groups.push({ type: "row", contact: c });
    });
    return { grouped: groups, filteredCount: list.length };
  }, [contacts, query]);

  // Empty states
  if (contacts.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">No contacts yet</p>
        <p className="empty__text">
          Tap <em>Add contact</em> to create your first entry.
        </p>
      </div>
    );
  }
  if (filteredCount === 0) {
    return (
      <div className="empty" style={{ padding: "60px 20px" }}>
        <p className="empty__title">No matches</p>
        <p className="empty__text">Nothing found for &ldquo;{query}&rdquo;.</p>
      </div>
    );
  }

  return (
    <div className="list">
      {grouped.map((item, i) =>
        item.type === "letter" ? (
          <div key={`l-${item.letter}-${i}`} className="list__letter">
            {item.letter}
          </div>
        ) : (
          <div
            key={item.contact._id}
            className="row"
            onClick={() => onOpen(item.contact._id)}
          >
            <div className="row__avatar">{initials(item.contact.name)}</div>
            <div className="row__main">
              <p className="row__name">{item.contact.name || "Unnamed"}</p>
              {(item.contact.phone || item.contact.email) && (
                <p className="row__sub">
                  {item.contact.phone || item.contact.email}
                </p>
              )}
            </div>
            <div className="row__meta">
              {item.contact.deviceCount ?? 0}{" "}
              {(item.contact.deviceCount ?? 0) === 1 ? "device" : "devices"}
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
        ),
      )}
    </div>
  );
}
