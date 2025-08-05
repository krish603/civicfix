import { Filter, SortAsc } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface FilterBarProps {
  totalIssues: number;
  filteredCount: number;
  activeFilters: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFilterChange: (filter: string, active: boolean) => void;
}

export function FilterBar({ totalIssues, filteredCount, activeFilters, sortBy, onSortChange, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: "pending", label: "Pending" },
    { id: "in-progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
    { id: "high-priority", label: "High Priority" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3 sm:p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="text-sm text-muted-foreground">
          {filteredCount} of {totalIssues} issues
          {activeFilters.length > 0 && (
            <span className="ml-2">
              • {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
            {activeFilters.length > 0 && (
              <button
                onClick={() => activeFilters.forEach(filter => onFilterChange(filter, false))}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.map((filter) => {
              const isActive = activeFilters.includes(filter.id);
              return (
                <Badge
                  key={filter.id}
                  variant={isActive ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 text-xs transition-colors"
                  onClick={() => onFilterChange(filter.id, !isActive)}
                >
                  {filter.label}
                  {isActive && <span className="ml-1">×</span>}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-voted">Most Voted</SelectItem>
            <SelectItem value="least-voted">Least Voted</SelectItem>
            <SelectItem value="location">By Location</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
