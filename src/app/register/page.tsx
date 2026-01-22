"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data?.error ?? t("registrationFailed"));
      setIsSubmitting(false);
      return;
    }

    router.push("/login");
  };

  return (
    <main className="card stack">
      <div className="stack">
        <h1 className="title">{t("registerTitle")}</h1>
        <p className="subtitle">{t("registerSubtitle")}</p>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <label className="stack">
          <span>{t("nameLabel")}</span>
          <input
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="stack">
          <span>{t("email")}</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="stack">
          <span>{t("password")}</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("registering") : t("register")}
        </button>
      </form>

      <div className="row">
        <a className="button button-secondary" href="/login">
          {t("backToSignIn")}
        </a>
      </div>
      <LanguageToggle />
    </main>
  );
}
