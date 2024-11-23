"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";
import {
  ArrowRightIcon,
  BadgeDollarSignIcon,
  BriefcaseIcon,
  CalendarIcon,
  FileIcon,
  FileTextIcon,
  MessageCircleIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import moment from "moment";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const activityData = [
  { name: "Mon", value: 10 },
  { name: "Tue", value: 15 },
  { name: "Wed", value: 8 },
  { name: "Thu", value: 12 },
  { name: "Fri", value: 20 },
  { name: "Sat", value: 5 },
  { name: "Sun", value: 3 },
];

const platformFeatures = [
  {
    title: "Research Hub",
    description: "Access and share research papers, data, and findings securely.",
    icon: FileIcon,
    href: "/file-sharing",
  },
  {
    title: "Research Community",
    description: "Connect and collaborate with researchers in your field.",
    icon: MessageCircleIcon,
    href: "/forums",
  },
  {
    title: "Research Events",
    description: "Discover conferences, seminars, and workshops.",
    icon: CalendarIcon,
    href: "/events",
  },
  {
    title: "Research Funding",
    description: "Find grants and funding opportunities for your research.",
    icon: BadgeDollarSignIcon,
    href: "/funding-opportunities",
  },
];

const quickLinks = {
  adminUser: [
    { title: "Upcoming Events", href: "/events", icon: CalendarIcon },
    { title: "My Reservations", href: "/reservations", icon: FileTextIcon },
    { title: "Research Projects", href: "/projects", icon: BriefcaseIcon },
    { title: "User Profile", href: "/profile", icon: UsersIcon },
  ],
  investor: [
    {
      title: "Investment Opportunities",
      href: "/investment-opportunities",
      icon: BadgeDollarSignIcon,
    },
    { title: "My Investments", href: "/investments", icon: BriefcaseIcon },
    { title: "User Profile", href: "/profile", icon: UsersIcon },
  ],
  organizer: [
    { title: "Manage Events", href: "/events", icon: CalendarIcon },
    { title: "Reservations", href: "/reservations", icon: FileTextIcon },
    { title: "User Profile", href: "/profile", icon: UsersIcon },
  ],
};

const projects = [
  {
    name: "RocketChat",
    description: "Open source team chat solution with real-time conversations",
    link: "https://github.com/RocketChat/Rocket.Chat",
  },
  {
    name: "Umami Analytics",
    description: "Privacy-focused alternative to Google Analytics",
    link: "https://github.com/umami-software/umami",
  },
  {
    name: "Plausible",
    description: "Simple, privacy-friendly web analytics platform",
    link: "https://github.com/plausible/analytics",
  },
];

// Update the Event interface at the top of the file
interface Event {
  id: number;
  title: string;
  start_date: Date;
  // ... other properties ...
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [latestNews, setLatestNews] = useState<Event[]>([]);
  const [reservations, setReservations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await fetch("/api/auth/user");
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user");
        }
        const userData = await userResponse.json();
        if (userData) {
          setCurrentUser(userData);
        } else {
          router.push("/login");
        }

        // Fetch events
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData);

          const sortedEvents = [...eventsData]
            .sort((a, b) => moment(b.start_date).diff(moment(a.start_date)))
            .slice(0, 3);
          setLatestNews(sortedEvents);
        }

        // Fetch reservations
        const reservationsResponse = await fetch("/api/reservations");
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [router]);

  if (!currentUser) {
    return null;
  }

  const renderDashboardContent = () => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
      case UserRole.USER:
        return renderAdminUserDashboard(latestNews);
      case UserRole.INVESTOR:
        return renderInvestorDashboard();
      case UserRole.ORGANIZER:
        return renderOrganizerDashboard(upcomingEvents, reservations);
      default:
        return renderAdminUserDashboard(latestNews);
    }
  };

  return <div className="container mx-auto">{renderDashboardContent()}</div>;
}

function renderAdminUserDashboard(latestNews: Event[]) {
  return (
    <div className="space-y-8">
      {/* Platform Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformFeatures.map((feature, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{feature.description}</p>
              <Link
                href={feature.href}
                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
              >
                Explore
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats and Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Latest News & Events</CardTitle>
          </CardHeader>
          <CardContent>
            {latestNews.length > 0 ? (
              <div className="space-y-4">
                {latestNews.map((news: Event) => (
                  <div key={news.id} className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm font-medium">{news.title}</span>
                    <span className="text-xs text-gray-500">
                      {moment(news.start_date).format("MMM D, YYYY")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No latest news & events</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Research Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <QuickLinkButton href="/events" icon={CalendarIcon} label="Research Events" />
              <QuickLinkButton href="/reservations" icon={FileTextIcon} label="My Reservations" />
              <QuickLinkButton href="/projects" icon={BriefcaseIcon} label="Research Projects" />
              <QuickLinkButton href="/profile" icon={UsersIcon} label="Profile" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Research Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Popular Projects */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Featured Open Source Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b last:border-0 gap-2"
              >
                <div className="space-y-1">
                  <span className="text-sm font-medium">{project.name}</span>
                  <p className="text-xs text-gray-500">{project.description}</p>
                </div>
                <Link href={project.link} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    View Project <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickLinkButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

function QuickLinkButton({ href, icon: Icon, label }: QuickLinkButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        className="w-full h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-gray-50"
      >
        <Icon className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </Link>
  );
}

function renderInvestorDashboard() {
  return (
    <div className="space-y-8">
      {/* Investment Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {[
          {
            title: "Active Investments",
            description: "Track your ongoing research investments",
            icon: BriefcaseIcon,
            href: "/investments",
          },
          {
            title: "New Opportunities",
            description: "Discover promising research projects",
            icon: BadgeDollarSignIcon,
            href: "/investment-opportunities",
          },
        ].map((feature, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{feature.description}</p>
              <Link
                href={feature.href}
                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
              >
                View Details
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Investment Stats and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Investment Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "AI Research Fund", amount: "$250,000", status: "Active" },
                { name: "Biotech Innovation", amount: "$180,000", status: "Pending" },
                { name: "Clean Energy Project", amount: "$320,000", status: "Active" },
              ].map((investment, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={index}
                  className="flex justify-between items-center pb-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{investment.name}</span>
                    <p className="text-xs text-gray-500">{investment.amount}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      investment.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700",
                    )}
                  >
                    {investment.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.investor.map((link, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <QuickLinkButton key={index} href={link.href} icon={link.icon} label={link.title} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Activity Chart */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Investment Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderOrganizerDashboard(upcomingEvents: Event[], reservations: any[]) {
  return (
    <div className="space-y-8">
      {/* Event Management Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Upcoming Events",
            value: upcomingEvents.length,
            description: "Events scheduled",
            icon: CalendarIcon,
          },
          {
            title: "Active Reservations",
            value: reservations.length,
            description: "Current bookings",
            icon: FileTextIcon,
          },
          {
            title: "Total Attendees",
            value: "1,234",
            description: "Registered participants",
            icon: UsersIcon,
          },
          {
            title: "Venue Utilization",
            value: "87%",
            description: "Space efficiency",
            icon: BriefcaseIcon,
          },
        ].map((stat, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index} className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{stat.title}</h3>
                  <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event List and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event: Event) => (
                  <div key={event.id} className="flex justify-between items-center pb-2 border-b">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">{event.title}</span>
                      <p className="text-xs text-gray-500">
                        {moment(event.start_date).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming events scheduled</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.organizer.map((link, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <QuickLinkButton key={index} href={link.href} icon={link.icon} label={link.title} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Activity Chart */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Event Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
