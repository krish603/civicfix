import { useState } from "react";
import { Plus, Calendar, TrendingUp, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueCard } from "@/components/IssueCard";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";

const mockUserIssues = [
  {
    id: "user-1",
    title: "Broken Street Light on Main Street",
    description: "The street light at the intersection of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians and drivers.",
    location: "Main Street & Oak Avenue, Downtown",
    image: "/placeholder.svg",
    status: "in-progress" as const,
    upvotes: 24,
    downvotes: 2,
    createdAt: "2 days ago",
    hasUserVoted: null as null,
    views: 156,
    comments: 8
  },
  {
    id: "user-2",
    title: "Graffiti on Public Building",
    description: "The community center building has been vandalized with graffiti on the east wall facing the parking lot.",
    location: "Community Center, 123 Park Ave",
    image: "/placeholder.svg",
    status: "resolved" as const,
    upvotes: 15,
    downvotes: 0,
    createdAt: "1 week ago",
    hasUserVoted: null as null,
    views: 89,
    comments: 3
  },
  {
    id: "user-3",
    title: "Overflowing Trash Bin at Bus Stop",
    description: "The trash bin at the bus stop on Pine Street is constantly overflowing, attracting pests and creating unsanitary conditions.",
    location: "Pine Street Bus Stop",
    image: "/placeholder.svg",
    status: "pending" as const,
    upvotes: 18,
    downvotes: 3,
    createdAt: "3 days ago",
    hasUserVoted: null as null,
    views: 67,
    comments: 5
  }
];

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

  const stats = {
    totalReports: mockUserIssues.length,
    resolved: mockUserIssues.filter(issue => issue.status === "resolved").length,
    pending: mockUserIssues.filter(issue => issue.status === "pending").length,
    inProgress: mockUserIssues.filter(issue => issue.status === "in-progress").length,
    totalViews: mockUserIssues.reduce((sum, issue) => sum + (issue.views || 0), 0),
    totalUpvotes: mockUserIssues.reduce((sum, issue) => sum + issue.upvotes, 0)
  };

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
            Published ({mockUserIssues.length})
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
            {mockUserIssues.map((issue) => (
              <div key={issue.id} className="relative">
                <IssueCard {...issue} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {issue.views}
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
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
                  <div className="text-2xl font-bold text-blue-600">
                    {mockUserIssues.reduce((sum, issue) => sum + (issue.comments || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
