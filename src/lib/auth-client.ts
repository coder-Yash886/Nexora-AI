import { createAuthClient } from "better-auth/react";

const productionURL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return productionURL;
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});
