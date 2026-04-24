import { useLocale } from "../i18n.jsx";

export default function SettingsPanel({ open, email, darkMode, onToggleDark, onSignOut, onClose }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <>
      <div
        className={`settings-overlay${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`settings-panel${open ? " is-open" : ""}`}>
        <div className="settings-panel__head">
          <span className="settings-panel__title">{t("settingsTitle")}</span>
          <button className="dialog__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="settings-panel__body">
          {email && <p className="settings-panel__email">{email}</p>}

          {/* Dark mode */}
          <div className="settings-row">
            <span className="settings-row__label">
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {t("settingsDarkMode")}
            </span>
            <button
              className={`settings-toggle${darkMode ? " is-on" : ""}`}
              onClick={onToggleDark}
              role="switch"
              aria-checked={darkMode}
            >
              <span className="settings-toggle__thumb" />
            </button>
          </div>

          {/* Language */}
          <div className="settings-row">
            <span className="settings-row__label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 3c-2.4 4-3 6-3 9s.6 5 3 9M12 3c2.4 4 3 6 3 9s-.6 5-3 9M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {t("settingsLanguage")}
            </span>
            <div className="settings-lang">
              <button
                className={`settings-lang__btn${locale === "en" ? " is-active" : ""}`}
                onClick={() => setLocale("en")}
              >EN</button>
              <button
                className={`settings-lang__btn${locale === "sk" ? " is-active" : ""}`}
                onClick={() => setLocale("sk")}
              >SK</button>
            </div>
          </div>
        </div>

        <div className="settings-panel__foot">
          <button className="btn btn--ghost btn--danger settings-panel__signout" onClick={onSignOut}>
            {t("headerSignOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
