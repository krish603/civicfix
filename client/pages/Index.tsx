import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/IssueCard";
import { FilterBar } from "@/components/FilterBar";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { useSearch } from "@/contexts/SearchContext";
import { useIssues } from "@/hooks/useIssues";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const { searchQuery, clearSearch } = useSearch();
  const { toast } = useToast();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build API parameters from filters and search
  const apiParams = useMemo(() => {
    const params: any = {
      sortBy,
      sortOrder,
      limit: 20
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // Map frontend filter format to API format
    const statusFilters = activeFilters.filter(f => ['pending', 'in-progress', 'resolved'].includes(f));
    if (statusFilters.length > 0) {
      let apiStatus = statusFilters[0];
      // Map frontend status names to API status names
      if (apiStatus === 'in-progress') {
        apiStatus = 'in_progress';
      }
      params.status = apiStatus;
    }

    if (activeFilters.includes('high-priority')) {
      params.priority = 'high';
    }

    return params;
  }, [searchQuery, activeFilters, sortBy, sortOrder]);

  const { issues, loading, error, pagination, voteOnIssue } = useIssues(apiParams);

  const handleFilterChange = (filter: string, active: boolean) => {
    if (active) {
      setActiveFilters([...activeFilters, filter]);
    } else {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    }
  };

  const handleSortChange = (sort: string) => {
    // Map frontend sort options to API format
    switch (sort) {
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      case "most-voted":
        setSortBy("upvotesCount");
        setSortOrder("desc");
        break;
      case "least-voted":
        setSortBy("upvotesCount");
        setSortOrder("asc");
        break;
      case "location":
        setSortBy("locationAddress");
        setSortOrder("asc");
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("desc");
    }
  };

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await voteOnIssue(issueId, voteType);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on issue",
        variant: "destructive",
      });
    }
  };

  // Transform API data to match component expectations
  const transformedIssues = issues.map(issue => ({
    id: issue._id,
    title: issue.title,
    description: issue.description,
    location: issue.locationAddress,
    image: issue.images?.[0]?.url || "/placeholder.svg",
    status: issue.status === 'in_progress' ? 'in-progress' : issue.status, // Map API status to frontend format
    upvotes: issue.upvotesCount || 0,
    downvotes: issue.downvotesCount || 0,
    createdAt: new Date(issue.createdAt).toLocaleDateString(),
    hasUserVoted: issue.hasUserVoted,
    priority: issue.priority,
    // Add any additional fields your IssueCard might need
    tags: issue.tags,
    categoryName: issue.categoryName || issue.category?.name,
    reportedBy: issue.reportedBy
  }));

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
        totalIssues={pagination?.total || 0}
        filteredCount={transformedIssues.length}
        activeFilters={activeFilters}
        sortBy={sortBy === "createdAt" && sortOrder === "desc" ? "newest" :
               sortBy === "createdAt" && sortOrder === "asc" ? "oldest" :
               sortBy === "upvotesCount" && sortOrder === "desc" ? "most-voted" :
               sortBy === "upvotesCount" && sortOrder === "asc" ? "least-voted" :
               sortBy === "locationAddress" ? "location" : "newest"}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading issues...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="text-lg font-medium mb-2">Error loading issues</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Issue List */}
      {!loading && !error && (
        <div className="space-y-4">
          {transformedIssues.length === 0 ? (
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
            transformedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                {...issue}
                onVote={handleVote}
              />
            ))
          )}
        </div>
      )}

      {/* Load More - only show if there are more pages */}
      {pagination && pagination.page < pagination.totalPages && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Load More Issues
          </Button>
        </div>
      )}
    </div>
  );
}