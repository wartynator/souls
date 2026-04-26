import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLocale } from "../i18n.jsx";

const STATUSES = ["pending", "in_progress", "done"];
const CYCLE = { pending: "in_progress", in_progress: "done", done: "pending" };

export default function WorklistList({ worklist, query, onOpen }) {
  const { t } = useLocale();
  const setStatus = useMutation(api.worklist.setStatus);
  const [filter, setFilter] = useState("all");

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
    if (filter !== "all") {
      list = list.filter((e) => (e.status ?? "pending") === filter);
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [worklist, query, filter]);

  const handleStatusClick = (e, entry) => {
    e.stopPropagation();
    const next = CYCLE[entry.status ?? "pending"];
    setStatus({ id: entry._id, status: next });
  };

  const statusLabel = (s) => {
    if (s === "in_progress") return t("statusInProgress");
    if (s === "done") return t("statusDone");
    return t("statusPending");
  };

  const filters = [
    { key: "all", label: t("filterAll") },
    { key: "pending", label: t("statusPending") },
    { key: "in_progress", label: t("statusInProgress") },
    { key: "done", label: t("statusDone") },
  ];

  if (worklist.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{t("emptyNoWorklistTitle")}</p>
        <p className="empty__text">{t("emptyNoWorklistText", { addEntry: t("addWorklist") })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="filter-pills">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-pill${filter === f.key ? " is-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty" style={{ padding: "60px 20px" }}>
          <p className="empty__title">{t("emptyNoMatchesTitle")}</p>
          <p className="empty__text">{t("emptyNoMatchesText", { query: filter !== "all" ? filter : query })}</p>
        </div>
      ) : (
        <div className="list">
          {filtered.map((e) => {
            const status = e.status ?? "pending";
            return (
              <div key={e._id} className="row" onClick={() => onOpen(e._id)}>
                <button
                  type="button"
                  className={`status-dot status-dot--${status}`}
                  onClick={(ev) => handleStatusClick(ev, e)}
                  title={statusLabel(status)}
                  aria-label={statusLabel(status)}
                />
                <div className="row__main">
                  <p className="row__name">{e.contactName || t("contactUnnamed")}</p>
                  <p className="row__sub">
                    {e.actionName}
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
            );
          })}
        </div>
      )}
    </>
  );
}
