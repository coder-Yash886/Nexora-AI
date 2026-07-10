"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { CommandSelect } from "@/components/ui/command-select";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { GeneratedAvatar } from "@/components/generated-avtar";
import { DEFAULT_PAGE } from "@/constants";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [agentSearch, setAgentSearch] = useState("");

  const { data } = trpc.agents.getMany.useQuery(
    {
      search: agentSearch,
      pageSize: 100,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  return (
    <CommandSelect
      className="h-9 w-full bg-white shadow-xs"
      placeholder="Agent"
      options={(data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        keywords: [agent.name],
        children: (
          <div className="flex min-w-0 items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-4 shrink-0"
            />
            <span className="truncate">{agent.name}</span>
          </div>
        ),
      }))}
      onSelect={(value) =>
        setFilters({ agentId: value, page: DEFAULT_PAGE })
      }
      onSearch={setAgentSearch}
      value={filters.agentId ?? ""}
    />
  );
};
