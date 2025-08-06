import { MapPin, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  status: "pending" | "under_review" | "approved" | "in_progress" | "in-progress" | "resolved" | "rejected" | "duplicate";
  upvotes: number;
  downvotes: number;
  createdAt: string;
  hasUserVoted?: "upvote" | "downvote" | null;
  onVote?: (issueId: string, voteType: 'upvote' | 'downvote') => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  under_review: { label: "Under Review", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  duplicate: { label: "Duplicate", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
};

export function IssueCard({
  id,
  title,
  description,
  location,
  image,
  status,
  upvotes,
  downvotes,
  createdAt,
  hasUserVoted,
  onVote
}: IssueCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const { isAuthenticated, openAuthDialog } = useAuth();

  const handleVoteClick = (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      openAuthDialog('signin');
      return;
    }
    if (onVote) {
      onVote(id, voteType);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthDialog('signin');
      return;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-64 flex-shrink-0">
          <div className="aspect-video sm:aspect-square relative overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col">
          <CardContent className="p-3 sm:p-4 flex-1">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 line-clamp-2">{title}</h3>
            <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{description}</p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{createdAt}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 border-t">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Button
                variant={hasUserVoted === "upvote" ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 sm:px-3 flex-1 sm:flex-none"
                onClick={() => handleVoteClick('upvote')}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {upvotes}
              </Button>
              <Button
                variant={hasUserVoted === "downvote" ? "destructive" : "outline"}
                size="sm"
                className="h-8 px-2 sm:px-3 flex-1 sm:flex-none"
                onClick={() => handleVoteClick('downvote')}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {downvotes}
              </Button>
            </div>

            <Link to={`/issue/${id}`} className="w-full sm:w-auto" onClick={handleViewDetails}>
              <Button variant="ghost" size="sm" className="text-primary w-full sm:w-auto">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
