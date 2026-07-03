import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { after } from "next/server";
import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, getTableColumns, ilike, desc, count, sql, inArray } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema } from "../schemas";
import { MeetingStatus } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";
import { processMeetingSummaryWithRetry } from "@/lib/process-meeting-summary";

export const meetingsRouter = createTRPCRouter({

  generateToken: protectedProcedure.mutation(async({ctx}) => {

    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: "admin",
        image: 
          ctx.auth.user.image ??
          generateAvatarUri({ seed: ctx.auth.user.name, variant:"initials"}),
      },
    ])

    const expirationTime  = Math.floor(Date.now() / 1000) + 60 * 60;  // 1 hour from now
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    })
      return token;
  }),

  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

        const call = streamVideo.video.call("default", createdMeeting.id);
        await call.create({
          data: {
            created_by_id: ctx.auth.user.id,
            custom:{
              meetingId: createdMeeting.id,
              meetingName: createdMeeting.name,
            },
            settings_override: {
              transcription: {
                language: "en",
                mode: "auto-on",
                closed_caption_mode: "auto-on",
              },

              recording: {
                mode: "auto-on",
                quality: "1080p",
              }

            }
          },
        });

        const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId));

        if(!existingAgent){
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }

        await streamVideo.upsertUsers([
          {
            id: existingAgent.id,
            name: existingAgent.name,
            role: "user",
            image: generateAvatarUri({
              seed: existingAgent.name,
              variant: "botttsNeutral",
            }),
          },
        ])

      return createdMeeting;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
        .enum([
          MeetingStatus.Upcoming,
          MeetingStatus.Active,
          MeetingStatus.Completed,
          MeetingStatus.Processing,
          MeetingStatus.Cancelled,
        ])
        .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {  page, pageSize, status, search, agentId } = input;

      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: {
            id: agents.id,
            name: agents.name,
          },
          duration: sql<number>`EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,

          )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          )
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))`.as("duration"),


        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        );

      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return existingMeeting;
    }),


  update: protectedProcedure
    .input(meetingsInsertSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...values } = input;

      const [updatedMeeting] = await db
        .update(meetings)
        .set(values)
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return updatedMeeting;
    }),

    remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const [removedMeeting] = await db
        .delete(meetings)
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        )
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return removedMeeting;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["upcoming", "active", "completed", "processing", "cancelled"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, status } = input;

      const updateData: {
        status: typeof status;
        startedAt?: Date;
        endedAt?: Date;
      } = { status };

      if (status === "active") {
        updateData.startedAt = new Date();
      } else if (status === "processing" || status === "completed") {
        updateData.endedAt = new Date();
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set(updateData)
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      if (status === "processing") {
        after(async () => {
          try {
            await processMeetingSummaryWithRetry(id, {
              maxAttempts: 18,
              delayMs: 10000,
            });
          } catch (error) {
            console.error("Background meeting summary failed:", error);
          }
        });
      }

      return updatedMeeting;
    }),

  generateSummary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [existingMeeting] = await db
        .select({ id: meetings.id })
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return processMeetingSummaryWithRetry(input.id, {
        maxAttempts: 12,
        delayMs: 5000,
      });
    }),

  getTranscript: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [meeting] = await db
        .select({ transcriptUrl: meetings.transcriptUrl })
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!meeting?.transcriptUrl) {
        return [];
      }

      const JSONL = (await import("jsonl-parse-stringify")).default;
      const response = await fetch(meeting.transcriptUrl);
      const text = await response.text();
      const items = JSONL.parse<import("../types").StreamTranscriptItem>(text);

      const speakerIds = [...new Set(items.map((item) => item.speaker_id))];

      const userSpeakers = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, speakerIds));

      const agentSpeakers = await db
        .select({ id: agents.id, name: agents.name })
        .from(agents)
        .where(inArray(agents.id, speakerIds));

      const speakers = [...userSpeakers, ...agentSpeakers];

      return items.map((item) => ({
        ...item,
        speakerName:
          speakers.find((speaker) => speaker.id === item.speaker_id)?.name ??
          "Unknown",
      }));
    }),

  askMeetingAI: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const [meeting] = await db
        .select({
          summary: meetings.summary,
          agentInstructions: agents.instructions,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, "completed"),
          ),
        );

      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: input.message,
        config: {
          systemInstruction: `You help the user revisit a completed meeting.

Meeting summary:
${meeting.summary ?? "No summary available."}

Agent instructions from the live session:
${meeting.agentInstructions}

Answer based on the meeting summary. Be concise and helpful.`,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gemini returned an empty response",
        });
      }

      return { reply };
    }),

  askAgent: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const [meeting] = await db
        .select({
          agentInstructions: agents.instructions,
          agentName: agents.name,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      const ai = new GoogleGenAI({ apiKey });
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: input.message,
          config: {
            systemInstruction: `${meeting.agentInstructions}\n\nReply in one or two short sentences. Be direct and helpful.`,
          },
        });

        const reply = response.text?.trim();
        if (!reply) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an empty response",
          });
        }

        return { reply };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gemini request failed";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: message.includes("429")
            ? "Gemini API quota exceeded. Wait a minute or use a new API key."
            : message.includes("API key")
              ? "Invalid Gemini API key. Check GEMINI_API_KEY in .env"
              : "Could not get a reply from Gemini. Check your API key.",
        });
      }
    }),

  askAgentVoice: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        audioBase64: z.string().min(1),
        mimeType: z.string().default("audio/webm"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const [meeting] = await db
        .select({
          agentInstructions: agents.instructions,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      const ai = new GoogleGenAI({ apiKey });
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: input.mimeType,
                data: input.audioBase64,
              },
            },
            {
              text: "Listen to the user's voice message, understand their question, and answer it.",
            },
          ],
          config: {
            systemInstruction: `${meeting.agentInstructions}\n\nReply in one or two short sentences. Be direct and helpful.`,
          },
        });

        const reply = response.text?.trim();
        if (!reply) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an empty response",
          });
        }

        return { reply };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gemini request failed";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: message.includes("429")
            ? "Gemini API quota exceeded. Wait a minute or use a new API key."
            : "Could not process voice. Try typing your question instead.",
        });
      }
    }),
});