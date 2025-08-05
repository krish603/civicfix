import { useState } from "react";
import { Camera, MapPin, Hash, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

const predefinedTags = [
  "streetlights", "potholes", "safety", "infrastructure", "parking", 
  "cleanliness", "traffic", "parks", "graffiti", "drainage", "urgent",
  "accessibility", "noise", "construction", "vandalism"
];

const categories = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "safety", label: "Safety & Security" },
  { value: "environment", label: "Environment" },
  { value: "transportation", label: "Transportation" },
  { value: "community", label: "Community Services" },
  { value: "other", label: "Other" }
];

interface ReportIssueDialogProps {
  children: React.ReactNode;
}

export function ReportIssueDialog({ children }: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    hashtags: [] as string[],
    image: null as File | null
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleAddHashtag = (tag: string) => {
    if (!formData.hashtags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag]
      }));
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Submitting issue:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      title: "",
      description: "",
      location: "",
      category: "",
      hashtags: [],
      image: null
    });
  };

  const isValid = formData.title && formData.description && formData.location && formData.category;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Report New Issue</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Street address, intersection, or landmark..."
                className="pl-10"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue, including when you noticed it, how it affects the community, and any safety concerns..."
              className="min-h-24"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label htmlFor="image" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {formData.image ? (
                    <>
                      <Upload className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {formData.image.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Click to change image
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Add a photo</span>
                      <span className="text-xs text-muted-foreground">
                        Images help officials understand the issue better
                      </span>
                    </>
                  )}
                </div>
              </Label>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <Label>Tags (Optional)</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.hashtags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => 
                      formData.hashtags.includes(tag) 
                        ? handleRemoveHashtag(tag)
                        : handleAddHashtag(tag)
                    }
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              {formData.hashtags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Selected tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.hashtags.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveHashtag(tag)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
