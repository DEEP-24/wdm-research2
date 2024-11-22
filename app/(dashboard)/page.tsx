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
    title: "File Sharing",
    description: "Upload and share research documents securely.",
    icon: FileIcon,
    href: "/file-sharing",
  },
  {
    title: "Forums",
    description: "Engage in discussions with researchers worldwide.",
    icon: MessageCircleIcon,
    href: "/forums",
  },
  {
    title: "Event Management",
    description: "View upcoming events and manage your reservations.",
    icon: CalendarIcon,
    href: "/events",
  },
  {
    title: "Funding Opportunities",
    description: "Explore and apply for various funding options.",
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
  { name: "Quantum Computing Research", link: "https://research.ibm.com/quantum-computing" },
  { name: "AI Ethics Study", link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10097940" },
  { name: "Climate Change Impact Analysis", link: "https://www.epa.gov/cira" },
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

  return <div className="container mx-auto px-4 py-3">{renderDashboardContent()}</div>;
}

function renderAdminUserDashboard(latestNews: Event[]) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Link
          href="/researchers"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <p className="text-gray-600">Connect with other researchers in real-time.</p>
        </Link>
        <Link
          href="/file-sharing"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">File Sharing</h2>
          <p className="text-gray-600">Upload and share documents with your peers.</p>
        </Link>
        <Link
          href="/forums"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Discussion Forums</h2>
          <p className="text-gray-600">Participate in topic-based discussions.</p>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((feature, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  Learn more
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Latest News & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {latestNews.length > 0 ? (
                latestNews.map((news: Event) => (
                  <li key={news.id} className="flex justify-between items-center">
                    <span>{news.title}</span>
                    <span className="text-sm text-gray-500">
                      {moment(news.start_date).format("YYYY-MM-DD")}
                    </span>
                  </li>
                ))
              ) : (
                <li>No recent updates</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <QuickLinkButton href="/events" icon={CalendarIcon} label="Upcoming Events" />
              <QuickLinkButton href="/reservations" icon={FileTextIcon} label="My Reservations" />
              <QuickLinkButton href="/projects" icon={BriefcaseIcon} label="Research Projects" />
              <QuickLinkButton href="/profile" icon={UsersIcon} label="User Profile" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Popular Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {projects.map((project, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <li key={index} className="flex justify-between items-center">
                <span>{project.name}</span>
                <Link href={project.link} passHref target="_blank">
                  <Button variant="ghost" size="sm">
                    View <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
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
      <Button variant="outline" className="flex items-center gap-2 px-4 py-2 h-auto">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}

function renderInvestorDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {[
          {
            title: "Investment Opportunities",
            description: "Explore new and exciting investment opportunities in research projects.",
            href: "/investment-opportunities",
            buttonText: "View Opportunities",
          },
          {
            title: "My Investments",
            description: "Track and manage your current investments in ongoing research projects.",
            href: "/investments",
            buttonText: "View My Investments",
          },
        ].map((card, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index}>
            <CardHeader className="border-b p-6">
              <CardTitle className="text-2xl font-semibold">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">{card.description}</p>
              <Link href={card.href} className="block">
                <Button className="w-full bg-black border-2 border-gray-900 text-white hover:bg-gray-900 transition-colors duration-300">
                  {card.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader className="border-b p-6">
          <CardTitle className="text-2xl font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.investor.map((link, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Link key={index} href={link.href} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-gray-50 transition-colors duration-300 border-gray-200"
                >
                  <link.icon className="mr-3 h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{link.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderOrganizerDashboard(upcomingEvents: Event[], reservations: any[]) {
  const totalReservations = reservations.length;

  const stats = [
    { title: "Total Events", value: Math.floor(Math.random() * 50) + 10 },
    { title: "Active Participants", value: Math.floor(Math.random() * 1000) + 500 },
    { title: "Venue Bookings", value: Math.floor(Math.random() * 20) + 5 },
    { title: "Revenue (USD)", value: (Math.random() * 100000 + 50000).toFixed(2) },
    { title: "Total Reservations", value: totalReservations },
  ];

  // Filter and sort upcoming events
  const filteredUpcomingEvents = upcomingEvents
    .filter((event) => moment(event.start_date).isAfter(moment()))
    .sort((a, b) => moment(a.start_date).diff(moment(b.start_date)))
    .slice(0, 5);

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Organizer Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {stats.map((stat, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index} className="shadow-sm">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {filteredUpcomingEvents.length > 0 ? (
              <ul className="space-y-2 sm:space-y-3">
                {filteredUpcomingEvents.map((event: Event) => (
                  <li
                    key={event.id}
                    className="flex justify-between items-center text-sm sm:text-base"
                  >
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {moment(event.start_date).format("MMM D, YYYY")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm sm:text-base">No upcoming events found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Venue Reservations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex justify-between items-center text-sm sm:text-base">
                <span>Main Auditorium</span>
                <span className="text-green-600">Confirmed</span>
              </li>
              <li className="flex justify-between items-center text-sm sm:text-base">
                <span>Conference Room A</span>
                <span className="text-yellow-600">Pending</span>
              </li>
              <li className="flex justify-between items-center text-sm sm:text-base">
                <span>Exhibition Hall</span>
                <span className="text-green-600">Confirmed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickLinks.organizer.map((link, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Link key={index} href={link.href}>
                <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
