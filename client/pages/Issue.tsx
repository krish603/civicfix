import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, ThumbsUp, ThumbsDown, Send, Hash, Share, Flag, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { issuesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/notificationService";

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
  updatedAt: string;
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

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  isOfficial: boolean;
  replies?: Comment[];
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "in_progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "under_review": { label: "Under Review", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  duplicate: { label: "Duplicate", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
};

const priorityConfig = {
  low: { label: "Low", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
};

export default function Issue() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);

  // Fetch issue details
  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await issuesApi.getIssue(id);
        
        if (response.success && response.data) {
          setIssue(response.data.issue);
        } else {
          setError(response.message || 'Failed to fetch issue');
        }
      } catch (err: any) {
        console.error('Error fetching issue:', err);
        setError(err.message || 'Failed to fetch issue');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;

      try {
        const response = await issuesApi.getComments(id);
        
        if (response.success && response.data) {
          setComments(response.data.comments);
        }
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        // Don't set error for comments, just log it
      }
    };

    fetchComments();
  }, [id]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on issues",
        variant: "destructive",
      });
      return;
    }

    if (!issue || voting) return;

    try {
      setVoting(true);
      const response = await issuesApi.voteOnIssue(issue._id, voteType);
      
      if (response.success) {
        // Update the issue with new vote counts
        setIssue(prev => prev ? {
          ...prev,
          upvotesCount: response.data.upvotesCount || prev.upvotesCount,
          downvotesCount: response.data.downvotesCount || prev.downvotesCount,
          hasUserVoted: response.data.hasUserVoted
        } : null);

        // Create notification for issue owner
        if (issue.reportedBy._id !== user?.id) {
          if (voteType === 'upvote') {
            await notificationService.notifyUpvoteOnIssue(
              issue.reportedBy._id,
              user?.id || '',
              user?.name || 'Anonymous',
              issue._id,
              issue.title,
              response.data.upvotesCount || issue.upvotesCount
            );
          } else {
            await notificationService.notifyDownvoteOnIssue(
              issue.reportedBy._id,
              user?.id || '',
              user?.name || 'Anonymous',
              issue._id,
              issue.title,
              response.data.downvotesCount || issue.downvotesCount
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
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim() || !issue || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await issuesApi.addComment(issue._id, comment.trim());
      
      if (response.success && response.data) {
        // Add the new comment to the list
        setComments(prev => [response.data.comment, ...prev]);
        setComment("");
        
        // Update comment count
        setIssue(prev => prev ? {
          ...prev,
          commentsCount: prev.commentsCount + 1
        } : null);

        // Create notification for issue owner
        if (issue.reportedBy._id !== user?.id) {
          await notificationService.notifyCommentOnIssue(
            issue.reportedBy._id,
            user?.id || '',
            user?.name || 'Anonymous',
            issue._id,
            issue.title,
            comment.trim()
          );
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/explore">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Button>
        </Link>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading issue details...</div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/explore">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Button>
        </Link>
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="text-lg font-medium mb-2">Error loading issue</p>
            <p className="text-sm">{error || 'Issue not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.pending;
  const priorityInfo = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const primaryImage = issue.images?.find(img => img.isPrimary) || issue.images?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/explore">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Button>
      </Link>

      {/* Main Issue Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{issue.locationAddress}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                <span>by {issue.reportedBy.name}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{issue.viewsCount} views</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
                <Badge className={priorityInfo.className}>
                  {priorityInfo.label} Priority
                </Badge>
                {issue.categoryId && (
                  <Badge variant="outline" className="gap-1">
                    {issue.categoryId.name}
                  </Badge>
                )}
                {issue.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Issue Image */}
          {primaryImage && (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={primaryImage.url}
                alt={primaryImage.altText || issue.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant={issue.hasUserVoted === "upvote" ? "default" : "outline"}
                onClick={() => handleVote("upvote")}
                disabled={voting}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {issue.upvotesCount}
              </Button>
              <Button
                variant={issue.hasUserVoted === "downvote" ? "destructive" : "outline"}
                onClick={() => handleVote("downvote")}
                disabled={voting}
                className="gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                {issue.downvotesCount}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({issue.commentsCount})
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts or experience with this issue..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-20"
                disabled={submittingComment}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment} 
                  disabled={!comment.trim() || submittingComment}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>Please sign in to comment on this issue.</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userId.avatar} />
                    <AvatarFallback>{comment.userId.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.userId.name}</span>
                      {comment.isOfficial && (
                        <Badge variant="outline" className="text-xs">Official</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
