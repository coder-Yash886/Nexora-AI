"use client";

import { ReactNode, useEffect, useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandInput,
  CommandEmpty,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

interface Props {
  options: Array<{
    id: string;
    value: string;
    keywords?: string[];
    children: ReactNode;
  }>;
  onSelect: (value: string) => void;
  onSearch?: (value: string) => void;
  value: string;
  placeholder?: string;
  className?: string;
}

export const CommandSelect = ({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "Select an option",
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const usesServerSearch = !!onSearch;

  useEffect(() => {
    if (!usesServerSearch) return;

    const timer = setTimeout(() => {
      onSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearch, usesServerSearch]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch("");
      onSearch?.("");
    }
    setOpen(nextOpen);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
        className={cn(
          "flex h-9 items-center justify-between gap-2 px-2 font-normal",
          !selectedOption && "text-muted-foreground",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          {selectedOption?.children ?? (
            <span className="truncate">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>
      <CommandResponsiveDialog
        shouldFilter={!usesServerSearch}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <CommandInput
          placeholder="Search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No options found
            </span>
          </CommandEmpty>
          {options.map((option) => (
            <CommandItem
              key={option.id}
              value={option.value}
              keywords={option.keywords}
              onSelect={() => {
                onSelect(option.value);
                handleOpenChange(false);
              }}
            >
              {option.children}
            </CommandItem>
          ))}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
};
