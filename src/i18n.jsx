import { createContext, useContext, useState } from "react";

// ─── English strings ──────────────────────────────────────────────────────────

const en = {
  // auth
  authSubtitleSignIn: "Sign in to your account",
  authSubtitleSignUp: "Create a new account",
  authEmail: "Email",
  authPassword: "Password",
  authSubmitSignIn: "Sign in",
  authSubmitSignUp: "Create account",
  authSubmitLoading: "Please wait\u2026",
  authSwitchToSignUp: "Don\u2019t have an account? Create one",
  authSwitchToSignIn: "Already have an account? Sign in",
  authErrorRequired: "Email and password required",
  authErrorPasswordLength: "Password must be at least 8 characters",
  authErrorSignUp: "Could not create account. Email may already be in use.",
  authErrorSignIn: "Invalid email or password",
  // header / nav
  headerSignOut: "Sign out",
  tabContacts: "Contacts",
  tabDevices: "Devices",
  // toolbar
  searchContacts: "Search contacts",
  searchDevices: "Search devices",
  addContact: "Add contact",
  addDevice: "Add device",
  // toasts
  toastAddContactFirst: "Add a contact first",
  toastContactAdded: "Contact added",
  toastContactUpdated: "Contact updated",
  toastContactDeleted: "Contact deleted",
  toastDeviceAdded: "Device added",
  toastDeviceUpdated: "Device updated",
  toastDeviceDeleted: "Device deleted",
  toastSomethingWentWrong: "Something went wrong",
  toastNameRequired: "Name is required",
  toastCouldNotSaveContact: "Could not save contact",
  toastDeviceNameRequired: "Device name is required",
  toastOwnerRequired: "Owner is required",
  toastCouldNotSaveDevice: "Could not save device",
  // empty states
  emptyNoContactsTitle: "No contacts yet",
  emptyNoContactsText: "Tap \u201c{addContact}\u201d to create your first entry.",
  emptyNoDevicesTitle: "No devices yet",
  emptyNoDevicesText:
    "Devices must be assigned to a contact. Add a contact first, then add their devices.",
  emptyNoMatchesTitle: "No matches",
  emptyNoMatchesText: "Nothing found for \u201c{query}\u201d.",
  // contact list
  contactUnnamed: "Unnamed",
  deviceCountOne: "{n} device",
  deviceCountOther: "{n} devices",
  // contact form
  contactFormNew: "New contact",
  contactFormEdit: "Edit contact",
  fieldName: "Name",
  fieldPhone: "Phone",
  fieldEmail: "Email",
  fieldNotes: "Notes",
  btnDelete: "Delete",
  btnCancel: "Cancel",
  btnSave: "Save",
  btnSaving: "Saving\u2026",
  // contact detail
  detailPhone: "Phone",
  detailEmail: "Email",
  detailNotes: "Notes",
  detailDevices: "Devices",
  detailAddDevice: "+ Add device",
  detailNoDevices: "No devices linked to this contact.",
  detailDeleteContact: "Delete contact",
  btnClose: "Close",
  btnEdit: "Edit",
  // device form
  deviceFormNew: "New device",
  deviceFormEdit: "Edit device",
  fieldDeviceName: "Device name",
  fieldOwner: "Owner",
  fieldDeviceNamePlaceholder: "e.g. work laptop, home router",
  fieldNotesPlaceholder:
    "Model, serial number, firmware, or anything you want to remember",
  // device list
  deviceUnnamed: "Unnamed device",
  deviceOwnerRemoved: "Owner removed",
  // confirm dialog
  confirmDelete: "Delete",
  confirmCannotUndo: "This cannot be undone.",
  confirmLinkedDevicesOne:
    "This will also remove {n} linked device. This cannot be undone.",
  confirmLinkedDevicesOther:
    "This will also remove {n} linked devices. This cannot be undone.",
};

// ─── Slovak strings ───────────────────────────────────────────────────────────

const sk = {
  // auth
  authSubtitleSignIn: "Prihláste sa do svojho účtu",
  authSubtitleSignUp: "Vytvorte nový účet",
  authEmail: "Email",
  authPassword: "Heslo",
  authSubmitSignIn: "Prihlásiť sa",
  authSubmitSignUp: "Vytvoriť účet",
  authSubmitLoading: "Čakajte\u2026",
  authSwitchToSignUp: "Nemáte účet? Vytvorte si ho",
  authSwitchToSignIn: "Už máte účet? Prihláste sa",
  authErrorRequired: "Email a heslo sú povinné",
  authErrorPasswordLength: "Heslo musí mať aspoň 8 znakov",
  authErrorSignUp: "Účet sa nepodarilo vytvoriť. Email môže byť už zaregistrovaný.",
  authErrorSignIn: "Neplatný email alebo heslo",
  // header / nav
  headerSignOut: "Odhlásiť sa",
  tabContacts: "Kontakty",
  tabDevices: "Zariadenia",
  // toolbar
  searchContacts: "Hľadať kontakty",
  searchDevices: "Hľadať zariadenia",
  addContact: "Pridať kontakt",
  addDevice: "Pridať zariadenie",
  // toasts
  toastAddContactFirst: "Najprv pridajte kontakt",
  toastContactAdded: "Kontakt pridaný",
  toastContactUpdated: "Kontakt aktualizovaný",
  toastContactDeleted: "Kontakt vymazaný",
  toastDeviceAdded: "Zariadenie pridané",
  toastDeviceUpdated: "Zariadenie aktualizované",
  toastDeviceDeleted: "Zariadenie vymazané",
  toastSomethingWentWrong: "Niečo sa pokazilo",
  toastNameRequired: "Meno je povinné",
  toastCouldNotSaveContact: "Kontakt sa nepodarilo uložiť",
  toastDeviceNameRequired: "Názov zariadenia je povinný",
  toastOwnerRequired: "Vlastník je povinný",
  toastCouldNotSaveDevice: "Zariadenie sa nepodarilo uložiť",
  // empty states
  emptyNoContactsTitle: "Zatiaľ žiadne kontakty",
  emptyNoContactsText: "Klepnite na \u201e{addContact}\u201c a vytvorte prvý záznam.",
  emptyNoDevicesTitle: "Zatiaľ žiadne zariadenia",
  emptyNoDevicesText:
    "Zariadenia musia byť priradené ku kontaktu. Najprv pridajte kontakt, potom pridajte jeho zariadenia.",
  emptyNoMatchesTitle: "Žiadne výsledky",
  emptyNoMatchesText: "Nič sa nenašlo pre \u201e{query}\u201c.",
  // contact list — Slovak has three plural forms: 1 / 2–4 / 5+
  contactUnnamed: "Bez mena",
  deviceCountOne: "{n} zariadenie",
  deviceCountFew: "{n} zariadenia",
  deviceCountOther: "{n} zariadení",
  // contact form
  contactFormNew: "Nový kontakt",
  contactFormEdit: "Upraviť kontakt",
  fieldName: "Meno",
  fieldPhone: "Telefón",
  fieldEmail: "Email",
  fieldNotes: "Poznámky",
  btnDelete: "Vymazať",
  btnCancel: "Zrušiť",
  btnSave: "Uložiť",
  btnSaving: "Ukladanie\u2026",
  // contact detail
  detailPhone: "Telefón",
  detailEmail: "Email",
  detailNotes: "Poznámky",
  detailDevices: "Zariadenia",
  detailAddDevice: "+ Pridať zariadenie",
  detailNoDevices: "K tomuto kontaktu nie sú priradené žiadne zariadenia.",
  detailDeleteContact: "Vymazať kontakt",
  btnClose: "Zavrieť",
  btnEdit: "Upraviť",
  // device form
  deviceFormNew: "Nové zariadenie",
  deviceFormEdit: "Upraviť zariadenie",
  fieldDeviceName: "Názov zariadenia",
  fieldOwner: "Vlastník",
  fieldDeviceNamePlaceholder: "napr. pracovný notebook, domáci router",
  fieldNotesPlaceholder:
    "Model, sériové číslo, firmware alebo čokoľvek, čo chcete zapamätať",
  // device list
  deviceUnnamed: "Zariadenie bez názvu",
  deviceOwnerRemoved: "Vlastník bol odstránený",
  // confirm dialog
  confirmDelete: "Vymazať",
  confirmCannotUndo: "Toto nie je možné vrátiť späť.",
  confirmLinkedDevicesOne:
    "Odstráni sa aj {n} priradené zariadenie. Toto nie je možné vrátiť späť.",
  confirmLinkedDevicesFew:
    "Odstránia sa aj {n} priradené zariadenia. Toto nie je možné vrátiť späť.",
  confirmLinkedDevicesOther:
    "Odstráni sa aj {n} priradených zariadení. Toto nie je možné vrátiť späť.",
};

// ─── plural helpers ───────────────────────────────────────────────────────────

function pluralCategoryEn(n) {
  return n === 1 ? "one" : "other";
}

function pluralCategorySk(n) {
  if (n === 1) return "one";
  if (n >= 2 && n <= 4) return "few";
  return "other";
}

const pluralCategory = { en: pluralCategoryEn, sk: pluralCategorySk };

// ─── context ──────────────────────────────────────────────────────────────────

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(
    () => localStorage.getItem("souls-locale") || "en",
  );

  const setLocale = (l) => {
    setLocaleState(l);
    localStorage.setItem("souls-locale", l);
  };

  const msgs = locale === "sk" ? sk : en;
  const getCategory = pluralCategory[locale] ?? pluralCategoryEn;

  /**
   * t(key, vars?) — translate a key with optional {varName} interpolation.
   */
  const t = (key, vars) => {
    let s = msgs[key] ?? en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        s = s.replaceAll(`{${k}}`, v);
      });
    }
    return s;
  };

  /**
   * deviceCountLabel(n) — e.g. "3 devices" / "3 zariadenia"
   */
  const deviceCountLabel = (n) => {
    const cat = getCategory(n);
    const keyMap = { one: "deviceCountOne", few: "deviceCountFew", other: "deviceCountOther" };
    const key = keyMap[cat] ?? "deviceCountOther";
    return t(key, { n });
  };

  /**
   * linkedDevicesWarning(n) — confirm-dialog text when a contact has linked devices.
   */
  const linkedDevicesWarning = (n) => {
    const cat = getCategory(n);
    const keyMap = {
      one: "confirmLinkedDevicesOne",
      few: "confirmLinkedDevicesFew",
      other: "confirmLinkedDevicesOther",
    };
    const key = keyMap[cat] ?? "confirmLinkedDevicesOther";
    return t(key, { n });
  };

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t, deviceCountLabel, linkedDevicesWarning }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
