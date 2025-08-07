import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/use-toast";

interface MasonryItem {
  id: string;
  image: string;
  title: string;
  location: string;
  upvotes: number;
  downvotes?: number;
  status: "pending" | "in-progress" | "resolved" | "in_progress" | "under_review" | "approved" | "rejected" | "duplicate";
  hashtags: string[];
  priority?: string;
  views?: number;
  comments?: number;
  createdAt?: string;
  hasUserVoted?: 'upvote' | 'downvote' | null;
  reporter?: string;
  category?: string;
}

interface MasonryGridProps {
  items: MasonryItem[];
  onItemClick: (id: string) => void;
  onVote?: (issueId: string, voteType: 'upvote' | 'downvote') => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "in_progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "under_review": { label: "Under Review", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  duplicate: { label: "Duplicate", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
};

const priorityConfig = {
  low: { label: "Low", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
};

export function MasonryGrid({ items, onItemClick, onVote }: MasonryGridProps) {
  const { isAuthenticated, openAuthDialog } = useAuth();
  const { toast } = useToast();
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({});

  const handleItemClick = (id: string) => {
    if (!isAuthenticated) {
      openAuthDialog('signin');
      return;
    }
    onItemClick(id);
  };

  const handleVote = async (e: React.MouseEvent, issueId: string, voteType: 'upvote' | 'downvote') => {
    e.stopPropagation(); // Prevent item click
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on issues",
        variant: "destructive",
      });
      return;
    }

    if (!onVote) return;

    try {
      setVotingStates(prev => ({ ...prev, [issueId]: true }));
      await onVote(issueId, voteType);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVotingStates(prev => ({ ...prev, [issueId]: false }));
    }
  };

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
      {items.map((item) => {
        const statusInfo = statusConfig[item.status] || statusConfig.pending;
        const priorityInfo = item.priority ? priorityConfig[item.priority as keyof typeof priorityConfig] : null;

        return (
          <div
            key={item.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => handleItemClick(item.id)}
          >
            <div className="relative overflow-hidden rounded-lg bg-card border hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: `${Math.random() * 0.5 + 0.7}` }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                
                {/* Status and Priority Badges */}
                <div className="absolute top-1 right-1 md:top-2 md:right-2 flex flex-col gap-1">
                  <Badge className={`${statusInfo.className} text-xs`}>
                    {statusInfo.label}
                  </Badge>
                  {priorityInfo && (
                    <Badge className={`${priorityInfo.className} text-xs`}>
                      {priorityInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2">
                  <div className="bg-background/90 backdrop-blur-sm rounded-md p-1.5 md:p-2">
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.location}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between mt-1 md:mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">👍 {item.upvotes}</span>
                        {item.downvotes !== undefined && (
                          <span className="text-xs text-muted-foreground">👎 {item.downvotes}</span>
                        )}
                        {item.views !== undefined && (
                          <span className="text-xs text-muted-foreground">👁 {item.views}</span>
                        )}
                      </div>
                      
                      {/* Voting Buttons */}
                      {onVote && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={item.hasUserVoted === "upvote" ? "default" : "outline"}
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleVote(e, item.id, "upvote")}
                            disabled={votingStates[item.id]}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={item.hasUserVoted === "downvote" ? "destructive" : "outline"}
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleVote(e, item.id, "downvote")}
                            disabled={votingStates[item.id]}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.hashtags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Additional Info */}
                    {(item.reporter || item.category) && (
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        {item.reporter && <span>by {item.reporter}</span>}
                        {item.category && <span>{item.category}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
