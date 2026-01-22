"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language-provider";

type Device = {
  id: string;
  serialNumber: string;
  barcode: string | null;
  name: string | null;
  updatedAt: string;
};

export function DeviceSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch(`/api/devices?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      setError(t("errorLoadDevices"));
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as { devices: Device[] };
    setDevices(data.devices ?? []);
    setIsLoading(false);
  };

  return (
    <div className="stack">
      <form className="row" onSubmit={onSearch}>
        <input
          className="input"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
        />
        <button className="button" type="submit" disabled={isLoading}>
          {isLoading ? t("searching") : t("search")}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <div className="results">
        {devices.length === 0 ? (
          <p className="subtitle">{t("noDevices")}</p>
        ) : (
          devices.map((device) => (
            <div className="result-item" key={device.id}>
              <strong>{device.serialNumber}</strong>
              {device.barcode ? (
                <span>
                  {t("barcode")}: {device.barcode}
                </span>
              ) : null}
              {device.name ? (
                <span>
                  {t("name")}: {device.name}
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
