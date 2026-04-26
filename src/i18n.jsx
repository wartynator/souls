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
  settingsTitle: "Settings",
  settingsDarkMode: "Dark mode",
  settingsLanguage: "Language",
  tabHome: "Home",
  tabContacts: "Contacts",
  tabDevices: "Devices",
  tabActions: "Actions",
  tabWorklist: "Worklist",
  dashGreetingMorning: "Good morning",
  dashGreetingAfternoon: "Good afternoon",
  dashGreetingEvening: "Good evening",
  dashOpenJobs: "Open jobs",
  dashToday: "Today",
  dashInProgress: "In progress",
  dashNoToday: "No entries for today",
  dashNoInProgress: "Nothing in progress",
  dashViewAll: "View all",
  // toolbar
  searchContacts: "Search contacts",
  searchDevices: "Search devices",
  searchActions: "Search actions",
  searchWorklist: "Search worklist",
  addContact: "Add contact",
  addDevice: "Add device",
  addAction: "Add action",
  addWorklist: "Add entry",
  // toasts
  toastAddContactFirst: "Add a contact first",
  toastAddDeviceFirst: "Add a device first",
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
  toastActionAdded: "Action added",
  toastActionUpdated: "Action updated",
  toastActionDeleted: "Action deleted",
  toastActionNameRequired: "Action name is required",
  toastInvalidPrice: "Invalid price",
  toastWorklistAdded: "Entry added",
  toastWorklistUpdated: "Entry updated",
  toastWorklistDeleted: "Entry deleted",
  toastDeviceRequired: "Please select a device",
  toastActionTypeRequired: "Action type is required",
  toastCouldNotSaveWorklist: "Could not save entry",
  // empty states
  emptyNoContactsTitle: "No contacts yet",
  emptyNoContactsText: "Tap \u201c{addContact}\u201d to create your first entry.",
  emptyNoDevicesTitle: "No devices yet",
  emptyNoDevicesText:
    "Devices must be assigned to a contact. Add a contact first, then add their devices.",
  emptyNoActionsTitle: "No actions yet",
  emptyNoActionsText: "Select a device and record what was done — repairs, upgrades, maintenance.",
  emptyNoWorklistTitle: "No worklist entries yet",
  emptyNoWorklistText: "Tap \u201c{addEntry}\u201d to log work done for a contact.",
  emptyNoMatchesTitle: "No matches",
  emptyNoMatchesText: "Nothing found for \u201c{query}\u201d.",
  // contact list
  contactUnnamed: "Unnamed",
  deviceCountOne: "{n} device",
  deviceCountOther: "{n} devices",
  // contact form
  contactFormNew: "New contact",
  contactFormEdit: "Edit contact",
  fieldName: "First name",
  fieldSurname: "Last name",
  fieldAddress: "Address",
  fieldCity: "City",
  fieldPhone: "Phone",
  fieldEmail: "Email",
  fieldNotes: "Notes",
  btnDelete: "Delete",
  btnDeleteDevice: "Delete device",
  btnCancel: "Cancel",
  btnSave: "Save",
  btnSaving: "Saving\u2026",
  // contact detail
  detailPhone: "Phone",
  detailEmail: "Email",
  detailAddress: "Address",
  detailCity: "City",
  detailNotes: "Notes",
  detailLogWork: "Log work",
  detailDevices: "Devices",
  detailAddDevice: "+ Add device",
  detailNoDevices: "No devices linked to this contact.",
  detailDeleteContact: "Delete contact",
  btnClose: "Close",
  btnEdit: "Edit",
  // action form / device action form
  actionFormNew: "New action",
  actionFormEdit: "Edit action",
  deviceActionFormTitle: "Log action",
  fieldActionName: "Action",
  fieldActionNamePlaceholder: "e.g. Battery replacement, Screen repair",
  fieldActionDate: "Date",
  fieldActionPrice: "Price",
  fieldActionPricePlaceholder: "e.g. 49.90",
  fieldActionNotesPlaceholder: "Parts used, workshop, warranty info…",
  toastActionRequired: "Please select an action",
  toastDeviceActionAdded: "Action logged",
  serviceHistory: "Service history",
  serviceHistoryAdd: "Log action",
  serviceHistoryEmpty: "No actions logged yet.",
  serviceHistoryNoActions: "Create actions in the Actions tab first, then log them here.",
  // device form
  deviceFormNew: "New device",
  deviceFormEdit: "Edit device",
  deviceLogWork: "Log work",
  fieldDeviceName: "Device name",
  fieldOwner: "Owner",
  fieldOwnerSearch: "Search contacts…",
  fieldDeviceNamePlaceholder: "e.g. work laptop, home router",
  fieldNotesPlaceholder:
    "Model, serial number, firmware, or anything you want to remember",
  // device list
  deviceUnnamed: "Unnamed device",
  deviceOwnerRemoved: "Owner removed",
  // barcode
  searchByBarcode: "Search by barcode",
  fieldBarcode: "Barcode",
  fieldBarcodePlaceholder: "Scan or enter barcode",
  scanBarcode: "Scan barcode",
  scannerHint: "Point the camera at a barcode",
  scannerDetected: "Barcode detected",
  scannerRescan: "Scan again",
  scannerUse: "Use",
  scannerCameraError:
    "Could not access the camera. Please check your permissions.",
  // import
  importContacts: "Import",
  importFromGoogle: "Import from Google",
  importOptionGoogle: "Google",
  importOptionCSV: "CSV",
  importGoogleLoading: "Connecting…",
  importGoogleError: "Could not connect to Google Contacts. Please try again.",
  importDialogTitle: "Import contacts",
  importPreviewCount: "{n} contacts found",
  importBtn: "Import {n}",
  importSuccess: "Imported {n} contacts",
  importNoContacts: "No contacts found in this file. Make sure it is a Google Contacts CSV export.",
  importInvalidFile: "Could not read the file. Please export as CSV from Google Contacts.",
  // worklist status
  statusPending: "Pending",
  statusInProgress: "In Progress",
  statusDone: "Done",
  filterAll: "All",
  // worklist form
  worklistFormNew: "New worklist entry",
  worklistFieldStatus: "Status",
  worklistFormEdit: "Edit worklist entry",
  worklistFieldContact: "Contact",
  worklistFieldDevice: "Device",
  worklistFieldDate: "Date",
  // report
  reportTitle: "Service Report",
  reportPrint: "Print / Save as PDF",
  reportSection1: "Customer",
  reportSection2: "Device",
  reportSection3: "Service",
  reportSection4: "Date & Notes",
  worklistFieldActionType: "Type of work",
  worklistNoActions: "Create actions in the Actions tab first",
  worklistPickAction: "Pick an action…",
  worklistSelectContactFirst: "Select a contact first",
  worklistNoDevices: "This contact has no devices",
  worklistPickDevice: "Pick a device…",
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
  settingsTitle: "Nastavenia",
  settingsDarkMode: "Tmavý režim",
  settingsLanguage: "Jazyk",
  tabHome: "Domov",
  tabContacts: "Kontakty",
  tabDevices: "Zariadenia",
  tabActions: "Akcie",
  tabWorklist: "Zákazky",
  dashGreetingMorning: "Dobré ráno",
  dashGreetingAfternoon: "Dobrý deň",
  dashGreetingEvening: "Dobrý večer",
  dashOpenJobs: "Otvorené zákazky",
  dashToday: "Dnes",
  dashInProgress: "Prebieha",
  dashNoToday: "Dnes žiadne zákazky",
  dashNoInProgress: "Nič neprebieha",
  dashViewAll: "Zobraziť všetko",
  // toolbar
  searchContacts: "Hľadať kontakty",
  searchDevices: "Hľadať zariadenia",
  searchActions: "Hľadať akcie",
  searchWorklist: "Hľadať zákazky",
  addContact: "Pridať kontakt",
  addDevice: "Pridať zariadenie",
  addAction: "Pridať akciu",
  addWorklist: "Pridať záznam",
  // toasts
  toastAddContactFirst: "Najprv pridajte kontakt",
  toastAddDeviceFirst: "Najprv pridajte zariadenie",
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
  toastActionAdded: "Akcia pridaná",
  toastActionUpdated: "Akcia aktualizovaná",
  toastActionDeleted: "Akcia vymazaná",
  toastActionNameRequired: "Názov akcie je povinný",
  toastInvalidPrice: "Neplatná cena",
  toastWorklistAdded: "Záznam pridaný",
  toastWorklistUpdated: "Záznam aktualizovaný",
  toastWorklistDeleted: "Záznam vymazaný",
  toastDeviceRequired: "Prosím vyberte zariadenie",
  toastActionTypeRequired: "Typ práce je povinný",
  toastCouldNotSaveWorklist: "Záznam sa nepodarilo uložiť",
  // empty states
  emptyNoContactsTitle: "Zatiaľ žiadne kontakty",
  emptyNoContactsText: "Klepnite na \u201e{addContact}\u201c a vytvorte prvý záznam.",
  emptyNoDevicesTitle: "Zatiaľ žiadne zariadenia",
  emptyNoDevicesText:
    "Zariadenia musia byť priradené ku kontaktu. Najprv pridajte kontakt, potom pridajte jeho zariadenia.",
  emptyNoActionsTitle: "Zatiaľ žiadne akcie",
  emptyNoActionsText: "Vyberte zariadenie a zaznamenajte, čo bolo vykonané – opravy, upgrady, údržba.",
  emptyNoWorklistTitle: "Zatiaľ žiadne zákazky",
  emptyNoWorklistText: "Klepnite na „{addEntry}“ a pridajte prvý záznam.",
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
  fieldSurname: "Priezvisko",
  fieldAddress: "Adresa",
  fieldCity: "Mesto",
  fieldPhone: "Telefón",
  fieldEmail: "Email",
  fieldNotes: "Poznámky",
  btnDelete: "Vymazať",
  btnDeleteDevice: "Vymazať zariadenie",
  btnCancel: "Zrušiť",
  btnSave: "Uložiť",
  btnSaving: "Ukladanie\u2026",
  // contact detail
  detailPhone: "Telefón",
  detailEmail: "Email",
  detailAddress: "Adresa",
  detailCity: "Mesto",
  detailNotes: "Poznámky",
  detailLogWork: "Zaznamenať prácu",
  detailDevices: "Zariadenia",
  detailAddDevice: "+ Pridať zariadenie",
  detailNoDevices: "K tomuto kontaktu nie sú priradené žiadne zariadenia.",
  detailDeleteContact: "Vymazať kontakt",
  btnClose: "Zavrieť",
  btnEdit: "Upraviť",
  // action form / device action form
  actionFormNew: "Nová akcia",
  actionFormEdit: "Upraviť akciu",
  deviceActionFormTitle: "Zaznamenať akciu",
  fieldActionName: "Akcia",
  fieldActionNamePlaceholder: "napr. Výmena batérie, Oprava displeja",
  fieldActionDate: "Dátum",
  fieldActionPrice: "Cena",
  fieldActionPricePlaceholder: "napr. 49.90",
  fieldActionNotesPlaceholder: "Použité diely, servis, záruka…",
  toastActionRequired: "Prosím vyberte akciu",
  toastDeviceActionAdded: "Akcia zaznamenaná",
  serviceHistory: "História servisu",
  serviceHistoryAdd: "Zaznamenať akciu",
  serviceHistoryEmpty: "Zatiaľ žiadne záznamy.",
  serviceHistoryNoActions: "Najprv vytvorte akcie v záložke Akcie, potom ich tu zaznamenajte.",
  // device form
  deviceFormNew: "Nové zariadenie",
  deviceFormEdit: "Upraviť zariadenie",
  deviceLogWork: "Zaznamenať prácu",
  fieldDeviceName: "Názov zariadenia",
  fieldOwner: "Vlastník",
  fieldOwnerSearch: "Hľadať kontakty…",
  fieldDeviceNamePlaceholder: "napr. pracovný notebook, domáci router",
  fieldNotesPlaceholder:
    "Model, sériové číslo, firmware alebo čokoľvek, čo chcete zapamätať",
  // device list
  deviceUnnamed: "Zariadenie bez názvu",
  deviceOwnerRemoved: "Vlastník bol odstránený",
  // barcode
  fieldBarcode: "Čiarový kód",
  fieldBarcodePlaceholder: "Naskenujte alebo zadajte čiarový kód",
  scanBarcode: "Skenovať čiarový kód",
  scannerHint: "Namierenou kamerou na čiarový kód",
  scannerDetected: "Čiarový kód naskenovaný",
  scannerRescan: "Skenovať znova",
  scannerUse: "Použiť",
  searchByBarcode: "Vyhľadať podľa čiarového kódu",
  scannerCameraError:
    "Nepodarilo sa získať prístup ku kamere. Skontrolujte povolenia.",
  // import
  importContacts: "Importovať",
  importFromGoogle: "Importovať z Googlu",
  importOptionGoogle: "Google",
  importOptionCSV: "CSV",
  importGoogleLoading: "Pripájam…",
  importGoogleError: "Nepodarilo sa pripojiť ku Google Kontaktom. Skúste znova.",
  importDialogTitle: "Importovať kontakty",
  importPreviewCount: "Nájdených {n} kontaktov",
  importBtn: "Importovať {n}",
  importSuccess: "Importovaných {n} kontaktov",
  importNoContacts: "V súbore sa nenašli žiadne kontakty. Uistite sa, že ide o export z Google Kontaktov vo formáte CSV.",
  importInvalidFile: "Súbor sa nepodarilo načítať. Exportujte kontakty ako CSV z Google Kontaktov.",
  // worklist status
  statusPending: "Čaká",
  statusInProgress: "Prebieha",
  statusDone: "Hotovo",
  filterAll: "Všetky",
  // worklist form
  worklistFormNew: "Nová zákazka",
  worklistFieldStatus: "Stav",
  worklistFormEdit: "Upraviť zákazku",
  worklistFieldContact: "Kontakt",
  worklistFieldDevice: "Zariadenie",
  worklistFieldDate: "Dátum",
  // report
  reportTitle: "Servisný protokol",
  reportPrint: "Tlačiť / Uložiť ako PDF",
  reportSection1: "Zákazník",
  reportSection2: "Zariadenie",
  reportSection3: "Servis",
  reportSection4: "Dátum a poznámky",
  worklistFieldActionType: "Typ práce",
  worklistNoActions: "Najprv vytvorte akcie na karte Akcie",
  worklistPickAction: "Vyberte akciu…",
  worklistSelectContactFirst: "Najprv vyberte kontakt",
  worklistNoDevices: "Tento kontakt nemá žiadne zariadenia",
  worklistPickDevice: "Vyberte zariadenie…",
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
