import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, UserCircle, FileText, Activity } from "lucide-react";

const guides = [
  {
    title: "Research Platform Overview",
    description:
      "Basic and advanced search options to help both new and experienced researchers find information fast",
    href: "https://www.ebsco.com/products/ebscohost-research-platform",
    icon: BookOpen,
  },
  {
    title: "Research Tools & Analysis",
    description:
      "Learn to use data analysis tools, citation assistance and save your research findings",
    href: "https://custom-writing.org/blog/best-writing-online-research-tools",
    icon: UserCircle,
  },
  {
    title: "Research Documentation",
    description:
      "Comprehensive guides for literature review, data collection and research methodology",
    href: "https://www.insightplatforms.com/",
    icon: FileText,
  },
  {
    title: "Research Experience Platform",
    description:
      "Stay on top of initiatives, engage with the wider organization, and drive research impact",
    href: "https://dscout.com/guides-and-resources/research-platform-buyers-guide",
    icon: Activity,
  },
];

const GuidesPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center text-[#6B9B76]">Research Platform Guides</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Essential resources and tools to enhance your research experience and workflow
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
              className="group hover:shadow-md transition-all duration-300 border-[#6B9B76]/20"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Icon className="w-8 h-8 text-[#6B9B76]" />
                  <div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={guide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-[#6B9B76] hover:text-[#6B9B76]/80 hover:underline"
                >
                  Access Guide →
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
