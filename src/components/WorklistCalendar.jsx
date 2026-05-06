import { useMemo, useState } from "react";
import { useLocale } from "../i18n.jsx";

const STATUS_COLORS = { pending: "#f59e0b", in_progress: "#3b82f6", done: "#22c55e" };
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_SK = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function WorklistCalendar({ worklist, onOpen }) {
  const { locale, t } = useLocale();
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const e of worklist) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return map;
  }, [worklist]);

  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-first
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    const rows = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  const monthLabel = useMemo(() =>
    new Date(viewYear, viewMonth, 1).toLocaleDateString(
      locale === "sk" ? "sk-SK" : "en-GB",
      { month: "long", year: "numeric" },
    ),
  [viewYear, viewMonth, locale]);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(todayISO);
  };

  const dayNames = locale === "sk" ? DAY_NAMES_SK : DAY_NAMES_EN;
  const selectedEntries = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <div className="cal">
      {/* Navigation */}
      <div className="cal__nav">
        <button type="button" className="btn btn--ghost btn--small" onClick={goPrev}>←</button>
        <div className="cal__nav-center">
          <span className="cal__month-label">{monthLabel}</span>
          <button type="button" className="cal__today-btn" onClick={goToday}>
            {t("calendarToday")}
          </button>
        </div>
        <button type="button" className="btn btn--ghost btn--small" onClick={goNext}>→</button>
      </div>

      {/* Grid */}
      <div className="cal__grid">
        {dayNames.map((d) => (
          <div key={d} className="cal__weekday">{d}</div>
        ))}
        {weeks.flat().map((day, i) => {
          if (!day) return <div key={`p${i}`} className="cal__day cal__day--pad" />;
          const iso = toISO(viewYear, viewMonth, day);
          const entries = byDate.get(iso) ?? [];
          const isToday = iso === todayISO;
          const isSelected = iso === selectedDate;
          const visibleDots = entries.slice(0, 3).map((e) => e.status ?? "pending");
          const overflow = entries.length - 3;
          return (
            <div
              key={iso}
              className={`cal__day${isToday ? " cal__day--today" : ""}${isSelected ? " cal__day--selected" : ""}${entries.length > 0 ? " cal__day--has-entries" : ""}`}
              onClick={() => setSelectedDate(iso === selectedDate ? null : iso)}
            >
              <span className="cal__day-num">{day}</span>
              {entries.length > 0 && (
                <div className="cal__dots">
                  {visibleDots.map((s, j) => (
                    <span key={j} className="cal__dot" style={{ background: STATUS_COLORS[s] }} />
                  ))}
                  {overflow > 0 && <span className="cal__overflow">+{overflow}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <div className="cal__panel">
          <p className="cal__panel-date">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString(
              locale === "sk" ? "sk-SK" : "en-GB",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </p>
          {selectedEntries.length === 0 ? (
            <p className="cal__panel-empty">{t("calendarNoEntries")}</p>
          ) : (
            <div className="cal__panel-rows">
              {selectedEntries.map((e) => {
                const status = e.status ?? "pending";
                return (
                  <div key={e._id} className="cal__panel-row" onClick={() => onOpen(e._id)}>
                    <span className="cal__dot" style={{ background: STATUS_COLORS[status], flexShrink: 0 }} />
                    <div className="cal__panel-info">
                      <span className="cal__panel-name">{e.contactName}</span>
                      {e.deviceName && <span className="cal__panel-sub"> · {e.deviceName}</span>}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
