import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const guides = [
  {
    title: "Getting Started",
    description: "Learn the basics of using our grant application platform",
    href: "/",
  },
  {
    title: "Completing Your Profile",
    description: "A step-by-step guide to setting up your user profile",
    href: "/",
  },
  {
    title: "Applying for a Grant",
    description: "Detailed instructions on how to apply for funding opportunities",
    href: "/",
  },
  {
    title: "Tracking Your Application",
    description: "How to monitor the status of your grant applications",
    href: "/",
  },
];

const GuidesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Guides</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index}>
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={guide.href} className="text-blue-600 hover:underline">
                Read Guide
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GuidesPage;
