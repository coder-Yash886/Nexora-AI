import "server-only";

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function getAuthBaseURL() {
  if (process.env.BETTER_AUTH_URL) {
    return stripTrailingSlash(process.env.BETTER_AUTH_URL);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

export function getGoogleRedirectURI(baseURL = getAuthBaseURL()) {
  return `${baseURL}/api/auth/callback/google`;
}

export function getGithubRedirectURI(baseURL = getAuthBaseURL()) {
  return `${baseURL}/api/auth/callback/github`;
}
