import { auth } from "@/lib/auth";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "@/modules/meetings/params";


interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  void trpc.meetings.getMany.prefetch({
      ...filters,
  });

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
