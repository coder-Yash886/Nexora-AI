"use client";

import { useState } from "react";
import { LoaderIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedAvatar } from "@/components/generated-avtar";
import { useTRPC } from "@/trpc/client";

interface Props {
  meetingId: string;
  meetingName: string;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const ChatProvider = ({ meetingId, meetingName }: Props) => {
  const trpc = useTRPC();
  const askMeetingAI = trpc.meetings.askMeetingAI.useMutation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || askMeetingAI.isPending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const result = await askMeetingAI.mutateAsync({
        meetingId,
        message: text,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not answer that right now.",
        },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-lg border flex flex-col h-[420px]">
      <div className="border-b px-4 py-3">
        <p className="font-medium">Ask AI about {meetingName}</p>
        <p className="text-sm text-muted-foreground">
          Ask questions about this meeting summary
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Ask anything about what happened in this meeting.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" ? (
                <GeneratedAvatar
                  seed="AI"
                  variant="botttsNeutral"
                  className="size-8 shrink-0"
                />
              ) : null}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this meeting..."
          disabled={askMeetingAI.isPending}
        />
        <Button type="submit" size="icon" disabled={askMeetingAI.isPending || !input.trim()}>
          {askMeetingAI.isPending ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <SendIcon className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
