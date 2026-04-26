import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import ContactList from "./ContactList.jsx";
import DeviceList from "./DeviceList.jsx";
import ActionList from "./ActionList.jsx";
import WorklistList from "./WorklistList.jsx";
import ContactForm from "./ContactForm.jsx";
import ContactDetail from "./ContactDetail.jsx";
import DeviceForm from "./DeviceForm.jsx";
import ActionForm from "./ActionForm.jsx";
import WorklistForm from "./WorklistForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import BarcodeScanner from "./BarcodeScanner.jsx";
import ContactImport from "./ContactImport.jsx";
import SettingsPanel from "./SettingsPanel.jsx";
import WorklistReport from "./WorklistReport.jsx";
import Dashboard from "./Dashboard.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

export default function Souls() {
  const { signOut } = useAuthActions();
  const toast = useToast();
  const { locale, setLocale, t, linkedDevicesWarning } = useLocale();

  const contacts = useQuery(api.contacts.list) ?? [];
  const devices = useQuery(api.devices.list) ?? [];
  const actions = useQuery(api.actions.list) ?? [];
  const worklist = useQuery(api.worklist.list) ?? [];
  const currentUser = useQuery(api.users.currentUser);

  const deleteContact = useMutation(api.contacts.remove);
  const deleteDevice = useMutation(api.devices.remove);
  const deleteAction = useMutation(api.actions.remove);
  const deleteWorklistEntry = useMutation(api.worklist.remove);

  const [tab, setTab] = useState("home"); // "home" | "contacts" | "devices" | "actions" | "worklist"
  const [query, setQuery] = useState("");
  const [searchScannerOpen, setSearchScannerOpen] = useState(false);

  // Dialog state
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactFormId, setContactFormId] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState(null);

  const [deviceFormOpen, setDeviceFormOpen] = useState(false);
  const [deviceFormId, setDeviceFormId] = useState(null);
  const [deviceFormPresetOwner, setDeviceFormPresetOwner] = useState(null);

  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [actionFormId, setActionFormId] = useState(null);
  const [actionFormPresetDevice, setActionFormPresetDevice] = useState(null);

  const [worklistFormOpen, setWorklistFormOpen] = useState(false);
  const [worklistFormId, setWorklistFormId] = useState(null);
  const [worklistFormPresetContact, setWorklistFormPresetContact] = useState(null);
  const [worklistFormPresetDevice, setWorklistFormPresetDevice] = useState(null);

  const [confirm, setConfirm] = useState(null); // { kind, id, title, text }
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportEntryId, setReportEntryId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("souls-theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("souls-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  /* ---------- handlers ---------- */

  const handleTab = (t) => {
    setTab(t);
    setQuery("");
  };

  const handleAdd = () => {
    if (tab === "contacts") {
      setContactFormId(null);
      setContactFormOpen(true);
    } else if (tab === "devices") {
      if (contacts.length === 0) {
        toast.show(t("toastAddContactFirst"));
        setTab("contacts");
        return;
      }
      setDeviceFormId(null);
      setDeviceFormPresetOwner(null);
      setDeviceFormOpen(true);
    } else if (tab === "worklist") {
      if (contacts.length === 0) {
        toast.show(t("toastAddContactFirst"));
        setTab("contacts");
        return;
      }
      setWorklistFormId(null);
      setWorklistFormPresetContact(null);
      setWorklistFormPresetDevice(null);
      setWorklistFormOpen(true);
    } else {
      setActionFormId(null);
      setActionFormPresetDevice(null);
      setActionFormOpen(true);
    }
  };

  const openContact = (id) => {
    setDetailContactId(id);
    setDetailOpen(true);
  };

  const editContactFromDetail = () => {
    const id = detailContactId;
    setDetailOpen(false);
    setContactFormId(id);
    setContactFormOpen(true);
  };

  const deleteContactFromDetail = () => {
    const c = contacts.find((x) => x._id === detailContactId);
    if (!c) return;
    const linked = devices.filter((d) => d.contactId === c._id).length;
    setConfirm({
      kind: "contact",
      id: c._id,
      title: t("confirmDeleteItem", { name: c.name }),
      text: linked > 0 ? linkedDevicesWarning(linked) : t("confirmCannotUndo"),
    });
  };

  const editDevice = (id) => {
    setDeviceFormId(id);
    setDeviceFormPresetOwner(null);
    setDeviceFormOpen(true);
  };

  const addDeviceForContact = (contactId) => {
    setDetailOpen(false);
    setDeviceFormId(null);
    setDeviceFormPresetOwner(contactId);
    setDeviceFormOpen(true);
  };

  const addWorklistForContact = (contactId) => {
    setDetailOpen(false);
    setWorklistFormId(null);
    setWorklistFormPresetContact(contactId);
    setWorklistFormPresetDevice(null);
    setWorklistFormOpen(true);
  };

  const addWorklistForDevice = (deviceId, contactId) => {
    setWorklistFormId(null);
    setWorklistFormPresetContact(contactId);
    setWorklistFormPresetDevice(deviceId);
    setWorklistFormOpen(true);
  };

  const deleteDeviceFromForm = () => {
    const d = devices.find((x) => x._id === deviceFormId);
    if (!d) return;
    setConfirm({
      kind: "device",
      id: d._id,
      title: t("confirmDeleteItem", { name: d.name }),
      text: t("confirmCannotUndo"),
    });
  };

  const deleteActionFromForm = () => {
    const a = actions.find((x) => x._id === actionFormId);
    if (!a) return;
    setConfirm({
      kind: "action",
      id: a._id,
      title: t("confirmDeleteItem", { name: a.name }),
      text: t("confirmCannotUndo"),
    });
  };

  const deleteWorklistFromForm = () => {
    const e = worklist.find((x) => x._id === worklistFormId);
    if (!e) return;
    setConfirm({
      kind: "worklist",
      id: e._id,
      title: t("confirmDeleteItem", { name: e.actionName }),
      text: t("confirmCannotUndo"),
    });
  };

  const performConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "contact") {
        await deleteContact({ id: confirm.id });
        setDetailOpen(false);
        setContactFormOpen(false);
        toast.show(t("toastContactDeleted"));
      } else if (confirm.kind === "device") {
        await deleteDevice({ id: confirm.id });
        setDeviceFormOpen(false);
        toast.show(t("toastDeviceDeleted"));
      } else if (confirm.kind === "worklist") {
        await deleteWorklistEntry({ id: confirm.id });
        setWorklistFormOpen(false);
        toast.show(t("toastWorklistDeleted"));
      } else {
        await deleteAction({ id: confirm.id });
        setActionFormOpen(false);
        toast.show(t("toastActionDeleted"));
      }
    } catch (err) {
      console.error(err);
      toast.show(t("toastSomethingWentWrong"));
    }
    setConfirm(null);
  };

  /* ---------- render ---------- */

  const darkModeButton = (
    <button
      className="btn btn--text btn--small"
      onClick={() => setDarkMode(d => !d)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );

  const langButton = (
    <button
      className="btn btn--text btn--small"
      style={{ fontWeight: locale === "sk" ? 700 : 400 }}
      onClick={() => setLocale(locale === "en" ? "sk" : "en")}
      aria-label="Toggle language"
    >
      {locale === "en" ? "SK" : "EN"}
    </button>
  );

  const signOutButton = (
    <button className="btn btn--text btn--small" onClick={() => signOut()}>
      {t("headerSignOut")}
    </button>
  );

  return (
    <div className="app">
      {/* ── Sidebar (desktop left) / Bottom bar (mobile) ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">Souls</div>

        <nav className="sidebar__nav" role="tablist">
          <button
            className={`sidebar__item${tab === "home" ? " is-active" : ""}`}
            onClick={() => handleTab("home")}
            role="tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12v9h18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sidebar__label">{t("tabHome")}</span>
          </button>

          <button
            className={`sidebar__item${tab === "contacts" ? " is-active" : ""}`}
            onClick={() => handleTab("contacts")}
            role="tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="sidebar__label">{t("tabContacts")}</span>
            <span className="sidebar__count">{contacts.length}</span>
          </button>

          <button
            className={`sidebar__item${tab === "devices" ? " is-active" : ""}`}
            onClick={() => handleTab("devices")}
            role="tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="sidebar__label">{t("tabDevices")}</span>
            <span className="sidebar__count">{devices.length}</span>
          </button>

          <button
            className={`sidebar__item${tab === "actions" ? " is-active" : ""}`}
            onClick={() => handleTab("actions")}
            role="tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="sidebar__label">{t("tabActions")}</span>
            <span className="sidebar__count">{actions.length}</span>
          </button>

          <button
            className={`sidebar__item${tab === "worklist" ? " is-active" : ""}`}
            onClick={() => handleTab("worklist")}
            role="tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="sidebar__label">{t("tabWorklist")}</span>
            <span className="sidebar__count">{worklist.filter(e => (e.status ?? "pending") !== "done").length}</span>
          </button>
        </nav>

        <div className="sidebar__footer">
          {currentUser?.email && (
            <span className="sidebar__email">{currentUser.email}</span>
          )}
          <div className="sidebar__controls">
            {darkModeButton}
            {langButton}
            {signOutButton}
          </div>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="content">
        {/* Mobile-only compact header */}
        <div className="topbar">
          <span className="topbar__title">Souls</span>
          <button
            className="topbar__settings-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 20c0-3.5 3.13-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {searchScannerOpen && (
          <BarcodeScanner
            onScan={(value) => { setQuery(value); setSearchScannerOpen(false); }}
            onClose={() => setSearchScannerOpen(false)}
          />
        )}

        {tab !== "home" && <div className="toolbar">
          <div className="search">
            <svg className="search__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="search__input"
              type="search"
              placeholder={
                tab === "contacts" ? t("searchContacts") :
                tab === "devices" ? t("searchDevices") :
                tab === "worklist" ? t("searchWorklist") :
                t("searchActions")
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {tab === "devices" && devices.length > 0 && (
              <button
                type="button"
                className="search__action"
                onClick={() => setSearchScannerOpen(true)}
                title={t("searchByBarcode")}
                aria-label={t("searchByBarcode")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="2" height="16" fill="currentColor" />
                  <rect x="6" y="4" width="1" height="16" fill="currentColor" />
                  <rect x="9" y="4" width="2" height="16" fill="currentColor" />
                  <rect x="13" y="4" width="1" height="16" fill="currentColor" />
                  <rect x="16" y="4" width="3" height="16" fill="currentColor" />
                  <rect x="21" y="4" width="1" height="16" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
          {tab === "contacts" && <ContactImport existingContacts={contacts} />}
          <button className="btn btn--primary" onClick={handleAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="btn__label">
              {tab === "contacts" ? t("addContact") :
               tab === "devices" ? t("addDevice") :
               tab === "worklist" ? t("addWorklist") :
               t("addAction")}
            </span>
          </button>
        </div>}

        <main className="main">
          {tab === "home" && (
            <Dashboard
              worklist={worklist}
              contacts={contacts}
              devices={devices}
              actions={actions}
              onNavigate={handleTab}
              onOpenEntry={(id) => { setWorklistFormId(id); setWorklistFormPresetContact(null); setWorklistFormPresetDevice(null); setWorklistFormOpen(true); }}
            />
          )}
          {tab === "contacts" && <ContactList contacts={contacts} query={query} onOpen={openContact} />}
          {tab === "devices" && <DeviceList devices={devices} query={query} onOpen={editDevice} />}
          {tab === "actions" && (
            <ActionList
              actions={actions}
              query={query}
              onOpen={(id) => { setActionFormId(id); setActionFormPresetDevice(null); setActionFormOpen(true); }}
            />
          )}
          {tab === "worklist" && (
            <WorklistList
              worklist={worklist}
              query={query}
              onOpen={(id) => { setWorklistFormId(id); setWorklistFormPresetContact(null); setWorklistFormPresetDevice(null); setWorklistFormOpen(true); }}
            />
          )}
        </main>
      </div>

      {/* ── Dialogs ── */}
      <ContactForm
        open={contactFormOpen}
        contactId={contactFormId}
        contacts={contacts}
        onClose={() => setContactFormOpen(false)}
        onDelete={() => {
          const c = contacts.find((x) => x._id === contactFormId);
          if (c) {
            const linked = devices.filter((d) => d.contactId === c._id).length;
            setConfirm({
              kind: "contact",
              id: c._id,
              title: t("confirmDeleteItem", { name: c.name }),
              text: linked > 0 ? linkedDevicesWarning(linked) : t("confirmCannotUndo"),
            });
          }
        }}
      />

      <ContactDetail
        open={detailOpen}
        contactId={detailContactId}
        contacts={contacts}
        devices={devices}
        onClose={() => setDetailOpen(false)}
        onEdit={editContactFromDetail}
        onDelete={deleteContactFromDetail}
        onAddDevice={addDeviceForContact}
        onAddWorklist={addWorklistForContact}
        onOpenDevice={(id) => {
          setDetailOpen(false);
          editDevice(id);
        }}
      />

      <DeviceForm
        open={deviceFormOpen}
        deviceId={deviceFormId}
        presetOwnerId={deviceFormPresetOwner}
        devices={devices}
        contacts={contacts}
        onClose={() => setDeviceFormOpen(false)}
        onDelete={deleteDeviceFromForm}
        onAddWorklist={addWorklistForDevice}
      />

      <ActionForm
        open={actionFormOpen}
        actionId={actionFormId}
        presetDeviceId={actionFormPresetDevice}
        devices={devices}
        onClose={() => setActionFormOpen(false)}
        onDelete={deleteActionFromForm}
      />

      <WorklistForm
        open={worklistFormOpen}
        entryId={worklistFormId}
        worklist={worklist}
        contacts={contacts}
        devices={devices}
        actions={actions}
        presetContactId={worklistFormPresetContact}
        presetDeviceId={worklistFormPresetDevice}
        onClose={() => setWorklistFormOpen(false)}
        onDelete={deleteWorklistFromForm}
        onPrint={() => { setWorklistFormOpen(false); setReportEntryId(worklistFormId); }}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        text={confirm?.text}
        onConfirm={performConfirm}
        onCancel={() => setConfirm(null)}
      />

      <SettingsPanel
        open={settingsOpen}
        email={currentUser?.email}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onSignOut={() => { signOut(); setSettingsOpen(false); }}
        onClose={() => setSettingsOpen(false)}
      />

      {(() => {
        const entry = reportEntryId ? worklist.find(e => e._id === reportEntryId) : null;
        const contact = entry ? contacts.find(c => c._id === entry.contactId) : null;
        const device = entry ? devices.find(d => d._id === entry.deviceId) : null;
        const action = entry ? actions.find(a => a._id === entry.actionId) : null;
        return (
          <WorklistReport
            open={!!reportEntryId}
            entry={entry}
            contact={contact}
            device={device}
            action={action}
            onClose={() => setReportEntryId(null)}
          />
        );
      })()}
    </div>
  );
}
