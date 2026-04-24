import { useState } from "react";
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

  const [tab, setTab] = useState("contacts"); // "contacts" | "devices" | "actions" | "worklist"
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
    setDeviceFormOpen(false);
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
      title: t("confirmDeleteItem", { name: e.actionType }),
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

  return (
    <div className="app">
      <div className="app__top">
      <header className="header">
        <div className="header__top">
          <h1 className="header__title">Souls</h1>
          <div className="header__user">
            {currentUser?.email && (
              <span className="header__email">{currentUser.email}</span>
            )}
            <button
              className={`btn btn--text${locale === "sk" ? " is-active" : ""}`}
              style={{ fontWeight: locale === "sk" ? 700 : 400 }}
              onClick={() => setLocale(locale === "en" ? "sk" : "en")}
              aria-label="Toggle language"
            >
              {locale === "en" ? "SK" : "EN"}
            </button>
            <button className="btn btn--text" onClick={() => signOut()}>
              {t("headerSignOut")}
            </button>
          </div>
        </div>
        <nav className="tabs" role="tablist">
          <button
            className={`tab${tab === "contacts" ? " is-active" : ""}`}
            onClick={() => handleTab("contacts")}
            role="tab"
          >
            {t("tabContacts")} <span className="tab__count">{contacts.length}</span>
          </button>
          <button
            className={`tab${tab === "devices" ? " is-active" : ""}`}
            onClick={() => handleTab("devices")}
            role="tab"
          >
            {t("tabDevices")} <span className="tab__count">{devices.length}</span>
          </button>
          <button
            className={`tab${tab === "actions" ? " is-active" : ""}`}
            onClick={() => handleTab("actions")}
            role="tab"
          >
            {t("tabActions")} <span className="tab__count">{actions.length}</span>
          </button>
          <button
            className={`tab${tab === "worklist" ? " is-active" : ""}`}
            onClick={() => handleTab("worklist")}
            role="tab"
          >
            {t("tabWorklist")} <span className="tab__count">{worklist.length}</span>
          </button>
        </nav>
      </header>

      {searchScannerOpen && (
        <BarcodeScanner
          onScan={(value) => { setQuery(value); setSearchScannerOpen(false); }}
          onClose={() => setSearchScannerOpen(false)}
        />
      )}
      <div className="toolbar">
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
        {tab === "contacts" && <ContactImport />}
        <button className="btn btn--primary" onClick={handleAdd}>
          <span aria-hidden="true">+</span>
          <span>
            {tab === "contacts" ? t("addContact") :
             tab === "devices" ? t("addDevice") :
             tab === "worklist" ? t("addWorklist") :
             t("addAction")}
          </span>
        </button>
      </div>
      </div>{/* end app__top */}

      <main className="main">
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

      {/* Dialogs */}
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
        presetContactId={worklistFormPresetContact}
        presetDeviceId={worklistFormPresetDevice}
        onClose={() => setWorklistFormOpen(false)}
        onDelete={deleteWorklistFromForm}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        text={confirm?.text}
        onConfirm={performConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
