"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import {
  SparklesIcon,
  FileTextIcon,
  BookOpenTextIcon,
  FileVideoIcon,
  ClockFadingIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { GeneratedAvatar } from "@/components/generated-avtar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { MeetingGetOne } from "../../types";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Transcript } from "@/modules/meetings/ui/components/transcript";
import { ChatProvider } from "@/modules/meetings/ui/components/chat-provider";
import { useTRPC } from "@/trpc/client";

interface Props {
  data: MeetingGetOne;
}

export const CompletedState = ({ data }: Props) => {
  const trpc = useTRPC();
  const utils = trpc.useUtils();

  const generateSummary = trpc.meetings.generateSummary.useMutation({
    onSuccess: async () => {
      toast.success("Summary generated! Refreshing...");
      await utils.meetings.getOne.invalidate({ id: data.id });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate summary. Try again in a minute.");
    },
  });

  const handleRetrySummary = () => {
    generateSummary.mutate({ id: data.id });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="summary">
        <div className="bg-white rounded-lg border px-3">
          <ScrollArea>
             <TabsList className="p-0 bg-background justify-start rounded-none h-13">
                <TabsTrigger
                  value="summary"
                  className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                >
                  <BookOpenTextIcon />
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="transcript"
                  className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                >
                  <FileTextIcon />
                  Transcript
                </TabsTrigger>
                <TabsTrigger
                  value="recording"
                  className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                >
                <FileVideoIcon />
                Recording
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <SparklesIcon />
                Ask AI
              </TabsTrigger>
             </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <TabsContent value="chat">
          <ChatProvider meetingId={data.id} meetingName={data.name} />
        </TabsContent>
        <TabsContent value="transcript">
          <Transcript meetingId={data.id} />
        </TabsContent>
        <TabsContent value="recording">
          <div className="bg-white rounded-lg border px-4 py-5">
            {data.recordingUrl ? (
              <video
                src={data.recordingUrl}
                className="w-full rounded-lg"
                controls
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertCircleIcon className="size-8 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recording not available yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Stream takes 3–5 minutes to process the recording after the call ends.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-2"
                  onClick={() => utils.meetings.getOne.invalidate({ id: data.id })}
                >
                  <RefreshCwIcon className="size-3.5" />
                  Check again
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="summary">
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
              <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
              <div className="flex gap-x-2 items-center">
                <Link
                  href={`/agents/${data.agent.id}`}
                  className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                >
                  <GeneratedAvatar
                    variant="botttsNeutral"
                    seed={data.agent.name}
                    className="size-5"
                  />
                  {data.agent.name}
                </Link>{" "}
                <p>{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
              </div>
              <div className="flex gap-x-2 items-center">
                <SparklesIcon className="size-4" />
                <p>General summary</p>
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4 w-fit"
              >
                <ClockFadingIcon className="text-blue-700" />
                {data.duration ? formatDuration(data.duration) : "No duration"}
              </Badge>
              <div>
                {data.summary ? (
                  <Markdown
                  components={{
                    h1: (props) => (
                      <h1 className="text-2xl font-medium mb-6" {...props} />
                    ),
                    h2: (props) => (
                      <h2 className="text-xl font-medium mb-6" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="text-lg font-medium mb-6" {...props} />
                    ),
                    h4: (props) => (
                      <h4 className="text-base font-medium mb-6" {...props} />
                    ),
                    p: (props) => (
                      <p className="mb-6 leading-relaxed" {...props} />
                    ),
                    ul: (props) => (
                      <ul className="list-disc list-inside mb-6" {...props} />
                    ),
                    ol: (props) => (
                      <ol
                        className="list-decimal list-inside mb-6"
                        {...props}
                      />
                    ),
                    li: (props) => <li className="mb-1" {...props} />,
                    strong: (props) => (
                      <strong className="font-semibold" {...props} />
                    ),
                    code: (props) => (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded"
                        {...props}
                      />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 pl-4 italic my-4"
                        {...props}
                      />
                    ),
                  }}
                >
                  {data.summary}
                </Markdown>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <AlertCircleIcon className="size-8 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Summary not generated yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        The transcript may still be processing. Click below to try generating the summary now.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-2"
                      disabled={generateSummary.isPending}
                      onClick={handleRetrySummary}
                    >
                      <RefreshCwIcon className={`size-3.5 ${generateSummary.isPending ? "animate-spin" : ""}`} />
                      {generateSummary.isPending ? "Generating..." : "Generate Summary"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};