import { useMemo } from "react";
import { useLocale } from "../i18n.jsx";

export default function WorklistList({ worklist, query, onOpen }) {
  const { t } = useLocale();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = worklist;
    if (q) {
      list = list.filter((e) => {
        const hay = [e.contactName, e.deviceName, e.actionName, e.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [worklist, query]);

  if (worklist.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{t("emptyNoWorklistTitle")}</p>
        <p className="empty__text">{t("emptyNoWorklistText", { addEntry: t("addWorklist") })}</p>
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="empty" style={{ padding: "60px 20px" }}>
        <p className="empty__title">{t("emptyNoMatchesTitle")}</p>
        <p className="empty__text">{t("emptyNoMatchesText", { query })}</p>
      </div>
    );
  }

  return (
    <div className="list">
      {filtered.map((e) => (
        <div key={e._id} className="row" onClick={() => onOpen(e._id)}>
          <div className="row__avatar row__avatar--action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="row__main">
            <p className="row__name">{e.actionName}</p>
            <p className="row__sub">
              {e.contactName || t("contactUnnamed")}
              {e.deviceName && ` · ${e.deviceName}`}
            </p>
          </div>
          <div className="row__action-meta">
            <p className="row__date">{e.date.split("-").reverse().join(".")}</p>
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
