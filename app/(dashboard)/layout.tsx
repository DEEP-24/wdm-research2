"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  SearchIcon,
  SendIcon,
  UserIcon,
  Users2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const roleBasedSidebarItems = {
  user: [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: CalendarIcon, label: "Events", href: "/events" },
    { icon: CalendarCheck2Icon, label: "Reservations", href: "/reservations" },
    { icon: FolderKanbanIcon, label: "Projects", href: "/projects" },
    { icon: ScanEyeIcon, label: "Review Projects", href: "/review" },
    { icon: ArrowUpDownIcon, label: "File Sharing", href: "/file-sharing" },
    { icon: MessageCircleIcon, label: "Forums", href: "/forums" },
    { icon: BadgeDollarSignIcon, label: "Funding Opportunities", href: "/funding-opportunities" },
    { icon: FileTextIcon, label: "Grant Applications", href: "/grant-applications" },
    { icon: HelpCircle, label: "Support", href: "/support" },
    { icon: Users2Icon, label: "Researchers", href: "/researchers" },
    { icon: MessageSquareIcon, label: "Chat", href: "/chat" },
  ],
  admin: [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: CalendarIcon, label: "Events", href: "/events" },
    { icon: CalendarCheck2Icon, label: "Reservations", href: "/reservations" },
    { icon: FolderKanbanIcon, label: "Projects", href: "/projects" },
    { icon: ScanEyeIcon, label: "Review Projects", href: "/review" },
    { icon: ArrowUpDownIcon, label: "File Sharing", href: "/file-sharing" },
    { icon: MessageCircleIcon, label: "Forums", href: "/forums" },
    { icon: BadgeDollarSignIcon, label: "Funding Opportunities", href: "/funding-opportunities" },
    { icon: FileTextIcon, label: "Grant Applications", href: "/grant-applications" },
    { icon: HelpCircle, label: "Support", href: "/support" },
    { icon: Users2Icon, label: "Researchers", href: "/researchers" },
    { icon: DollarSignIcon, label: "Investment Opportunities", href: "/investment-opportunities" },
    { icon: MessageSquareIcon, label: "Chat", href: "/chat" },
  ],
  investor: [
    { icon: HomeIcon, label: "Home", href: "/" },
    {
      icon: BriefcaseBusinessIcon,
      label: "Investment Opportunities",
      href: "/investment-opportunities",
    },
    { icon: BriefcaseBusinessIcon, label: "My Investments", href: "/investments" },
    { icon: HelpCircle, label: "Support", href: "/support" },
    { icon: MessageSquareIcon, label: "Chat", href: "/chat" },
  ],
  organizer: [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: CalendarIcon, label: "Events", href: "/events" },
    { icon: CalendarCheck2Icon, label: "Reservations", href: "/reservations" },
    { icon: HelpCircle, label: "Support", href: "/support" },
    { icon: MessageSquareIcon, label: "Chat", href: "/chat" },
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
      // biome-ignore lint/style/useBlockStatements: <explanation>
      if (!mounted) return;

      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          throw new Error("Auth failed");
        }
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted, router]);

  if (typeof window === "undefined") {
    return null;
  }

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 lg:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-700 to-indigo-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:justify-center">
            <h1 className="text-2xl font-bold flex items-center bg-blue-800 rounded-lg px-4 py-2">
              <span className="text-blue-300 mr-1">R</span>
              <span className="text-white">Sphere</span>
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-blue-600"
            >
              <XIcon className="h-6 w-6" />
            </Button>
          </div>
          <ScrollArea className="flex-1 px-4 mt-3">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start font-semibold text-white hover:bg-blue-600 hover:text-white transition-colors ${
                      pathname === item.href ? "bg-white/30" : ""
                    }`}
                    onClick={handleSidebarItemClick}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-blue-200 p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="lg:hidden mr-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-semibold text-blue-700 hidden sm:block">
              {sidebarItems.find((item) => item.href === pathname)?.label}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
              <Input
                className="pl-10 w-64 bg-blue-50 border-blue-300 focus:border-blue-500 transition-all"
                type="search"
                placeholder="Search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={currentUser.imageURL} alt={currentUser.firstName} />
                    <AvatarFallback className="bg-blue-200 text-blue-700">
                      {currentUser.firstName[0]}
                      {currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-blue-700">
                    {currentUser.firstName}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-blue-700" />
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="pb-16 md:pb-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
