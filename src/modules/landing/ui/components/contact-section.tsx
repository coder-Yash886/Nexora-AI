"use client";

import Link from "next/link";
import { useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const socialItems = [
  {
    label: "GitHub",
    href: SOCIAL_LINKS.github,
    icon: FaGithub,
  },
  {
    label: "LinkedIn",
    href: SOCIAL_LINKS.linkedin,
    icon: FaLinkedinIn,
  },
  {
    label: "X (Twitter)",
    href: SOCIAL_LINKS.twitter,
    icon: FaXTwitter,
  },
  {
    label: "Email",
    href: `mailto:${CONTACT_EMAIL}`,
    icon: Mail,
  },
] as const;

interface ContactSectionProps {
  className?: string;
}

export function ContactSection({ className }: ContactSectionProps) {
  const { data: session, isPending } = authClient.useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!session?.user) return;

    if (!message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }

    const mailSubject = subject.trim() || "Message from Nexora AI user";
    const body = [
      `Name: ${session.user.name ?? "Nexora AI user"}`,
      `Email: ${session.user.email ?? "Not provided"}`,
      "",
      message.trim(),
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app to send the message.");
  };

  return (
    <section id="contact" className={cn("px-4 py-20 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Get in touch with us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions, feedback, or collaboration — we&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold">Connect with Yash Kumar</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Follow on social media or email directly. Signed-up users can also send a
              message from the form.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.label === "Email" ? undefined : "_blank"}
                  rel={item.label === "Email" ? undefined : "noopener noreferrer"}
                  className="flex flex-col items-center gap-2 rounded-xl border border-black/5 bg-muted/30 px-4 py-5 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <item.icon className="size-5" />
                  {item.label}
                </a>
              ))}
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-4" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold">Send a message</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign up on Nexora AI first, then you can send us a message anytime.
            </p>

            {isPending ? (
              <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted/40" />
            ) : session?.user ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm">
                  Signed in as{" "}
                  <span className="font-medium text-foreground">
                    {session.user.name ?? session.user.email}
                  </span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="contact-subject"
                    placeholder="What's this about?"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    placeholder="Write your message here..."
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>

                <Button className="w-full sm:w-auto" onClick={handleSend}>
                  <Send className="size-4" />
                  Send message
                </Button>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-black/10 bg-muted/20 px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Create a free account to send us a message after signup.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/sign-up?callbackURL=/contact">Sign up to message</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/sign-in?callbackURL=/contact">Sign in</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
