export type Language = "sk" | "en";

type TranslationKey =
  | "appTitle"
  | "appSubtitle"
  | "signOut"
  | "searchPlaceholder"
  | "search"
  | "searching"
  | "noDevices"
  | "barcode"
  | "name"
  | "errorLoadDevices"
  | "loginTitle"
  | "loginSubtitle"
  | "email"
  | "password"
  | "signIn"
  | "signingIn"
  | "createAccount"
  | "invalidCredentials"
  | "registerTitle"
  | "registerSubtitle"
  | "nameLabel"
  | "register"
  | "registering"
  | "backToSignIn"
  | "registrationFailed"
  | "language"
  | "slovak"
  | "english";

type Dictionary = Record<TranslationKey, string>;

export const translations: Record<Language, Dictionary> = {
  sk: {
    appTitle: "Vyhľadávanie zariadení",
    appSubtitle:
      "Vyhľadávajte podľa sériového čísla alebo čiarového kódu. Prihlásený ako {email}",
    signOut: "Odhlásiť sa",
    searchPlaceholder: "Hľadať podľa sériového čísla alebo čiarového kódu",
    search: "Hľadať",
    searching: "Hľadám...",
    noDevices: "Zatiaľ neboli nájdené žiadne zariadenia.",
    barcode: "Čiarový kód",
    name: "Názov",
    errorLoadDevices: "Nepodarilo sa načítať zariadenia.",
    loginTitle: "Vitajte späť",
    loginSubtitle: "Prihláste sa na vyhľadávanie zariadení.",
    email: "E-mail",
    password: "Heslo",
    signIn: "Prihlásiť sa",
    signingIn: "Prihlasujem...",
    createAccount: "Vytvoriť účet",
    invalidCredentials: "Neplatný e-mail alebo heslo.",
    registerTitle: "Vytvorte si účet",
    registerSubtitle:
      "Nastavte prístup do aplikácie na vyhľadávanie zariadení.",
    nameLabel: "Meno",
    register: "Vytvoriť účet",
    registering: "Vytváram...",
    backToSignIn: "Späť na prihlásenie",
    registrationFailed: "Registrácia zlyhala.",
    language: "Jazyk",
    slovak: "Slovenčina",
    english: "Angličtina",
  },
  en: {
    appTitle: "Device Lookup",
    appSubtitle:
      "Search by serial number or barcode. Signed in as {email}",
    signOut: "Sign out",
    searchPlaceholder: "Search by serial number or barcode",
    search: "Search",
    searching: "Searching...",
    noDevices: "No devices found yet.",
    barcode: "Barcode",
    name: "Name",
    errorLoadDevices: "Could not load devices.",
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to search for devices.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    createAccount: "Create account",
    invalidCredentials: "Invalid email or password.",
    registerTitle: "Create your account",
    registerSubtitle: "Set up access for the device lookup app.",
    nameLabel: "Name",
    register: "Create account",
    registering: "Creating...",
    backToSignIn: "Back to sign in",
    registrationFailed: "Registration failed.",
    language: "Language",
    slovak: "Slovak",
    english: "English",
  },
};
