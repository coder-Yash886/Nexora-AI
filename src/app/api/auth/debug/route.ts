import { NextResponse } from "next/server";

import {
  getAuthBaseURL,
  getGithubRedirectURI,
  getGoogleRedirectURI,
} from "@/lib/auth-url";

export async function GET() {
  const baseURL = getAuthBaseURL();

  return NextResponse.json({
    baseURL,
    googleRedirectURI: getGoogleRedirectURI(baseURL),
    githubRedirectURI: getGithubRedirectURI(baseURL),
    hint: "Add googleRedirectURI exactly in Google Cloud Console → Authorized redirect URIs",
  });
}
