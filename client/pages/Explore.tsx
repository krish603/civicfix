import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Hash, Loader2, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasonryGrid } from "@/components/MasonryGrid";
import { useSearch } from "@/contexts/SearchContext";
import { issuesApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Issue {
  _id: string;
  title: string;
  description: string;
  locationAddress: string;
  images?: { url: string; thumbnailUrl?: string; altText?: string; isPrimary: boolean }[];
  status: string;
  priority: string;
  upvotesCount: number;
  downvotesCount: number;
  viewsCount: number;
  commentsCount: number;
  tags: string[];
  createdAt: string;
  reportedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  categoryId?: {
    _id: string;
    name: string;
    iconName?: string;
    colorHex?: string;
  };
  hasUserVoted?: 'upvote' | 'downvote' | null;
}

interface TrendingTag {
  tag: string;
  count: number;
}

export default function Explore() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page,
          limit: 12,
          sortBy,
          sortOrder
        };

        // Add filters
        if (selectedHashtag) {
          params.tags = selectedHashtag;
        }
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (priorityFilter !== 'all') {
          params.priority = priorityFilter;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery;
        }

        const response = await issuesApi.getIssues(params);
        
        if (response.success && response.data) {
          if (page === 1) {
            setIssues(response.data.issues);
          } else {
            setIssues(prev => [...prev, ...response.data.issues]);
          }
          
          // Check if there are more pages
          setHasMore(response.data.pagination.page < response.data.pagination.pages);
        } else {
          setError(response.message || 'Failed to fetch issues');
        }
      } catch (err: any) {
        console.error('Error fetching issues:', err);
        setError(err.message || 'Failed to fetch issues');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchIssues();
  }, [page, selectedHashtag, statusFilter, priorityFilter, sortBy, sortOrder, searchQuery]);

  // Generate trending tags from issues
  useEffect(() => {
    if (issues.length > 0) {
      const tagCounts: { [key: string]: number } = {};
      
      issues.forEach(issue => {
        issue.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const trending = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingTags(trending);
    }
  }, [issues]);

  const handleItemClick = (id: string) => {
    navigate(`/issue/${id}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    setSelectedHashtag(selectedHashtag === hashtag ? null : hashtag);
    setPage(1); // Reset to first page when filtering
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await issuesApi.voteOnIssue(issueId, voteType);
      
      if (response.success) {
        // Update the local state
        setIssues(prev => prev.map(issue => 
          issue._id === issueId 
            ? { 
                ...issue, 
                upvotesCount: response.data.upvotesCount,
                downvotesCount: response.data.downvotesCount,
                hasUserVoted: response.data.hasUserVoted
              }
            : issue
        ));

        // Create notification for issue owner
        const issue = issues.find(i => i._id === issueId);
        if (issue && issue.reportedBy._id !== user?.id) {
          if (voteType === 'upvote') {
            await notificationService.notifyUpvoteOnIssue(
              issue.reportedBy._id,
              user?.id || '',
              user?.name || 'Anonymous',
              issue._id,
              issue.title,
              response.data.upvotesCount
            );
          } else {
            await notificationService.notifyDownvoteOnIssue(
              issue.reportedBy._id,
              user?.id || '',
              user?.name || 'Anonymous',
              issue._id,
              issue.title,
              response.data.downvotesCount
            );
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on issue",
        variant: "destructive",
      });
    }
  };

  // Transform API data to match MasonryGrid expectations
  const transformedIssues = useMemo(() => {
    return issues.map(issue => ({
      id: issue._id,
      image: issue.images?.find(img => img.isPrimary)?.url || issue.images?.[0]?.url || "/placeholder.svg",
      title: issue.title,
      location: issue.locationAddress,
      upvotes: issue.upvotesCount,
      status: issue.status,
      hashtags: issue.tags,
      priority: issue.priority,
      views: issue.viewsCount,
      comments: issue.commentsCount,
      createdAt: issue.createdAt,
      hasUserVoted: issue.hasUserVoted,
      reporter: issue.reportedBy.name,
      category: issue.categoryId?.name
    }));
  }, [issues]);

  // Apply client-side filtering for hashtags (since we're using the trending tags)
  const filteredItems = useMemo(() => {
    let filtered = [...transformedIssues];

    // Apply hashtag filter (this is now handled server-side, but keeping for consistency)
    if (selectedHashtag) {
      filtered = filtered.filter(item => item.hashtags.includes(selectedHashtag));
    }

    return filtered;
  }, [transformedIssues, selectedHashtag]);

  if (loading && page === 1) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Explore Issues</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Discover trending civic issues across different neighborhoods
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Loading issues...</div>
        </div>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Explore Issues</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Discover trending civic issues across different neighborhoods
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="text-lg font-medium mb-2">Error loading issues</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Explore Issues</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Discover trending civic issues across different neighborhoods
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="upvotesCount">Upvotes</SelectItem>
                <SelectItem value="viewsCount">Views</SelectItem>
                <SelectItem value="commentsCount">Comments</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      {trendingTags.length > 0 && (
        <div className="bg-card rounded-lg border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h2 className="text-base md:text-lg font-semibold">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {trendingTags.map(({ tag, count }) => (
              <Badge
                key={tag}
                variant={selectedHashtag === tag ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/80 px-2 md:px-3 py-1 text-xs md:text-sm"
                onClick={() => handleHashtagClick(tag)}
              >
                <Hash className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                {tag} ({count})
              </Badge>
            ))}
          </div>
          {selectedHashtag && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering by:</span>
              <Badge variant="default" className="gap-1">
                #{selectedHashtag}
                <button
                  onClick={() => setSelectedHashtag(null)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} issue{filteredItems.length !== 1 ? 's' : ''}
        {selectedHashtag && ` with #${selectedHashtag}`}
        {searchQuery.trim() && ` matching "${searchQuery}"`}
        {statusFilter !== 'all' && ` with status "${statusFilter}"`}
        {priorityFilter !== 'all' && ` with priority "${priorityFilter}"`}
      </div>

      {/* Masonry Grid */}
      {filteredItems.length > 0 ? (
        <MasonryGrid items={filteredItems} onItemClick={handleItemClick} onVote={handleVote} />
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No issues found</p>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-8"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Issues'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
