import { useMemo } from "react";
import { useLocale } from "../i18n.jsx";

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function formatPrice(price, t) {
  if (price == null) return null;
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ActionList({ actions, query, onOpen }) {
  const { t } = useLocale();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = actions;
    if (q) {
      list = list.filter((a) => {
        const hay = [a.name, a.notes, a.deviceName].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [actions, query]);

  if (actions.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{t("emptyNoActionsTitle")}</p>
        <p className="empty__text">{t("emptyNoActionsText")}</p>
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{t("emptyNoMatchesTitle")}</p>
        <p className="empty__text">{t("emptyNoMatchesText", { query })}</p>
      </div>
    );
  }

  return (
    <div className="list">
      {filtered.map((a) => (
        <div key={a._id} className="row" onClick={() => onOpen(a._id)}>
          <div className="row__avatar row__avatar--action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="row__main">
            <p className="row__name">{a.name}</p>
            <p className="row__owner">
              {a.deviceName
                ? <em>{a.deviceName}</em>
                : <em style={{ color: "var(--ink-faint)" }}>{t("deviceOwnerRemoved")}</em>
              }
              {a.notes && ` · ${a.notes}`}
            </p>
          </div>
          <div className="row__action-meta">
            {a.price != null && (
              <p className="row__price">{formatPrice(a.price, t)}</p>
            )}
            <p className="row__date">{formatDate(a.date)}</p>
          </div>
          <svg className="row__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}
