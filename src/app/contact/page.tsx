import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ContactSection } from "@/modules/landing/ui/components/contact-section";

export default async function ContactPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackURL=/contact");
  }

  return (
    <div className="min-h-svh bg-[#fafbfc]">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Nexora AI" width={32} height={32} />
            <span className="text-lg font-semibold tracking-tight">Nexora AI</span>
          </Link>
          <Link
            href="/meetings"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <ContactSection />
    </div>
  );
}
