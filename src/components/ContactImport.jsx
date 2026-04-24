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
  const headers = rows[0].map((h) => h.trim());

  const col = (patterns) => {
    for (const p of patterns) {
      const idx = headers.findIndex((h) => h.toLowerCase().includes(p.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx  = col(["Name"]);
  const phoneIdx = col(["Phone 1 - Value", "Phone", "Mobile"]);
  const emailIdx = col(["E-mail 1 - Value", "Email 1 - Value", "Email"]);
  const notesIdx = col(["Notes"]);

  const contacts = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length || r.every((c) => !c.trim())) continue;
    const name = nameIdx >= 0 ? r[nameIdx]?.trim() : "";
    if (!name) continue;
    contacts.push({
      name,
      phone: phoneIdx >= 0 ? r[phoneIdx]?.trim() || undefined : undefined,
      email: emailIdx >= 0 ? r[emailIdx]?.trim() || undefined : undefined,
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
        {t("importContacts")}
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
