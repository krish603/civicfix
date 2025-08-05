import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/IssueCard";
import { FilterBar } from "@/components/FilterBar";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { useSearch } from "@/contexts/SearchContext";

// Mock data for demonstration
const mockIssues = [
  {
    id: "1",
    title: "Broken Street Light on Main Street",
    description: "The street light at the intersection of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians and drivers.",
    location: "Main Street & Oak Avenue, Downtown",
    image: "/placeholder.svg",
    status: "pending" as const,
    upvotes: 24,
    downvotes: 2,
    createdAt: "2 days ago",
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: "high" as const,
    hasUserVoted: null as null
  },
  {
    id: "2",
    title: "Large Pothole Causing Vehicle Damage",
    description: "There's a massive pothole on Elm Street that's causing damage to vehicles. Several residents have reported tire damage.",
    location: "Elm Street, Residential Area",
    image: "/placeholder.svg",
    status: "in-progress" as const,
    upvotes: 41,
    downvotes: 1,
    createdAt: "5 days ago",
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    priority: "high" as const,
    hasUserVoted: "up" as const
  },
  {
    id: "3",
    title: "Graffiti on Public Building",
    description: "The community center building has been vandalized with graffiti on the east wall facing the parking lot.",
    location: "Community Center, 123 Park Ave",
    image: "/placeholder.svg",
    status: "resolved" as const,
    upvotes: 15,
    downvotes: 0,
    createdAt: "1 week ago",
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    priority: "medium" as const,
    hasUserVoted: null as null
  },
  {
    id: "4",
    title: "Overflowing Trash Bin at Bus Stop",
    description: "The trash bin at the bus stop on Pine Street is constantly overflowing, attracting pests and creating unsanitary conditions.",
    location: "Pine Street Bus Stop",
    image: "/placeholder.svg",
    status: "pending" as const,
    upvotes: 18,
    downvotes: 3,
    createdAt: "3 days ago",
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    priority: "medium" as const,
    hasUserVoted: null as null
  },
  {
    id: "5",
    title: "Damaged Crosswalk Signal",
    description: "The pedestrian crossing signal at the school zone is malfunctioning, not giving enough time for students to cross safely.",
    location: "School Zone, Maple Street",
    image: "/placeholder.svg",
    status: "in-progress" as const,
    upvotes: 67,
    downvotes: 2,
    createdAt: "4 days ago",
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    priority: "high" as const,
    hasUserVoted: null as null
  },
  {
    id: "6",
    title: "Broken Park Bench",
    description: "Several benches in Central Park are broken and need repair or replacement. They pose a safety risk to visitors.",
    location: "Central Park",
    image: "/placeholder.svg",
    status: "pending" as const,
    upvotes: 12,
    downvotes: 0,
    createdAt: "1 day ago",
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: "low" as const,
    hasUserVoted: null as null
  },
  {
    id: "7",
    title: "Broken Sidewalk on Oak Avenue",
    description: "Large cracks and uneven surfaces on Oak Avenue sidewalk near the hospital entrance, making it dangerous for wheelchair users and elderly pedestrians.",
    location: "Oak Avenue, Hospital District",
    image: "/placeholder.svg",
    status: "pending" as const,
    upvotes: 8,
    downvotes: 1,
    createdAt: "6 hours ago",
    createdDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    priority: "high" as const,
    hasUserVoted: null as null
  },
  {
    id: "8",
    title: "Flooding at Park Street Intersection",
    description: "Poor drainage system causes flooding every time it rains, blocking traffic and making the intersection impassable.",
    location: "Park Street & First Avenue",
    image: "/placeholder.svg",
    status: "in-progress" as const,
    upvotes: 35,
    downvotes: 0,
    createdAt: "1 week ago",
    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    priority: "high" as const,
    hasUserVoted: null as null
  }
];

export default function Index() {
  const { searchQuery, clearSearch } = useSearch();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const handleFilterChange = (filter: string, active: boolean) => {
    if (active) {
      setActiveFilters([...activeFilters, filter]);
    } else {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    }
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  // Filter and search logic
  const filteredIssues = useMemo(() => {
    let filtered = [...mockIssues];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query)
      );
    }

    // Apply status and priority filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(issue => {
        const hasStatusFilter = activeFilters.includes(issue.status);
        const hasPriorityFilter = activeFilters.includes("high-priority") && issue.priority === "high";

        // If both status and priority filters are active, issue must match at least one
        if (activeFilters.includes("high-priority") && activeFilters.some(f => ["pending", "in-progress", "resolved"].includes(f))) {
          return hasStatusFilter || hasPriorityFilter;
        }

        // If only status filters
        if (activeFilters.some(f => ["pending", "in-progress", "resolved"].includes(f)) && !activeFilters.includes("high-priority")) {
          return hasStatusFilter;
        }

        // If only priority filter
        if (activeFilters.includes("high-priority") && !activeFilters.some(f => ["pending", "in-progress", "resolved"].includes(f))) {
          return hasPriorityFilter;
        }

        return hasStatusFilter || hasPriorityFilter;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
      case "oldest":
        return filtered.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
      case "most-voted":
        return filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case "least-voted":
        return filtered.sort((a, b) => (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes));
      case "location":
        return filtered.sort((a, b) => a.location.localeCompare(b.location));
      default:
        return filtered;
    }
  }, [searchQuery, activeFilters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community Issues</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Report and track civic issues in your neighborhood
          </p>
        </div>
        <ReportIssueDialog>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Report New Issue
          </Button>
        </ReportIssueDialog>
      </div>

      {/* Filter Bar */}
      <FilterBar
        totalIssues={mockIssues.length}
        filteredCount={filteredIssues.length}
        activeFilters={activeFilters}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      {/* Issue List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchQuery.trim() || activeFilters.length > 0 ? (
                <>
                  <p className="text-lg font-medium mb-2">No issues found</p>
                  <p className="text-sm">
                    {searchQuery.trim() && `No results for "${searchQuery}"`}
                    {searchQuery.trim() && activeFilters.length > 0 && " with the selected filters"}
                    {!searchQuery.trim() && activeFilters.length > 0 && "No issues match the selected filters"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setActiveFilters([]);
                      clearSearch();
                    }}
                  >
                    Clear all filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">No issues reported yet</p>
                  <p className="text-sm">Be the first to report a civic issue in your community</p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} {...issue} />
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Issues
        </Button>
      </div>
    </div>
  );
}
