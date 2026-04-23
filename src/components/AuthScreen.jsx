import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useToast } from "./Toast.jsx";

export default function AuthScreen() {
  const { signIn } = useAuthActions();
  const toast = useToast();
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password) {
      toast.show("Email and password required");
      return;
    }
    if (mode === "signUp" && password.length < 8) {
      toast.show("Password must be at least 8 characters");
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
        mode === "signUp"
          ? "Could not create account. Email may already be in use."
          : "Invalid email or password",
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
          {mode === "signIn" ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={handleSubmit} className="auth__form">
          <label className="field">
            <span className="field__label">Email</span>
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
            <span className="field__label">Password</span>
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
              ? "Please wait…"
              : mode === "signIn"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          className="auth__switch"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          {mode === "signIn"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
