"use client";

import { useState } from "react";

type Device = {
  id: string;
  serialNumber: string;
  barcode: string | null;
  name: string | null;
  updatedAt: string;
};

export function DeviceSearch() {
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
      setError("Could not load devices.");
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
          placeholder="Search by serial number or barcode"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
        />
        <button className="button" type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <div className="results">
        {devices.length === 0 ? (
          <p className="subtitle">No devices found yet.</p>
        ) : (
          devices.map((device) => (
            <div className="result-item" key={device.id}>
              <strong>{device.serialNumber}</strong>
              {device.barcode ? <span>Barcode: {device.barcode}</span> : null}
              {device.name ? <span>Name: {device.name}</span> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
