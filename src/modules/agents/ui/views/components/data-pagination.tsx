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
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {safePage} of {safeTotalPages}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
