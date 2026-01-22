"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <span className="subtitle">{t("language")}:</span>
      <button
        className={`button button-secondary`}
        type="button"
        onClick={() => setLanguage("sk")}
        aria-pressed={language === "sk"}
      >
        {t("slovak")}
      </button>
      <button
        className={`button button-secondary`}
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
      >
        {t("english")}
      </button>
    </div>
  );
}
