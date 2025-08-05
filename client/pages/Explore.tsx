import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasonryGrid } from "@/components/MasonryGrid";
import { useSearch } from "@/contexts/SearchContext";

const trendingHashtags = [
  { tag: "streetlights", count: 45 },
  { tag: "potholes", count: 38 },
  { tag: "safety", count: 32 },
  { tag: "infrastructure", count: 28 },
  { tag: "parking", count: 24 },
  { tag: "cleanliness", count: 22 },
  { tag: "traffic", count: 20 },
  { tag: "parks", count: 18 },
  { tag: "graffiti", count: 15 },
  { tag: "drainage", count: 12 }
];

const exploreItems = [
  {
    id: "1",
    image: "/placeholder.svg",
    title: "Broken Street Light Causing Safety Issues",
    location: "Downtown District",
    upvotes: 45,
    status: "pending" as const,
    hashtags: ["streetlights", "safety", "urgent"]
  },
  {
    id: "2",
    image: "/placeholder.svg",
    title: "Large Pothole Damaging Vehicles",
    location: "Residential Area",
    upvotes: 67,
    status: "in-progress" as const,
    hashtags: ["potholes", "infrastructure", "urgent"]
  },
  {
    id: "3",
    image: "/placeholder.svg",
    title: "Overflowing Trash Bins",
    location: "Market Street",
    upvotes: 23,
    status: "pending" as const,
    hashtags: ["cleanliness", "health", "urgent"]
  },
  {
    id: "4",
    image: "/placeholder.svg",
    title: "Damaged Crosswalk Signal",
    location: "School Zone",
    upvotes: 89,
    status: "resolved" as const,
    hashtags: ["safety", "traffic", "schools"]
  },
  {
    id: "5",
    image: "/placeholder.svg",
    title: "Graffiti on Public Buildings",
    location: "Community Center",
    upvotes: 34,
    status: "in-progress" as const,
    hashtags: ["graffiti", "vandalism", "community"]
  },
  {
    id: "6",
    image: "/placeholder.svg",
    title: "Broken Park Equipment",
    location: "Central Park",
    upvotes: 56,
    status: "pending" as const,
    hashtags: ["parks", "safety", "children"]
  },
  {
    id: "7",
    image: "/placeholder.svg",
    title: "Poor Street Drainage",
    location: "Valley Road",
    upvotes: 28,
    status: "pending" as const,
    hashtags: ["drainage", "flooding", "infrastructure"]
  },
  {
    id: "8",
    image: "/placeholder.svg",
    title: "Illegal Parking Issues",
    location: "Business District",
    upvotes: 41,
    status: "in-progress" as const,
    hashtags: ["parking", "traffic", "enforcement"]
  }
];

export default function Explore() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    navigate(`/issue/${id}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    setSelectedHashtag(selectedHashtag === hashtag ? null : hashtag);
  };

  // Apply both hashtag and search filters
  const filteredItems = useMemo(() => {
    let filtered = [...exploreItems];

    // Apply hashtag filter
    if (selectedHashtag) {
      filtered = filtered.filter(item => item.hashtags.includes(selectedHashtag));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.hashtags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedHashtag, searchQuery]);

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

      {/* Trending Hashtags */}
      <div className="bg-card rounded-lg border p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <h2 className="text-base md:text-lg font-semibold">Trending Topics</h2>
        </div>
        <div className="flex flex-wrap gap-1 md:gap-2">
          {trendingHashtags.map(({ tag, count }) => (
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

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {exploreItems.length} issue{filteredItems.length !== 1 ? 's' : ''}
        {selectedHashtag && ` with #${selectedHashtag}`}
        {searchQuery.trim() && ` matching "${searchQuery}"`}
      </div>

      {/* Masonry Grid */}
      <MasonryGrid items={filteredItems} onItemClick={handleItemClick} />

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Issues
        </Button>
      </div>
    </div>
  );
}
