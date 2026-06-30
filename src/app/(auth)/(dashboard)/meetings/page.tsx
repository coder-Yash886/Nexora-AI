import { auth } from "@/lib/auth";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  void trpc.meetings.getMany.prefetch({});

  return (
    <>
    <MeetingsListHeader/>
    <HydrateClient>
      <MeetingsView />
    </HydrateClient>
    </>
  );
};

export default Page;
