import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const contactRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        subject: z.string().optional(),
        message: z.string().min(1, "Message is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      console.log(
        `[Contact Form] Submission received from ${user.name} (${user.email}): Subject: "${input.subject ?? "No Subject"}" | Message: "${input.message}"`
      );

      return { success: true };
    }),
});
