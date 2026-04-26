import { useMemo } from "react";
import { useLocale } from "../i18n.jsx";
import { avatarColorClass } from "../avatarColor.js";

function initials(contact) {
  const first = (contact.name || "").trim()[0] || "";
  const last = (contact.surname || "").trim()[0] || "";
  if (first && last) return (first + last).toUpperCase();
  if (first) return first.toUpperCase();
  return "?";
}

function sortKey(contact) {
  return ((contact.surname || contact.name || "").trim()).toLowerCase();
}

function firstLetter(contact) {
  const c = ((contact.surname || contact.name || "").trim()[0] || "#").toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function ContactList({ contacts, query, onOpen }) {
  const { t, deviceCountLabel } = useLocale();
  const { grouped, filteredCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = contacts;
    if (q) {
      list = list.filter((c) => {
        const hay = [c.name, c.surname, c.phone, c.email, c.address, c.city, c.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    list = [...list].sort((a, b) =>
      sortKey(a).localeCompare(sortKey(b), undefined, { sensitivity: "base" }),
    );

    const groups = [];
    let lastLetter = null;
    list.forEach((c) => {
      const letter = firstLetter(c);
      if (letter !== lastLetter) {
        groups.push({ type: "letter", letter });
        lastLetter = letter;
      }
      groups.push({ type: "row", contact: c });
    });
    return { grouped: groups, filteredCount: list.length };
  }, [contacts, query]);

  if (contacts.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{t("emptyNoContactsTitle")}</p>
        <p className="empty__text">
          {t("emptyNoContactsText", { addContact: t("addContact") })}
        </p>
      </div>
    );
  }
  if (filteredCount === 0) {
    return (
      <div className="empty" style={{ padding: "60px 20px" }}>
        <p className="empty__title">{t("emptyNoMatchesTitle")}</p>
        <p className="empty__text">{t("emptyNoMatchesText", { query })}</p>
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
            <div className={`row__avatar ${avatarColorClass(item.contact.name + (item.contact.surname || ""))}`}>{initials(item.contact)}</div>
            <div className="row__main">
              <p className="row__name">
                {[item.contact.name, item.contact.surname].filter(Boolean).join(" ") ||
                  t("contactUnnamed")}
              </p>
              {(item.contact.phone || item.contact.email) && (
                <p className="row__sub">
                  {item.contact.phone || item.contact.email}
                </p>
              )}
            </div>
            <div className="row__meta">
              {deviceCountLabel(item.contact.deviceCount ?? 0)}
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
