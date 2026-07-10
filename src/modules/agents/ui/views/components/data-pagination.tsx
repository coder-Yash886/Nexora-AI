import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({
  page,
  totalPages,
  onPageChange,
}: Props) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
        Page {safePage} of {safeTotalPages}
      </div>
      <div className="flex items-center justify-center gap-2 py-1 sm:justify-end sm:py-4">
        <Button
          disabled={safePage <= 1}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
        >
          Previous
        </Button>
        <Button
          disabled={safePage >= safeTotalPages}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
