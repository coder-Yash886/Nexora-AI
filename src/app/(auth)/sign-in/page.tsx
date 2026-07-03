import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // User already logged in hai
  if (session) {
    redirect("/meetings");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignInView />
      </div>
    </div>
  );
};

export default Page;
