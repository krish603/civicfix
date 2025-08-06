import { useState, useEffect } from "react";
import { Plus, Calendar, TrendingUp, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueCard } from "@/components/IssueCard";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { useAuth } from "@/contexts/AuthContext";
import { issuesApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface UserIssue {
  _id: string;
  title: string;
  description: string;
  locationAddress: string;
  images?: { url: string }[];
  status: string;
  upvotesCount: number;
  downvotesCount: number;
  createdAt: string;
  viewsCount?: number;
  commentsCount?: number;
  priority: string;
  tags?: string[];
  categoryName?: string;
  hasUserVoted?: 'upvote' | 'downvote' | null;
}

interface UserStats {
  totalReports: number;
  resolved: number;
  pending: number;
  inProgress: number;
  totalViews: number;
  totalUpvotes: number;
  totalComments: number;
}

const mockDrafts = [
  {
    id: "draft-1",
    title: "Damaged Sidewalk Near School",
    description: "Large cracks in the sidewalk creating tripping hazards...",
    location: "Elementary School, Oak Street",
    lastEdited: "Yesterday",
    completeness: 85
  },
  {
    id: "draft-2",
    title: "Broken Park Bench",
    description: "Several broken slats on bench in Central Park...",
    location: "Central Park",
    lastEdited: "3 days ago",
    completeness: 60
  }
];

export default function MyReports() {
  const [activeTab, setActiveTab] = useState("published");
  const [userIssues, setUserIssues] = useState<UserIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch user's issues
  useEffect(() => {
    const fetchUserIssues = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch issues reported by the current user
        const response = await issuesApi.getUserIssues(); // You'll need to implement this API method
        
        if (response.success) {
          setUserIssues(response.data);
        } else {
          setError(response.message || 'Failed to fetch your issues');
        }
      } catch (err: any) {
        console.error('Error fetching user issues:', err);
        setError(err.message || 'Failed to fetch your issues');
      } finally {
        setLoading(false);
      }
    };

    fetchUserIssues();
  }, [isAuthenticated, user]);

  // Calculate stats from user issues
  const stats: UserStats = {
    totalReports: userIssues.length,
    resolved: userIssues.filter(issue => issue.status === "resolved").length,
    pending: userIssues.filter(issue => issue.status === "pending").length,
    inProgress: userIssues.filter(issue => issue.status === "in_progress").length,
    totalViews: userIssues.reduce((sum, issue) => sum + (issue.viewsCount || 0), 0),
    totalUpvotes: userIssues.reduce((sum, issue) => sum + (issue.upvotesCount || 0), 0),
    totalComments: userIssues.reduce((sum, issue) => sum + (issue.commentsCount || 0), 0)
  };

  // Transform API data to match IssueCard expectations
  const transformedIssues = userIssues.map(issue => ({
    id: issue._id,
    title: issue.title,
    description: issue.description,
    location: issue.locationAddress,
    image: issue.images?.[0]?.url || "/placeholder.svg",
    status: issue.status === 'in_progress' ? 'in-progress' : issue.status,
    upvotes: issue.upvotesCount || 0,
    downvotes: issue.downvotesCount || 0,
    createdAt: new Date(issue.createdAt).toLocaleDateString(),
    hasUserVoted: issue.hasUserVoted,
    priority: issue.priority,
    views: issue.viewsCount || 0,
    comments: issue.commentsCount || 0
  }));

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      // You can implement voting on your own issues if needed
      // Or disable it in the UI for own issues
      const response = await issuesApi.voteOnIssue(issueId, voteType);
      
      if (response.success) {
        // Update the local state
        setUserIssues(prev => prev.map(issue => 
          issue._id === issueId 
            ? { 
                ...issue, 
                upvotesCount: response.data.upvotesCount,
                downvotesCount: response.data.downvotesCount,
                hasUserVoted: response.data.hasUserVoted
              }
            : issue
        ));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on issue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await issuesApi.deleteIssue(issueId); // You'll need to implement this
      
      if (response.success) {
        setUserIssues(prev => prev.filter(issue => issue._id !== issueId));
        toast({
          title: "Success",
          description: "Issue deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete issue",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">Please sign in to view your reports</p>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track and manage all your civic issue reports
          </p>
        </div>
        <ReportIssueDialog>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Report New Issue
          </Button>
        </ReportIssueDialog>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading your reports...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="text-lg font-medium mb-2">Error loading reports</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 0}% resolution rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="published" className="gap-2">
                Published ({userIssues.length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="gap-2">
                Drafts ({mockDrafts.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="space-y-4">
              <div className="space-y-4">
                {transformedIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium mb-2">No issues reported yet</p>
                    <p className="text-muted-foreground mb-4">Start by reporting your first civic issue</p>
                    <ReportIssueDialog>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Report Your First Issue
                      </Button>
                    </ReportIssueDialog>
                  </div>
                ) : (
                  transformedIssues.map((issue) => (
                    <div key={issue.id} className="relative">
                      <IssueCard {...issue} onVote={handleVote} />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          {issue.views}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteIssue(issue.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="space-y-4">
                {mockDrafts.map((draft) => (
                  <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{draft.title}</h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{draft.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📍 {draft.location}</span>
                            <span>📅 Last edited {draft.lastEdited}</span>
                            <Badge variant="outline">{draft.completeness}% complete</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${draft.completeness}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-medium">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm">In Progress</span>
                      </div>
                      <span className="font-medium">{stats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Resolved</span>
                      </div>
                      <span className="font-medium">{stats.resolved}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalUpvotes}</div>
                      <p className="text-sm text-muted-foreground">Community Upvotes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalComments}</div>
                      <p className="text-sm text-muted-foreground">Total Comments</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}