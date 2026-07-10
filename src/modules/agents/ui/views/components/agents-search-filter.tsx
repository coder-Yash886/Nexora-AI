import { SearchIcon } from "lucide-react";
import { Input} from "@/components/ui/input";
import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters";
import { DEFAULT_PAGE } from "@/constants";


export const AgentsSearchFilter =() => {
    const [filters,setFilters] = useAgentsFilters();

    return(
        <div className="relative w-full">
            <Input 
                placeholder="Filter by name"
                className="h-9 w-full bg-white pl-7"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: DEFAULT_PAGE })}
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
}