import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  getAuthBaseURL,
  getGithubRedirectURI,
  getGoogleRedirectURI,
} from "@/lib/auth-url";
import { sendEmail } from "@/lib/send-email";

const baseURL = getAuthBaseURL();

const trustedOrigins = [
  baseURL,
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter(
  (origin, index, arr): origin is string =>
    !!origin && arr.indexOf(origin) === index,
);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: getGithubRedirectURI(baseURL),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: getGoogleRedirectURI(baseURL),
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Nexora AI password",
        text: `Click the link to reset your password:\n\n${url}\n\nIf you signed up with Google/GitHub, this link lets you add an email password to the same account.`,
      });
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
