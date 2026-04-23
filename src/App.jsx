import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import AuthScreen from "./components/AuthScreen.jsx";
import Souls from "./components/Souls.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { LocaleProvider } from "./i18n.jsx";

export default function App() {
  return (
    <LocaleProvider>
    <ToastProvider>
      <AuthLoading>
        <div className="loading">
          <div className="loading__spinner" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <AuthScreen />
      </Unauthenticated>

      <Authenticated>
        <Souls />
      </Authenticated>
    </ToastProvider>
    </LocaleProvider>
  );
}
