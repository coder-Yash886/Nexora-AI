import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface Props {
  searchParams: Promise<{ callbackURL?: string }>;
}

const Page = async ({ searchParams }: Props) => {
  const { callbackURL } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(callbackURL ?? "/meetings");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignInView callbackURL={callbackURL ?? "/meetings"} />
      </div>
    </div>
  );
};

export default Page;
