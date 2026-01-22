import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { DeviceSearch } from "@/components/device-search";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="card stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack">
          <h1 className="title">Device Lookup</h1>
          <p className="subtitle">
            Search by serial number or barcode. Signed in as {session.user?.email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <DeviceSearch />
    </main>
  );
}
