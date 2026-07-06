import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { account, user } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ hint: null });
    }

    const [foundUser] = await db
      .select()
      .from(user)
      .where(sql`lower(${user.email}) = ${email}`);

    if (!foundUser) {
      return NextResponse.json({ hint: "no_account" });
    }

    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, foundUser.id));

    const hasCredential = accounts.some((a) => a.providerId === "credential");
    const oauthProviders = accounts
      .filter((a) => a.providerId === "google" || a.providerId === "github")
      .map((a) => a.providerId);

    if (!hasCredential && oauthProviders.length > 0) {
      return NextResponse.json({ hint: "oauth_only", providers: oauthProviders });
    }

    if (!hasCredential) {
      return NextResponse.json({ hint: "no_password" });
    }

    return NextResponse.json({ hint: "has_password" });
  } catch {
    return NextResponse.json({ hint: null });
  }
}
