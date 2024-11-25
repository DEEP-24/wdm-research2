"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import {
  ArrowUpDownIcon,
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  CalendarCheck2Icon,
  CalendarIcon,
  ChevronDownIcon,
  DollarSignIcon,
  FileTextIcon,
  FolderKanbanIcon,
  HelpCircle,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  ScanEyeIcon,
  UserIcon,
  Users2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const roleBasedSidebarItems = {
  user: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Reservations", href: "/reservations" },
    { label: "Projects", href: "/projects" },
    { label: "Review Projects", href: "/review" },
    { label: "File Sharing", href: "/file-sharing" },
    { label: "Forums", href: "/forums" },
    { label: "Funding Opportunities", href: "/funding-opportunities" },
    { label: "Grant Applications", href: "/grant-applications" },
    { label: "Support", href: "/support" },
    { label: "Researchers", href: "/researchers" },
    { label: "Chat", href: "/chat" },
  ],
  admin: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Reservations", href: "/reservations" },
    { label: "Projects", href: "/projects" },
    { label: "Review Projects", href: "/review" },
    { label: "File Sharing", href: "/file-sharing" },
    { label: "Forums", href: "/forums" },
    { label: "Funding Opportunities", href: "/funding-opportunities" },
    { label: "Grant Applications", href: "/grant-applications" },
    { label: "Support", href: "/support" },
    { label: "Researchers", href: "/researchers" },
    { label: "Investment Opportunities", href: "/investment-opportunities" },
    { label: "Chat", href: "/chat" },
  ],
  investor: [
    { label: "Home", href: "/" },
    { label: "Investment Opportunities", href: "/investment-opportunities" },
    { label: "My Investments", href: "/investments" },
    { label: "Support", href: "/support" },
    { label: "Chat", href: "/chat" },
  ],
  organizer: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Reservations", href: "/reservations" },
    { label: "Support", href: "/support" },
    { label: "Chat", href: "/chat" },
  ],
};

const isValidRole = (role: string): role is keyof typeof roleBasedSidebarItems => {
  return ["user", "admin", "investor", "organizer"].includes(role);
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!mounted) {
        return;
      }

      try {
        const response = await fetch("/api/auth/user");

        if (!response.ok) {
          setIsLoading(false);
          router.push("/login");
          return;
        }

        const userData = await response.json();
        setCurrentUser(userData);
      } catch (_error) {
        toast.error("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted, router, pathname]);

  if (typeof window === "undefined") {
    return null;
  }

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser && !["/login", "/register"].includes(pathname)) {
    return null;
  }

  if (currentUser && ["/login", "/register"].includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setCurrentUser(null);
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSidebarItemClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const getSidebarItems = () => {
    if (!currentUser || !currentUser.role) {
      return roleBasedSidebarItems.user;
    }

    const userRole = currentUser.role.toLowerCase() as keyof typeof roleBasedSidebarItems;

    if (isValidRole(userRole)) {
      return roleBasedSidebarItems[userRole];
    }

    return roleBasedSidebarItems.user;
  };

  const sidebarItems = currentUser ? getSidebarItems() : roleBasedSidebarItems.user;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation - Updated padding */}
      <header className="bg-[#6B9B76] sticky top-0 z-40">
        <div className="flex items-center justify-between px-3 h-20 max-w-[1400px] mx-auto">
          {/* Logo - Added responsive text size */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-2xl font-bold px-2 py-2 rounded-md whitespace-nowrap">
              <span className="text-white">Research</span>
              <span className="text-white ml-2">Collaboration</span>
            </h1>
          </div>

          {/* Main Navigation - Desktop - Updated hover states */}
          <nav className="hidden lg:flex items-center justify-center space-x-1 flex-1">
            {sidebarItems.slice(0, 6).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "text-white/90 hover:text-white hover:bg-white/10 h-12 px-6 text-base font-medium",
                    pathname === item.href && "bg-white/20 text-white",
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            {sidebarItems.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-blue-50 hover:text-white hover:bg-white/10 h-12 px-6 text-base font-medium"
                  >
                    More
                    <ChevronDownIcon className="ml-2 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {sidebarItems.slice(6).map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center w-full py-2 text-base">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4 min-w-[200px] justify-end">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </Button>

            {/* User menu */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-white hover:bg-white/10 h-11"
                  >
                    <Avatar>
                      <AvatarImage src={currentUser?.imageURL} alt={currentUser.firstName} />
                      <AvatarFallback className="bg-white/10 text-white">
                        {`${currentUser.firstName[0]}${currentUser.lastName[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{currentUser.firstName}</span>
                    <ChevronDownIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - Updated background color */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <nav className="fixed top-0 left-0 bottom-0 w-64 bg-[#6B9B76] p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold">
                <span className="text-white">Research</span>
                <span className="text-white ml-2">Collaboration</span>
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <XIcon className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-white hover:bg-white/10 h-12 text-base font-medium",
                        pathname === item.href ? "bg-white/20" : "",
                      )}
                      onClick={handleSidebarItemClick}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6">
          <div className="pb-16 md:pb-0">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#6B9B76]/20 p-4 text-center text-sm text-gray-600">
        © 2024 Research Collaboration Website. All Rights Reserved.
      </footer>
    </div>
  );
}
