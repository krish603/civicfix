import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, Award, MessageCircle, Settings, Share, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IssueCard } from "@/components/IssueCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authApi, issuesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/notificationService";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalReports: number;
  resolvedIssues: number;
  totalUpvotes: number;
  helpfulVotes: number;
  communityRank: string;
}

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
  reportedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface UserActivity {
  _id: string;
  type: 'report' | 'comment' | 'vote';
  title: string;
  date: string;
  status: string;
  issueId?: string;
}

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userIssues, setUserIssues] = useState<UserIssue[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: ''
  });

  const isOwnProfile = !userId || userId === "me" || userId === currentUser?.id;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let profileResponse;
        if (isOwnProfile) {
          // Fetch current user's profile
          profileResponse = await authApi.getProfile();
        } else {
          // Fetch other user's profile (you'll need to implement this endpoint)
          // For now, we'll use the current user's profile
          profileResponse = await authApi.getProfile();
        }

        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data.user || profileResponse.data;
          setUserProfile(profile);
          setProfileData({
            name: profile.name,
            bio: profile.bio || '',
            location: profile.location
          });
        } else {
          setError(profileResponse.message || 'Failed to fetch profile');
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, isOwnProfile]);

  // Fetch user's issues
  useEffect(() => {
    const fetchUserIssues = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await issuesApi.getUserIssues();
        
        if (response.success && response.data) {
          setUserIssues(response.data);
          
          // Calculate stats from issues
          const stats: UserStats = {
            totalReports: response.data.length,
            resolvedIssues: response.data.filter((issue: UserIssue) => issue.status === "resolved").length,
            totalUpvotes: response.data.reduce((sum: number, issue: UserIssue) => sum + (issue.upvotesCount || 0), 0),
            helpfulVotes: response.data.reduce((sum: number, issue: UserIssue) => sum + (issue.commentsCount || 0), 0),
            communityRank: getCommunityRank(response.data.length, response.data.filter((issue: UserIssue) => issue.status === "resolved").length)
          };
          setUserStats(stats);
        }
      } catch (err: any) {
        console.error('Error fetching user issues:', err);
        // Don't set error for issues, just log it
      }
    };

    fetchUserIssues();
  }, [isAuthenticated]);

  // Generate mock activity data (in a real app, this would come from the database)
  useEffect(() => {
    if (userIssues.length > 0) {
      const activity: UserActivity[] = userIssues.slice(0, 5).map((issue, index) => ({
        _id: `activity-${index}`,
        type: 'report' as const,
        title: `Reported: ${issue.title}`,
        date: formatDate(issue.createdAt),
        status: issue.status,
        issueId: issue._id
      }));
      setUserActivity(activity);
    }
  }, [userIssues]);

  const getCommunityRank = (totalReports: number, resolvedIssues: number): string => {
    if (totalReports === 0) return "New Member";
    if (resolvedIssues >= 10) return "Community Champion";
    if (resolvedIssues >= 5) return "Problem Solver";
    if (totalReports >= 5) return "Active Reporter";
    return "Community Member";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setEditingProfile(true);
      const response = await authApi.updateProfile(profileData);
      
      if (response.success && response.data) {
        setUserProfile(response.data.user);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setEditingProfile(false);
    }
  };

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
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

        // Create notification for issue owner (if voting on someone else's issue)
        const issue = userIssues.find(i => i._id === issueId);
        if (issue && issue.reportedBy._id !== currentUser?.id) {
          if (voteType === 'upvote') {
            await notificationService.notifyUpvoteOnIssue(
              issue.reportedBy._id,
              currentUser?.id || '',
              currentUser?.name || 'Anonymous',
              issue._id,
              issue.title,
              response.data.upvotesCount
            );
          } else {
            await notificationService.notifyDownvoteOnIssue(
              issue.reportedBy._id,
              currentUser?.id || '',
              currentUser?.name || 'Anonymous',
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

  // Transform API data to match IssueCard expectations
  const transformedIssues = userIssues.map(issue => ({
    id: issue._id,
    title: issue.title,
    description: issue.description,
    location: issue.locationAddress,
    image: issue.images?.[0]?.url || "/placeholder.svg",
    status: (issue.status === 'in_progress' ? 'in-progress' : issue.status) as "in_progress" | "in-progress" | "resolved" | "pending" | "under_review" | "approved" | "rejected" | "duplicate",
    upvotes: issue.upvotesCount || 0,
    downvotes: issue.downvotesCount || 0,
    createdAt: formatDate(issue.createdAt),
    hasUserVoted: issue.hasUserVoted,
    priority: issue.priority,
    views: issue.viewsCount || 0,
    comments: issue.commentsCount || 0
  }));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="text-lg font-medium mb-2">Error loading profile</p>
            <p className="text-sm">{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold">{profileData.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Joined {formatDate(userProfile.createdAt)}</span>
                </div>
                {userProfile.isVerified && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                {profileData.bio || "No bio available."}
              </p>

              {/* Stats */}
              {userStats && (
                <>
                  <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-primary">{userStats.totalReports}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-green-600">{userStats.resolvedIssues}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-blue-600">{userStats.totalUpvotes}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Upvotes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-purple-600">{userStats.helpfulVotes}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Comments</div>
                    </div>
                  </div>

                  {/* Community Rank */}
                  <div className="mb-4">
                    <Badge variant="default" className="gap-1 text-xs">
                      <Award className="h-3 w-3" />
                      {userStats.communityRank}
                    </Badge>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {isOwnProfile ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 w-full sm:w-auto">
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="submit" disabled={editingProfile}>
                            {editingProfile ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Reports ({userIssues.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {userIssues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium mb-2">No reports yet</p>
              <p className="text-muted-foreground">Start by reporting your first civic issue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedIssues.map((report) => (
                <IssueCard key={report.id} {...report} onVote={handleVote} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {userActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userActivity.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="h-3 w-3 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant="outline">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}