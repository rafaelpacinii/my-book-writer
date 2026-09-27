import React from "react";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { BookFormat } from "@/types/catalog";

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  formatFilter: string;
  setFormatFilter: (val: string) => void;
  formats: BookFormat[];
  sortOrder: "recent" | "title";
  setSortOrder: (val: "recent" | "title") => void;
}

export function LibraryFilters(props: Props) {
  const { searchQuery, setSearchQuery, formatFilter, setFormatFilter, formats, sortOrder, setSortOrder } = props;

  const formatOptions = [
    { value: "", label: "Todos os formatos" },
    ...formats.map((f) => ({ value: f.id, label: f.name })),
  ];

  const sortOptions = [
    { value: "recent", label: "Última alteração" },
    { value: "title", label: "Título A–Z" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full mb-6">
      <div className="relative flex-1 min-w-56">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por título ou autor"
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-surface text-foreground border border-control-border text-sm placeholder:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
        />
      </div>

      <div className="w-full sm:w-52">
        <Select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          options={formatOptions}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "recent" | "title")}
          options={sortOptions}
        />
      </div>
    </div>
  );
}
