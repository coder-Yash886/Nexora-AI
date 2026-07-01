import { meetingsInsertSchema } from "@/modules/meetings/schemas";
import { MeetingGetOne } from "@/modules/meetings/types";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GeneratedAvatar } from "@/components/generated-avtar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandSelect } from "@/components/ui/command-select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { NewAgentDialog } from "@/modules/agents/ui/views/components/new-agent-dialog";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const queryClient = useQueryClient();
  const [agentSearch, setAgentSearch] = useState("");
  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
  

  const agents = trpc.agents.getMany.useQuery(
    {
      pageSize: 100,
      search: agentSearch,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  const meetingsManyKey = getQueryKey(trpc.meetings.getMany, undefined, "query");
  const meetingsOneKey = initialValues?.id
    ? getQueryKey(trpc.meetings.getOne, { id: initialValues.id }, "query")
    : null;

  const createMeeting = trpc.meetings.create.useMutation({
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: meetingsManyKey });
      if (meetingsOneKey) {
        await queryClient.invalidateQueries({ queryKey: meetingsOneKey });
      }
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMeeting = trpc.meetings.update.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meetingsManyKey });
      if (meetingsOneKey) {
        await queryClient.invalidateQueries({ queryKey: meetingsOneKey });
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit && initialValues?.id) {
      updateMeeting.mutate({ id: initialValues.id, ...values });
    } else {
      createMeeting.mutate(values);
    }
  };

  return (
    <>
    <NewAgentDialog
      open={openNewAgentDialog}
      onOpenChange={setOpenNewAgentDialog}
    />
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <GeneratedAvatar
          seed={form.watch("name")}
          variant="botttsNeutral"
          className="border size-16"
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="create a new meeting" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="agentId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <FormControl>
                <CommandSelect
                  className="w-full"
                  options={(agents.data?.items ?? []).map((agent) => ({
                    id: agent.id,
                    value: agent.id,
                    keywords: [agent.name],
                    children: (
                      <div className="flex items-center gap-x-2">
                        <GeneratedAvatar
                          seed={agent.name}
                          variant="botttsNeutral"
                          className="border size-6"
                        />
                        <span>{agent.name}</span>
                      </div>
                    ),
                  }))}
                  onSelect={field.onChange}
                  onSearch={setAgentSearch}
                  value={field.value}
                  placeholder="Select an agent"
                />
              </FormControl>
              <FormDescription>
                Not Found what you&apos;re looking for? {" "}
                <button
                  type="button" 
                  className="text-primary  hover:underline"
                  onClick={() => setOpenNewAgentDialog(true)}
                >
                  Create a new agent
                </button>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
};
