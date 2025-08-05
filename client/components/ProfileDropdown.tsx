import { User, Settings, FileText, LogOut, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  avatar: "/placeholder.svg",
  role: "Community Champion"
};

export function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={mockUser.avatar} />
            <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 p-2">
        {/* User Info */}
        <div className="p-2 mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Award className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">{mockUser.role}</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <Link to="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="h-4 w-4 mr-3" />
            <span>View Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/my-reports">
          <DropdownMenuItem className="cursor-pointer">
            <FileText className="h-4 w-4 mr-3" />
            <span>My Reports</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="h-4 w-4 mr-3" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-3" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
