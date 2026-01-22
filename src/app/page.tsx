import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HomeClient } from "@/components/home-client";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <HomeClient email={session.user?.email ?? ""} />;
}
