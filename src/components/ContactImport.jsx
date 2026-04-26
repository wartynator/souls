import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Dialog from "./Dialog.jsx";
import { useToast } from "./Toast.jsx";
import { useLocale } from "../i18n.jsx";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles quoted fields (commas and newlines inside quotes).

function parseCSV(text) {
  const rows = [];
  let field = "";
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ""; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(field); field = "";
        rows.push(row); row = [];
      } else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── Google CSV column mapper ──────────────────────────────────────────────────

function mapGoogleCSV(rows) {
  if (rows.length < 2) return [];
  // Strip BOM and normalize headers to lowercase for matching
  const headers = rows[0].map((h) => h.trim().replace(/^﻿/, ""));
  const normalizedHeaders = headers.map((h) => h.toLowerCase());

  // Exact lowercase match
  const col = (names) => normalizedHeaders.findIndex((h) => names.includes(h));
  // Regex match returning all matching column indices (for multi-value fields like phones)
  const cols = (regexes) =>
    normalizedHeaders
      .map((h, idx) => ({ h, idx }))
      .filter(({ h }) => regexes.some((re) => re.test(h)))
      .map(({ idx }) => idx);

  const firstNameIdx  = col(["first name", "given name"]);
  const middleNameIdx = col(["middle name", "additional name"]);
  const lastNameIdx   = col(["last name", "family name", "surname"]);
  const fullNameIdx   = col(["name"]);
  const notesIdx      = col(["notes"]);
  const cityIdx       = col(["address 1 - city", "city"]);
  // Prefer formatted address; fall back to street
  const addressIdx    = col(["address 1 - formatted", "address 1 - street", "address", "street"]);

  const phoneIdxs = cols([/^phone \d+ - value$/, /^phone$/, /^mobile$/]);
  const emailIdxs = cols([/^email \d+ - value$/, /^e-mail \d+ - value$/, /^email$/, /^e-mail$/]);

  const firstValue = (idxs, r) => {
    for (const idx of idxs) {
      const value = r[idx]?.trim();
      if (value) return value;
    }
    return undefined;
  };

  const contacts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length || r.every((c) => !c.trim())) continue;

    const firstName  = firstNameIdx  >= 0 ? r[firstNameIdx]?.trim()  || "" : "";
    const middleName = middleNameIdx >= 0 ? r[middleNameIdx]?.trim() || "" : "";
    const lastName   = lastNameIdx   >= 0 ? r[lastNameIdx]?.trim()   || "" : "";
    const fullName   = fullNameIdx   >= 0 ? r[fullNameIdx]?.trim()   || "" : "";

    const composedName = [firstName, middleName].filter(Boolean).join(" ").trim();
    const name = composedName || firstName || fullName || (lastName ? lastName : "");
    if (!name) continue;

    contacts.push({
      name,
      surname: lastName   || undefined,
      address: addressIdx >= 0 ? r[addressIdx]?.trim() || undefined : undefined,
      city:    cityIdx    >= 0 ? r[cityIdx]?.trim()    || undefined : undefined,
      phone:   firstValue(phoneIdxs, r),
      email:   firstValue(emailIdxs, r),
      notes:   notesIdx   >= 0 ? r[notesIdx]?.trim()   || undefined : undefined,
    });
  }
  return contacts;
}

// ── Google People API mapper ──────────────────────────────────────────────────

function mapPeopleAPI(connections) {
  const contacts = [];
  for (const person of connections) {
    const nameObj   = person.names?.[0];
    const givenName = nameObj?.givenName?.trim() || "";
    const familyName = nameObj?.familyName?.trim() || "";
    const displayName = nameObj?.displayName?.trim() || "";

    const name = givenName || displayName;
    if (!name) continue;

    const addressObj = person.addresses?.[0];

    contacts.push({
      name,
      surname: familyName || undefined,
      phone:   person.phoneNumbers?.[0]?.value?.trim() || undefined,
      email:   person.emailAddresses?.[0]?.value?.trim() || undefined,
      address: addressObj?.formattedValue?.trim() || addressObj?.streetAddress?.trim() || undefined,
      city:    addressObj?.city?.trim() || undefined,
      notes:   person.biographies?.[0]?.value?.trim() || undefined,
    });
  }
  return contacts;
}

// ── Google Identity Services loader ──────────────────────────────────────────

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

// ── Fetch all connections from People API (paginated) ─────────────────────────

async function fetchAllConnections(accessToken) {
  const personFields = "names,phoneNumbers,emailAddresses,addresses,biographies";
  let connections = [];
  let pageToken = "";

  do {
    const url = new URL("https://people.googleapis.com/v1/people/me/connections");
    url.searchParams.set("personFields", personFields);
    url.searchParams.set("pageSize", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`People API ${res.status}`);

    const data = await res.json();
    connections = connections.concat(data.connections || []);
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return connections;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactImport({ onDone }) {
  const { t } = useLocale();
  const toast = useToast();
  const fileRef = useRef(null);
  const bulkCreate = useMutation(api.contacts.bulkCreate);

  const [preview, setPreview] = useState(null); // null | { contacts }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        const contacts = mapGoogleCSV(rows);
        if (contacts.length === 0) {
          setError(t("importNoContacts"));
          return;
        }
        setPreview({ contacts });
      } catch {
        setError(t("importInvalidFile"));
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleGoogleImport = async () => {
    if (googleLoading) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("VITE_GOOGLE_CLIENT_ID is not configured.");
      return;
    }

    setGoogleLoading(true);
    try {
      await loadGIS();

      const accessToken = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/contacts.readonly",
          callback: (response) => {
            if (response.error) reject(new Error(response.error));
            else resolve(response.access_token);
          },
          error_callback: (err) => reject(new Error(err.type)),
        });
        client.requestAccessToken();
      });

      const connections = await fetchAllConnections(accessToken);
      const contacts = mapPeopleAPI(connections);

      if (contacts.length === 0) {
        setError(t("importNoContacts"));
        return;
      }
      setPreview({ contacts });
    } catch (err) {
      console.error("Google import error:", err);
      setError(t("importGoogleError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await bulkCreate({ contacts: preview.contacts });
      toast.show(t("importSuccess", { n: preview.contacts.length }));
      setPreview(null);
      onDone?.();
    } catch {
      toast.show(t("toastSomethingWentWrong"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Hidden CSV file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {/* Combined import button + dropdown */}
      <div className="import-menu" ref={menuRef}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setMenuOpen((o) => !o)}
          title={t("importContacts")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10l5-5 5 5M12 5v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="btn__label">{t("importContacts")}</span>
        </button>

        {menuOpen && (
          <div className="import-menu__dropdown">
            {/* Google Contacts */}
            <button
              type="button"
              className="import-menu__item"
              disabled={googleLoading}
              onClick={() => { setMenuOpen(false); handleGoogleImport(); }}
            >
              {googleLoading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeDasharray="28 56" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? t("importGoogleLoading") : t("importFromGoogle")}
            </button>

            {/* CSV */}
            <button
              type="button"
              className="import-menu__item"
              onClick={() => { setMenuOpen(false); fileRef.current?.click(); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 10l5-5 5 5M12 5v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("importContacts")}
            </button>
          </div>
        )}
      </div>

      {/* Error dialog */}
      {error && (
        <Dialog open onClose={() => setError(null)} size="small">
          <div className="dialog__form">
            <header className="dialog__head">
              <h2 className="dialog__title">{t("importContacts")}</h2>
              <button type="button" className="dialog__close" onClick={() => setError(null)} aria-label="Close">×</button>
            </header>
            <div className="dialog__body">
              <p className="confirm__text">{error}</p>
            </div>
            <footer className="dialog__foot">
              <div style={{ marginLeft: "auto" }}>
                <button type="button" className="btn btn--primary" onClick={() => setError(null)}>{t("btnClose")}</button>
              </div>
            </footer>
          </div>
        </Dialog>
      )}

      {/* Preview dialog */}
      {preview && (
        <Dialog open onClose={() => setPreview(null)}>
          <div className="dialog__form">
            <header className="dialog__head">
              <h2 className="dialog__title">{t("importDialogTitle")}</h2>
              <button type="button" className="dialog__close" onClick={() => setPreview(null)} aria-label="Close">×</button>
            </header>
            <div className="dialog__body">
              <p className="import__count">
                {t("importPreviewCount", { n: preview.contacts.length })}
              </p>
              <div className="import__list">
                {preview.contacts.map((c, i) => (
                  <div key={i} className="import__row">
                    <p className="import__name">{[c.name, c.surname].filter(Boolean).join(" ")}</p>
                    {(c.phone || c.email) && (
                      <p className="import__meta">
                        {[c.phone, c.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {(c.address || c.city) && (
                      <p className="import__meta">
                        {[c.address, c.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <footer className="dialog__foot">
              <span />
              <div className="dialog__foot-end">
                <button
                  type="button"
                  className="dialog__action-btn"
                  onClick={() => setPreview(null)}
                  aria-label={t("btnCancel")}
                  title={t("btnCancel")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="dialog__action-btn dialog__action-btn--confirm"
                  onClick={handleImport}
                  disabled={saving}
                  aria-label={t("importBtn", { n: preview.contacts.length })}
                  title={t("importBtn", { n: preview.contacts.length })}
                >
                  {saving ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeDasharray="28 56" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </footer>
          </div>
        </Dialog>
      )}
    </>
  );
}
