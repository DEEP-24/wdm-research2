import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, UserCircle, FileText, Activity } from "lucide-react";

const guides = [
  {
    title: "Getting Started",
    description: "Learn the basics of using our grant application platform",
    href: "/",
    icon: BookOpen,
  },
  {
    title: "Completing Your Profile",
    description: "A step-by-step guide to setting up your user profile",
    href: "/",
    icon: UserCircle,
  },
  {
    title: "Applying for a Grant",
    description: "Detailed instructions on how to apply for funding opportunities",
    href: "/",
    icon: FileText,
  },
  {
    title: "Tracking Your Application",
    description: "How to monitor the status of your grant applications",
    href: "/",
    icon: Activity,
  },
];

const GuidesPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center">User Guides</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Step-by-step tutorials to help you navigate our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {guides.map((guide, index) => {
          const Icon = guide.icon;
          return (
            <Card
              key={`guide-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
              className="group hover:shadow-md transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Icon className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={guide.href}
                  className="inline-flex text-primary hover:text-primary/80 hover:underline"
                >
                  Read Guide →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GuidesPage;
