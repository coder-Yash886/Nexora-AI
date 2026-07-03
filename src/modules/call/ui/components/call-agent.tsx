"use client";

import { LoaderIcon, MicIcon, SendIcon, SquareIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";

interface Props {
  meetingId: string;
  enabled: boolean;
  onReply?: (reply: string) => void;
  onStatusChange?: (status: string) => void;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read audio"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to encode audio"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read audio"));
    reader.readAsDataURL(blob);
  });
}

export const CallAgent = ({
  meetingId,
  enabled,
  onReply,
  onStatusChange,
}: Props) => {
  const trpc = useTRPC();
  const askAgent = trpc.meetings.askAgent.useMutation();
  const askAgentVoice = trpc.meetings.askAgentVoice.useMutation();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isBusy = askAgent.isPending || askAgentVoice.isPending;

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, []);

  const showReply = useCallback(
    (reply: string) => {
      onReply?.(reply);
      speak(reply);
    },
    [onReply, speak],
  );

  useEffect(() => {
    if (!enabled) return;

    if (isBusy) {
      onStatusChange?.("Thinking...");
      return;
    }

    if (isRecording) {
      onStatusChange?.("Recording... tap mic to send");
      return;
    }

    onStatusChange?.("Type or tap mic to ask");
  }, [enabled, isBusy, isRecording, onStatusChange]);

  const handleAgentError = (error: unknown) => {
    console.error("Agent reply failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Agent could not reply. Check your Gemini API key.";
    toast.error(message, { duration: 6000 });
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      try {
        const result = await askAgent.mutateAsync({
          meetingId,
          message: trimmed,
        });
        showReply(result.reply);
      } catch (error) {
        handleAgentError(error);
      }
    },
    [askAgent, isBusy, meetingId, showReply],
  );

  const sendVoice = useCallback(
    async (audioBlob: Blob, mimeType: string) => {
      if (isBusy) return;

      try {
        const audioBase64 = await blobToBase64(audioBlob);
        const result = await askAgentVoice.mutateAsync({
          meetingId,
          audioBase64,
          mimeType,
        });
        showReply(result.reply);
      } catch (error) {
        handleAgentError(error);
      }
    },
    [askAgentVoice, isBusy, meetingId, showReply],
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (isBusy) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (audioBlob.size > 0) {
          void sendVoice(audioBlob, mimeType);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone permission is required. Allow mic access and try again.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    void startRecording();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const current = message;
    setMessage("");
    await sendMessage(current);
  };

  useEffect(() => {
    return () => {
      stopRecording();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, [stopRecording]);

  if (!enabled) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl gap-2 rounded-full bg-[#101213] px-3 py-2"
    >
      <Input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder='Ask the agent... e.g. "What is 2 plus 2?"'
        className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
        disabled={isBusy}
      />
      <Button
        type="button"
        size="icon"
        variant={isRecording ? "destructive" : "secondary"}
        className="shrink-0 rounded-full"
        onClick={toggleRecording}
        disabled={isBusy}
        aria-label={isRecording ? "Stop recording" : "Record voice question"}
      >
        {isBusy ? (
          <LoaderIcon className="size-4 animate-spin" />
        ) : isRecording ? (
          <SquareIcon className="size-4" />
        ) : (
          <MicIcon className="size-4" />
        )}
      </Button>
      <Button
        type="submit"
        size="icon"
        className="shrink-0 rounded-full"
        disabled={isBusy || !message.trim()}
        aria-label="Send message"
      >
        <SendIcon className="size-4" />
      </Button>
    </form>
  );
};
