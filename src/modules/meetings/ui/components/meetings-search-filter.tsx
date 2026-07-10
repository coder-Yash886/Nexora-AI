import { SearchIcon } from "lucide-react";
import { Input} from "@/components/ui/input";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DEFAULT_PAGE } from "@/constants";


export const MeetingsSearchFilter =() => {
    const [filters,setFilters] = useMeetingsFilters();

    return(
        <div className="relative w-full">
            <Input 
                placeholder="Filter by name"
                className="h-9 w-full bg-white pl-8 shadow-xs"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: DEFAULT_PAGE })}
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
}