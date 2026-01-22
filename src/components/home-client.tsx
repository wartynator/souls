"use client";

import { signOut } from "next-auth/react";

import { DeviceSearch } from "@/components/device-search";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

type HomeClientProps = {
  email: string;
};

export function HomeClient({ email }: HomeClientProps) {
  const { t } = useLanguage();

  return (
    <main className="card stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack">
          <h1 className="title">{t("appTitle")}</h1>
          <p className="subtitle">{t("appSubtitle", { email })}</p>
        </div>
        <div className="stack" style={{ alignItems: "flex-end" }}>
          <LanguageToggle />
          <button
            className="button button-secondary"
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <DeviceSearch />
    </main>
  );
}
