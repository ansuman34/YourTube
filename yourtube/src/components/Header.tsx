import {
  Bell,
  Clock,
  Download,
  History,
  Home,
  Menu,
  Search,
  User,
  VideoIcon,
  X,
  ThumbsUp,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const { user, logout, handlegooglesignin } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const handleNotificationClick = () => {
    if (!user) {
      toast.message("Please sign in first.");
      return;
    }
    toast.message("No new notifications");
  };

  const handleUploadClick = () => {
    if (!user) {
      toast.message("Please sign in first.");
      return;
    }
    router.push("/upload");
  };
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-white/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="inline-flex sm:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <Link href="/" className="flex shrink-0 items-center gap-1">
          <div className="rounded bg-red-600 p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-lg font-semibold sm:text-xl">YourTube</span>
          <span className="ml-1 hidden text-xs text-gray-400 sm:inline">IN</span>
        </Link>
      </div>
      <form
        onSubmit={handleSearch}
        className="mx-0 flex max-w-2xl flex-1 items-center gap-2 sm:mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-l-full border-r-0 text-sm focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="h-9 rounded-r-full border border-l-0 bg-gray-50 px-3 text-gray-600 hover:bg-gray-100 sm:px-5"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </form>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {user ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={handleUploadClick}
            >
              <VideoIcon className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={handleNotificationClick}
            >
              <Bell className="w-6 h-6" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className="flex h-9 items-center gap-2 rounded-full px-3 sm:px-4"
              onClick={handlegooglesignin}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          </>
        )}{" "}
      </div>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
      {isMobileMenuOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-t bg-white shadow-sm sm:hidden">
          <div className="space-y-1 px-3 py-3">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-3 h-4 w-4" />
                Home
              </Button>
            </Link>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleUploadClick}
                >
                  <VideoIcon className="mr-3 h-4 w-4" />
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleNotificationClick}
                >
                  <Bell className="mr-3 h-4 w-4" />
                  Notifications
                </Button>
                <Link href="/history">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="mr-3 h-4 w-4" />
                    History
                  </Button>
                </Link>
                <Link href="/liked">
                  <Button variant="ghost" className="w-full justify-start">
                    <ThumbsUp className="mr-3 h-4 w-4" />
                    Liked
                  </Button>
                </Link>
                <Link href="/watch-later">
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="mr-3 h-4 w-4" />
                    Watch later
                  </Button>
                </Link>
                <Link href="/downloads">
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="mr-3 h-4 w-4" />
                    Downloads
                  </Button>
                </Link>
                {user?.channelname ? (
                  <Link href={`/channel/${user._id}`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-3 h-4 w-4" />
                      Your channel
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setisdialogeopen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Create channel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handlegooglesignin();
                  setIsMobileMenuOpen(false);
                }}
              >
                <User className="mr-3 h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
