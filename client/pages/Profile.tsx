import { useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, Award, TrendingUp, MessageCircle, Settings, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IssueCard } from "@/components/IssueCard";

const mockUserProfile = {
  id: "user-sarah",
  name: "Sarah Johnson",
  avatar: "/placeholder.svg",
  bio: "Community advocate and local resident passionate about civic improvement. Working to make our neighborhood safer and more accessible for everyone.",
  location: "Downtown District",
  joinedDate: "January 2023",
  stats: {
    totalReports: 12,
    resolvedIssues: 8,
    totalUpvotes: 284,
    communityRank: "Community Champion",
    helpfulVotes: 156
  },
  badges: [
    { name: "First Reporter", description: "First to report an issue", icon: "🎯" },
    { name: "Problem Solver", description: "5+ resolved issues", icon: "🔧" },
    { name: "Community Champion", description: "High community engagement", icon: "🏆" },
    { name: "Trend Setter", description: "100+ upvotes received", icon: "📈" }
  ],
  recentActivity: [
    {
      id: "activity-1",
      type: "report",
      title: "Reported broken street light",
      date: "2 days ago",
      status: "in-progress"
    },
    {
      id: "activity-2", 
      type: "comment",
      title: "Commented on pothole issue",
      date: "3 days ago",
      status: "resolved"
    },
    {
      id: "activity-3",
      type: "upvote",
      title: "Upvoted graffiti removal request",
      date: "1 week ago",
      status: "pending"
    }
  ]
};

const mockUserReports = [
  {
    id: "user-report-1",
    title: "Broken Street Light on Main Street",
    description: "Street light malfunctioning at busy intersection.",
    location: "Main Street & Oak Avenue",
    image: "/placeholder.svg",
    status: "in-progress" as const,
    upvotes: 24,
    downvotes: 2,
    createdAt: "2 days ago",
    hasUserVoted: null as null
  },
  {
    id: "user-report-2",
    title: "Graffiti on Community Center",
    description: "Vandalism on public building needs cleanup.",
    location: "Community Center, Park Ave",
    image: "/placeholder.svg",
    status: "resolved" as const,
    upvotes: 15,
    downvotes: 0,
    createdAt: "1 week ago",
    hasUserVoted: null as null
  }
];

export default function Profile() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const isOwnProfile = !userId || userId === "me"; // If no userId or "me", show own profile

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={mockUserProfile.avatar} />
                <AvatarFallback>{mockUserProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold">{mockUserProfile.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{mockUserProfile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Joined {mockUserProfile.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-muted-foreground mb-4 text-sm md:text-base">{mockUserProfile.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-primary">{mockUserProfile.stats.totalReports}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-green-600">{mockUserProfile.stats.resolvedIssues}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">{mockUserProfile.stats.totalUpvotes}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Upvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-purple-600">{mockUserProfile.stats.helpfulVotes}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Helpful</div>
                </div>
              </div>

              {/* Community Rank */}
              <div className="mb-4">
                <Badge variant="default" className="gap-1 text-xs">
                  <Award className="h-3 w-3" />
                  {mockUserProfile.stats.communityRank}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button className="gap-2 flex-1 sm:flex-none">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                      <Share className="h-4 w-4" />
                      Share Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports ({mockUserReports.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Achievement Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Achievement Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="font-medium">
                    {Math.round((mockUserProfile.stats.resolvedIssues / mockUserProfile.stats.totalReports) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Community Impact</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Upvotes per Report</span>
                  <span className="font-medium">
                    {Math.round(mockUserProfile.stats.totalUpvotes / mockUserProfile.stats.totalReports)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {mockUserProfile.badges.slice(0, 4).map((badge, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <span className="text-lg">{badge.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUserProfile.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <span className="text-sm">{activity.title}</span>
                      <div className="text-xs text-muted-foreground">{activity.date}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-4">
            {mockUserReports.map((report) => (
              <IssueCard key={report.id} {...report} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockUserProfile.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="h-3 w-3 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <Badge variant="outline">{activity.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUserProfile.badges.map((badge, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{badge.icon}</div>
                    <div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
