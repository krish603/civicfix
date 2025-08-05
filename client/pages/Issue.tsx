import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, ThumbsUp, ThumbsDown, Send, Hash, Share, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockIssue = {
  id: "1",
  title: "Broken Street Light Causing Safety Issues at Main Street Intersection",
  description: "The street light at the intersection of Main Street and Oak Avenue has been malfunctioning for over two weeks now. This intersection is particularly busy during evening hours with both pedestrian and vehicle traffic. The lack of proper lighting is creating a serious safety hazard, especially for children walking home from school and elderly residents. Several near-miss incidents have been reported by local residents. The light appears to have electrical issues as it occasionally flickers but mostly remains off. This is a high-priority safety concern that needs immediate attention from the city maintenance department.",
  location: "Main Street & Oak Avenue, Downtown",
  image: "/placeholder.svg",
  status: "pending" as const,
  upvotes: 67,
  downvotes: 3,
  createdAt: "March 15, 2024",
  author: "Sarah Johnson",
  hashtags: ["streetlights", "safety", "urgent", "downtown"],
  hasUserVoted: null as "up" | "down" | null
};

const mockComments = [
  {
    id: "1",
    author: "Mike Chen",
    avatar: "/placeholder.svg",
    content: "I completely agree! I nearly had an accident there last Tuesday evening. This definitely needs immediate attention.",
    createdAt: "2 days ago",
    likes: 12
  },
  {
    id: "2", 
    author: "Lisa Rodriguez",
    avatar: "/placeholder.svg",
    content: "Has anyone contacted the city about this? I can call the municipal office tomorrow if no one has reached out yet.",
    createdAt: "1 day ago",
    likes: 8
  },
  {
    id: "3",
    author: "David Park",
    avatar: "/placeholder.svg", 
    content: "I've reported this to the city three times already. They keep saying it's 'under review' but nothing happens. Maybe if more people report it they'll take action.",
    createdAt: "1 day ago",
    likes: 15
  }
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
};

export default function Issue() {
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const [hasUserVoted, setHasUserVoted] = useState<"up" | "down" | null>(mockIssue.hasUserVoted);
  
  const statusInfo = statusConfig[mockIssue.status];

  const handleVote = (type: "up" | "down") => {
    if (hasUserVoted === type) {
      setHasUserVoted(null);
    } else {
      setHasUserVoted(type);
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      // Add comment logic here
      setComment("");
    }
  };

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
              <h1 className="text-2xl font-bold mb-2">{mockIssue.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{mockIssue.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{mockIssue.createdAt}</span>
                </div>
                <span>by {mockIssue.author}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {mockIssue.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Issue Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={mockIssue.image}
              alt={mockIssue.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{mockIssue.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant={hasUserVoted === "up" ? "default" : "outline"}
                onClick={() => handleVote("up")}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {mockIssue.upvotes + (hasUserVoted === "up" ? 1 : 0)}
              </Button>
              <Button
                variant={hasUserVoted === "down" ? "destructive" : "outline"}
                onClick={() => handleVote("down")}
                className="gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                {mockIssue.downvotes + (hasUserVoted === "down" ? 1 : 0)}
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
          <h2 className="text-xl font-semibold">Comments ({mockComments.length})</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts or experience with this issue..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment} 
                disabled={!comment.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
