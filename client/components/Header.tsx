import { Search, Plus, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { isAuthenticated, openAuthDialog } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            CF
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">Civicfix</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-10 w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* <ReportIssueDialog>
                <Button className="gap-2 hidden sm:flex">
                  <Plus className="h-4 w-4" />
                  Report Issue
                </Button>
              </ReportIssueDialog>
              <ReportIssueDialog>
                <Button size="icon" className="sm:hidden">
                  <Plus className="h-4 w-4" />
                </Button>
              </ReportIssueDialog> */}
              <NotificationDropdown />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => openAuthDialog('signin')}
                className="gap-2 hidden sm:flex"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => openAuthDialog('signin')}
                className="sm:hidden"
              >
                <LogIn className="h-4 w-4" />
              </Button>
              <Button onClick={() => openAuthDialog('signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
