import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

export default function AuthScreen() {
  const { signIn } = useAuthActions();
  const toast = useToast();
  const { t } = useLocale();
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password) {
      toast.show(t("authErrorRequired"));
      return;
    }
    if (mode === "signUp" && password.length < 8) {
      toast.show(t("authErrorPasswordLength"));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", email.trim());
      formData.set("password", password);
      formData.set("flow", mode);
      await signIn("password", formData);
      // On success, <Authenticated> kicks in and swaps the screen.
    } catch (err) {
      // Convex Auth throws on bad creds / existing email / weak password etc.
      console.error(err);
      toast.show(
        mode === "signUp" ? t("authErrorSignUp") : t("authErrorSignIn"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Souls</h1>
        <p className="auth__subtitle">
          {mode === "signIn" ? t("authSubtitleSignIn") : t("authSubtitleSignUp")}
        </p>

        <form onSubmit={handleSubmit} className="auth__form">
          <label className="field">
            <span className="field__label">{t("authEmail")}</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">{t("authPassword")}</span>
            <input
              className="field__input"
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signUp" ? 8 : undefined}
            />
          </label>

          <button
            type="submit"
            className="btn btn--primary auth__submit"
            disabled={submitting}
          >
            {submitting
              ? t("authSubmitLoading")
              : mode === "signIn"
                ? t("authSubmitSignIn")
                : t("authSubmitSignUp")}
          </button>
        </form>

        <button
          type="button"
          className="auth__switch"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          {mode === "signIn" ? t("authSwitchToSignUp") : t("authSwitchToSignIn")}
        </button>
      </div>
    </div>
  );
}
