import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import ContactList from "./ContactList.jsx";
import DeviceList from "./DeviceList.jsx";
import ContactForm from "./ContactForm.jsx";
import ContactDetail from "./ContactDetail.jsx";
import DeviceForm from "./DeviceForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { useToast } from "./Toast.jsx";
import { useMutation } from "convex/react";

export default function Souls() {
  const { signOut } = useAuthActions();
  const toast = useToast();

  const contacts = useQuery(api.contacts.list) ?? [];
  const devices = useQuery(api.devices.list) ?? [];
  const currentUser = useQuery(api.users.currentUser);

  const deleteContact = useMutation(api.contacts.remove);
  const deleteDevice = useMutation(api.devices.remove);

  const [tab, setTab] = useState("contacts"); // "contacts" | "devices"
  const [query, setQuery] = useState("");

  // Dialog state
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactFormId, setContactFormId] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState(null);

  const [deviceFormOpen, setDeviceFormOpen] = useState(false);
  const [deviceFormId, setDeviceFormId] = useState(null);
  const [deviceFormPresetOwner, setDeviceFormPresetOwner] = useState(null);

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
    } else {
      if (contacts.length === 0) {
        toast.show("Add a contact first");
        setTab("contacts");
        return;
      }
      setDeviceFormId(null);
      setDeviceFormPresetOwner(null);
      setDeviceFormOpen(true);
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
      title: `Delete ${c.name}?`,
      text:
        linked > 0
          ? `This will also remove ${linked} linked ${linked === 1 ? "device" : "devices"}. This cannot be undone.`
          : "This cannot be undone.",
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

  const deleteDeviceFromForm = () => {
    const d = devices.find((x) => x._id === deviceFormId);
    if (!d) return;
    setConfirm({
      kind: "device",
      id: d._id,
      title: `Delete ${d.name}?`,
      text: "This cannot be undone.",
    });
  };

  const performConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "contact") {
        await deleteContact({ id: confirm.id });
        setDetailOpen(false);
        setContactFormOpen(false);
        toast.show("Contact deleted");
      } else {
        await deleteDevice({ id: confirm.id });
        setDeviceFormOpen(false);
        toast.show("Device deleted");
      }
    } catch (err) {
      console.error(err);
      toast.show("Something went wrong");
    }
    setConfirm(null);
  };

  /* ---------- render ---------- */

  return (
    <div className="app">
      <header className="header">
        <div className="header__top">
          <h1 className="header__title">Souls</h1>
          <div className="header__user">
            {currentUser?.email && (
              <span className="header__email">{currentUser.email}</span>
            )}
            <button className="btn btn--text" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </div>
        <nav className="tabs" role="tablist">
          <button
            className={`tab${tab === "contacts" ? " is-active" : ""}`}
            onClick={() => handleTab("contacts")}
            role="tab"
          >
            Contacts <span className="tab__count">{contacts.length}</span>
          </button>
          <button
            className={`tab${tab === "devices" ? " is-active" : ""}`}
            onClick={() => handleTab("devices")}
            role="tab"
          >
            Devices <span className="tab__count">{devices.length}</span>
          </button>
        </nav>
      </header>

      <div className="toolbar">
        <div className="search">
          <svg className="search__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="search__input"
            type="search"
            placeholder={tab === "contacts" ? "Search contacts" : "Search devices"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--primary" onClick={handleAdd}>
          <span aria-hidden="true">+</span>
          <span>{tab === "contacts" ? "Add contact" : "Add device"}</span>
        </button>
      </div>

      <main className="main">
        {tab === "contacts" ? (
          <ContactList contacts={contacts} query={query} onOpen={openContact} />
        ) : (
          <DeviceList devices={devices} query={query} onOpen={editDevice} />
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
              title: `Delete ${c.name}?`,
              text:
                linked > 0
                  ? `This will also remove ${linked} linked ${linked === 1 ? "device" : "devices"}. This cannot be undone.`
                  : "This cannot be undone.",
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
