import { useMemo } from "react";
import { useLocale } from "../i18n.jsx";

const STATUS_COLORS = { pending: "#f59e0b", in_progress: "#3b82f6", done: "#22c55e" };

export default function Dashboard({ worklist, contacts, devices, actions, onNavigate, onOpenEntry }) {
  const { t } = useLocale();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("dashGreetingMorning") :
    hour < 18 ? t("dashGreetingAfternoon") :
    t("dashGreetingEvening");

  const todayISO = new Date().toISOString().slice(0, 10);

  const { openCount, todayEntries, inProgressEntries } = useMemo(() => {
    const open = worklist.filter((e) => (e.status ?? "pending") !== "done");
    return {
      openCount: open.length,
      todayEntries: worklist
        .filter((e) => e.date === todayISO)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
      inProgressEntries: worklist
        .filter((e) => (e.status ?? "pending") === "in_progress")
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    };
  }, [worklist, todayISO]);

  const formatDate = (iso) => iso.split("-").reverse().join(".");

  const EntryRow = ({ entry }) => {
    const status = entry.status ?? "pending";
    return (
      <div className="dash__row" onClick={() => onOpenEntry(entry._id)}>
        <span
          className="status-dot"
          style={{ background: STATUS_COLORS[status] }}
          aria-hidden="true"
        />
        <div className="dash__row-main">
          <p className="dash__row-name">{entry.contactName || t("contactUnnamed")}</p>
          <p className="dash__row-sub">
            {entry.actionName}
            {entry.deviceName && ` · ${entry.deviceName}`}
          </p>
        </div>
        <span className="dash__row-date">{formatDate(entry.date)}</span>
      </div>
    );
  };

  return (
    <div className="dash">
      <p className="dash__greeting">{greeting}</p>

      {/* Stats */}
      <div className="dash__stats">
        <button
          type="button"
          className="dash__stat dash__stat--accent"
          onClick={() => onNavigate("worklist")}
        >
          <p className="dash__stat-value">{openCount}</p>
          <p className="dash__stat-label">{t("dashOpenJobs")}</p>
        </button>
        <button
          type="button"
          className="dash__stat"
          onClick={() => onNavigate("contacts")}
        >
          <p className="dash__stat-value">{contacts.length}</p>
          <p className="dash__stat-label">{t("tabContacts")}</p>
        </button>
        <button
          type="button"
          className="dash__stat"
          onClick={() => onNavigate("devices")}
        >
          <p className="dash__stat-value">{devices.length}</p>
          <p className="dash__stat-label">{t("tabDevices")}</p>
        </button>
        <button
          type="button"
          className="dash__stat"
          onClick={() => onNavigate("actions")}
        >
          <p className="dash__stat-value">{actions.length}</p>
          <p className="dash__stat-label">{t("tabActions")}</p>
        </button>
      </div>

      {/* Today */}
      <div className="dash__section">
        <div className="dash__section-head">
          <p className="dash__section-title">{t("dashToday")}</p>
          {todayEntries.length > 0 && (
            <button type="button" className="dash__view-all" onClick={() => onNavigate("worklist")}>
              {t("dashViewAll")} →
            </button>
          )}
        </div>
        {todayEntries.length === 0 ? (
          <p className="dash__empty">{t("dashNoToday")}</p>
        ) : (
          <div className="dash__rows">
            {todayEntries.map((e) => <EntryRow key={e._id} entry={e} />)}
          </div>
        )}
      </div>

      {/* In Progress */}
      <div className="dash__section">
        <div className="dash__section-head">
          <p className="dash__section-title">{t("dashInProgress")}</p>
          {inProgressEntries.length > 0 && (
            <button type="button" className="dash__view-all" onClick={() => onNavigate("worklist")}>
              {t("dashViewAll")} →
            </button>
          )}
        </div>
        {inProgressEntries.length === 0 ? (
          <p className="dash__empty">{t("dashNoInProgress")}</p>
        ) : (
          <div className="dash__rows">
            {inProgressEntries.map((e) => <EntryRow key={e._id} entry={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}
