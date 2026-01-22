"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("invalidCredentials"));
      setIsSubmitting(false);
      return;
    }

    router.push("/");
  };

  return (
    <main className="card stack">
      <div className="stack">
        <h1 className="title">{t("loginTitle")}</h1>
        <p className="subtitle">{t("loginSubtitle")}</p>
      </div>

      <form className="stack" onSubmit={onSubmit}>
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
          {isSubmitting ? t("signingIn") : t("signIn")}
        </button>
      </form>

      <div className="row">
        <a className="button button-secondary" href="/register">
          {t("createAccount")}
        </a>
      </div>
      <LanguageToggle />
    </main>
  );
}
