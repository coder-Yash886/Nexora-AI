import { LandingPage } from "@/modules/landing/ui/views/landing-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/meetings");
  }

  return <LandingPage />;
}
