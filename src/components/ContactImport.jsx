import { useRef, useState } from "react";
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
  const headers = rows[0].map((h) => h.trim().replace(/^\uFEFF/, ""));
  const normalizedHeaders = headers.map((h) => h.toLowerCase());

  const col = (names) => normalizedHeaders.findIndex((h) => names.includes(h));
  const cols = (regexes) =>
    normalizedHeaders
      .map((h, idx) => ({ h, idx }))
      .filter(({ h }) => regexes.some((re) => re.test(h)))
      .map(({ idx }) => idx);

  const firstNameIdx = col(["first name", "given name"]);
  const middleNameIdx = col(["middle name", "additional name"]);
  const lastNameIdx = col(["last name", "family name", "surname"]);
  const fullNameIdx = col(["name"]);
  const notesIdx = col(["notes"]);
  const cityIdx = col(["address 1 - city", "city"]);
  const streetIdx = col(["address 1 - street", "address", "street"]);

  const phoneIdxs = cols([/^phone \d+ - value$/, /^phone$/]);
  const emailIdxs = cols([/^email \d+ - value$/, /^e-mail \d+ - value$/, /^email$/, /^e-mail$/]);

  const contacts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length || r.every((c) => !c.trim())) continue;

    const firstName = firstNameIdx >= 0 ? r[firstNameIdx]?.trim() || "" : "";
    const middleName = middleNameIdx >= 0 ? r[middleNameIdx]?.trim() || "" : "";
    const lastName = lastNameIdx >= 0 ? r[lastNameIdx]?.trim() || "" : "";
    const fullName = fullNameIdx >= 0 ? r[fullNameIdx]?.trim() || "" : "";

    const composedName = [firstName, middleName].filter(Boolean).join(" ").trim();
    const name = composedName || firstName || fullName || (lastName ? `${lastName}` : "");
    if (!name) continue;

    const firstValue = (idxs) => {
      for (const idx of idxs) {
        const value = r[idx]?.trim();
        if (value) return value;
      }
      return undefined;
    };

    contacts.push({
      name,
      surname: lastName || undefined,
      address: streetIdx >= 0 ? r[streetIdx]?.trim() || undefined : undefined,
      city: cityIdx >= 0 ? r[cityIdx]?.trim() || undefined : undefined,
      phone: firstValue(phoneIdxs),
      email: firstValue(emailIdxs),
      notes: notesIdx >= 0 ? r[notesIdx]?.trim() || undefined : undefined,
    });
  }
  return contacts;
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
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {/* Trigger button — rendered by parent via onTrigger or click forwarded */}
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => fileRef.current?.click()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 10l5-5 5 5M12 5v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="btn__label">{t("importContacts")}</span>
      </button>

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
                    <p className="import__name">{c.name}</p>
                    {(c.phone || c.email) && (
                      <p className="import__meta">
                        {[c.phone, c.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <footer className="dialog__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setPreview(null)}>{t("btnCancel")}</button>
              <button type="button" className="btn btn--primary" onClick={handleImport} disabled={saving}>
                {saving ? t("btnSaving") : t("importBtn", { n: preview.contacts.length })}
              </button>
            </footer>
          </div>
        </Dialog>
      )}
    </>
  );
}
