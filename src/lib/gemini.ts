import "server-only";

import { GoogleGenAI } from "@google/genai";
import { TRPCError } from "@trpc/server";

const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

type GenerateContentInput = Parameters<
  GoogleGenAI["models"]["generateContent"]
>[0];

export function getGeminiApiKey(): string {
  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "GEMINI_API_KEY is not set in .env",
    });
  }

  return apiKey;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.toLowerCase().includes("quota")
  );
}

function toGeminiTRPCError(error: unknown): TRPCError {
  const message = error instanceof Error ? error.message : "Gemini request failed";

  if (isQuotaError(error)) {
    return new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        "Gemini free quota reached. Wait 1 minute, then try again. Or create a new API key at aistudio.google.com/apikey",
    });
  }

  if (message.includes("API key") || message.includes("API_KEY")) {
    return new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Invalid Gemini API key. Get a free key from aistudio.google.com/apikey and set GEMINI_API_KEY in .env",
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Could not get a reply from Gemini. Please try again.",
  });
}

export async function generateGeminiText(
  input: Omit<GenerateContentInput, "model">,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  let lastError: unknown;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...input,
          model,
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }

        throw new Error("Gemini returned an empty response");
      } catch (error) {
        lastError = error;

        if (isQuotaError(error)) {
          if (attempt === 0) {
            await sleep(2500);
            continue;
          }
          break;
        }

        throw toGeminiTRPCError(error);
      }
    }
  }

  throw toGeminiTRPCError(lastError);
}
