"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  Menu,
  Play,
  Sparkles,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_VIDEO_SRC } from "@/constants";

const navLinks = [
  { href: "#demo", label: "Demo" },
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
];

const features = [
  {
    icon: Bot,
    title: "Custom AI Agents",
    description:
      "Create interview coaches, tutors, or sales assistants with instructions tailored to your workflow.",
  },
  {
    icon: Video,
    title: "HD Video Meetings",
    description:
      "Crystal-clear calls powered by Stream with live transcription and recording built in.",
  },
  {
    icon: Sparkles,
    title: "In-Call AI Assistant",
    description:
      "Ask questions by voice or text during meetings and get context-aware Gemini responses in seconds.",
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description:
      "Automatic markdown summaries, full transcripts, and AI chat over past meetings after every call.",
  },
];

const galleryImages = [
  { src: "/feature/sign-in.png", alt: "Sign in to Nexora AI", label: "Sign In" },
  { src: "/feature/meetings-dashboard.png", alt: "Meetings dashboard", label: "Meetings" },
  { src: "/feature/agents-page.png", alt: "Create AI agents", label: "Agents" },
  { src: "/feature/agent-call.png", alt: "Live AI agent call", label: "Live Call" },
  { src: "/feature/meeting-summary.png", alt: "Meeting summary", label: "Summary" },
  { src: "/feature/ask-ai.png", alt: "Ask AI about meetings", label: "Ask AI" },
];

const steps = [
  {
    step: "01",
    title: "Create an agent",
    description: "Define personality, goals, and instructions for your AI teammate.",
  },
  {
    step: "02",
    title: "Start a meeting",
    description: "Invite participants and let your agent join the live video room.",
  },
  {
    step: "03",
    title: "Review insights",
    description: "Replay recordings, read transcripts, and query AI about what was discussed.",
  },
];

function useInView(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, visible };
}

function FeatureGallery() {
  const slides = [...galleryImages, ...galleryImages];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent sm:w-24" />
      <div className="flex w-max animate-[landing-marquee_40s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
        {slides.map((item, index) => (
          <figure
            key={`${item.src}-${index}`}
            className="group w-[260px] shrink-0 sm:w-[300px] md:w-[340px]"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src={item.src}
                alt={item.alt}
                width={680}
                height={420}
                className="h-auto w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              {item.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hero = useInView();
  const demoSection = useInView();
  const featuresSection = useInView();
  const showcase = useInView();
  const stepsSection = useInView();

  const playDemo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.scrollIntoView({ behavior: "smooth", block: "center" });
    void video.play();
    setVideoPlaying(true);
  };

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#fafbfc] text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-[pulse_8s_ease-in-out_infinite] absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-[pulse_10s_ease-in-out_infinite_1s] absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="animate-[pulse_12s_ease-in-out_infinite_2s] absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(22,163,74,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,163,74,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Nexora AI" width={32} height={32} />
            <span className="text-lg font-semibold tracking-tight">Nexora AI</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-black/5 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div
            ref={hero.ref}
            className={cn(
              "mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16",
              "transition-all duration-1000",
              hero.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="size-4" />
                AI-powered video meetings
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Meet smarter with{" "}
                  <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    custom AI agents
                  </span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Nexora AI combines HD video calls, live AI assistance, and automatic
                  summaries so your team stays focused on the conversation—not the notes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/sign-up">
                    Start for free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  onClick={playDemo}
                >
                  Watch demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span>Custom AI agents</span>
                <span>Live transcription</span>
                <span>Instant summaries</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative animate-[landing-float_6s_ease-in-out_infinite] rounded-2xl border border-black/5 bg-white p-3 shadow-2xl shadow-primary/10">
                <Image
                  src="/feature/meetings-dashboard.png"
                  alt="Nexora AI meetings dashboard"
                  width={960}
                  height={600}
                  className="rounded-xl"
                  priority
                />
              </div>
              <div className="absolute -bottom-8 -left-4 hidden w-48 animate-[landing-float_7s_ease-in-out_infinite_1s] rounded-xl border border-black/5 bg-white p-2 shadow-xl sm:block">
                <Image
                  src="/feature/agent-call.png"
                  alt="AI agent in call"
                  width={320}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="px-4 py-20 sm:px-6">
          <div
            ref={demoSection.ref}
            className={cn(
              "mx-auto max-w-6xl transition-all duration-1000",
              demoSection.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <h2 className="text-center text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
              See How Nexora AI Transforms Your Meetings
            </h2>

            <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-[#d9d9d9] shadow-2xl">
              <video
                ref={videoRef}
                className="aspect-video w-full bg-black object-cover"
                controls
                playsInline
                preload="metadata"
                poster="/feature/meetings-dashboard.png"
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
              >
                <source src={DEMO_VIDEO_SRC} type="video/mp4" />
              </video>

              {!videoPlaying && (
                <button
                  type="button"
                  onClick={playDemo}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 text-white transition-colors hover:bg-black/30"
                  aria-label="Play demo video"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Play className="size-7 fill-white text-white" />
                  </span>
                  <span className="text-sm font-medium sm:text-base">
                    Click &quot;Watch Demo&quot; to play video
                  </span>
                </button>
              )}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Take a quick tour of how teams connect, collaborate, and create with custom
                AI agents inside Nexora AI.
              </p>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <Button size="lg" className="h-12 px-8" onClick={playDemo}>
                  <Play className="size-4 fill-current" />
                  Watch Demo
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6">
          <div
            ref={featuresSection.ref}
            className={cn(
              "mx-auto max-w-6xl transition-all duration-1000",
              featuresSection.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need for intelligent meetings
              </h2>
              <p className="mt-4 text-muted-foreground">
                From agent creation to post-call intelligence, Nexora AI keeps your workflow
                in one place.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="showcase" className="bg-[#0a0a0a] py-20">
          <div
            ref={showcase.ref}
            className={cn(
              "transition-all duration-1000",
              showcase.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/40">
                Product Gallery
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Explore every part of Nexora AI
              </h2>
              <p className="mt-3 max-w-2xl text-white/55">
                Sign in, manage meetings, create agents, join live calls, and review AI
                summaries—all in one platform.
              </p>
            </div>

            <FeatureGallery />
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 sm:px-6">
          <div
            ref={stepsSection.ref}
            className={cn(
              "mx-auto max-w-6xl transition-all duration-1000",
              stepsSection.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground">
                Go from setup to insights in three simple steps.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm"
                >
                  <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-600 px-8 py-14 text-center text-white shadow-2xl shadow-primary/25 sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your meetings?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">
              Join Nexora AI and bring custom agents, HD video, and AI summaries into every
              conversation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 bg-white px-8 text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/sign-up">Get started free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Nexora AI" width={24} height={24} />
            <span className="text-sm font-medium">Nexora AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered video meetings with custom agents, transcripts, and summaries.
          </p>
        </div>
      </footer>
    </div>
  );
}
