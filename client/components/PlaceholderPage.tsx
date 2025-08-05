import { Construction } from "lucide-react";
import { Button } from "./ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-4 rounded-full bg-muted">
        <Construction className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        {description}
      </p>
      <p className="text-sm text-muted-foreground">
        This page is under construction. Continue chatting to request implementation of this feature.
      </p>
      <Button variant="outline">
        Request Feature Implementation
      </Button>
    </div>
  );
}
