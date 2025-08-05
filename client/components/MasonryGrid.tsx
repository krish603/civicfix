import { useState } from "react";
import { Badge } from "./ui/badge";

interface MasonryItem {
  id: string;
  image: string;
  title: string;
  location: string;
  upvotes: number;
  status: "pending" | "in-progress" | "resolved";
  hashtags: string[];
}

interface MasonryGridProps {
  items: MasonryItem[];
  onItemClick: (id: string) => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
};

export function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
      {items.map((item) => {
        const statusInfo = statusConfig[item.status];

        return (
          <div
            key={item.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => onItemClick(item.id)}
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
                <div className="absolute top-1 right-1 md:top-2 md:right-2">
                  <Badge className={`${statusInfo.className} text-xs`}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2">
                  <div className="bg-background/90 backdrop-blur-sm rounded-md p-1.5 md:p-2">
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.location}</p>
                    <div className="flex items-center justify-between mt-1 md:mt-2">
                      <span className="text-xs text-muted-foreground">👍 {item.upvotes}</span>
                      <div className="flex flex-wrap gap-1">
                        {item.hashtags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
