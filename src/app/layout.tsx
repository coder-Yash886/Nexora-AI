import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {NuqsAdapter} from "nuqs/adapters/next"
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora AI",
  description: "AI-powered video meetings with custom agents, transcripts, and summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
    <TRPCProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Toaster />
          {children}
        </body>
      </html>
    </TRPCProvider>
    </NuqsAdapter>
  );
}