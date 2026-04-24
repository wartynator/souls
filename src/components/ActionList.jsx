import { useMemo } from "react";
import { useLocale } from "../i18n.jsx";

export default function ActionList({ actions, query, onOpen }) {
  const { t } = useLocale();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = actions;
    if (q) {
      list = list.filter((a) => {
        const hay = [a.name, a.notes].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }),
    );
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
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="row__main">
            <p className="row__name">{a.name}</p>
            {a.notes && <p className="row__owner">{a.notes}</p>}
          </div>
          {a.price != null && (
            <p className="row__price">
              {a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <svg className="row__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}
