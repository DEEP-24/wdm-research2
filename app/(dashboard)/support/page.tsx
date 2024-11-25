import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HelpCircle, BookOpen, MessageSquare } from "lucide-react";

const SupportPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center text-[#6B9B76]">Support Center</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Get help with your questions and find resources to make the most of our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:shadow-md transition-all duration-300 border-[#6B9B76]/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <HelpCircle className="w-8 h-8 text-[#6B9B76]" />
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/support/faq"
              className="inline-flex text-[#6B9B76] hover:text-[#6B9B76]/80 hover:underline"
            >
              View FAQs →
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-300 border-[#6B9B76]/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-[#6B9B76]" />
              <div>
                <CardTitle>User Guides</CardTitle>
                <CardDescription>Detailed tutorials and documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/support/guides"
              className="inline-flex text-[#6B9B76] hover:text-[#6B9B76]/80 hover:underline"
            >
              Browse Guides →
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-300 border-[#6B9B76]/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-[#6B9B76]" />
              <div>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get personalized help from our team</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/support/contact"
              className="inline-flex text-[#6B9B76] hover:text-[#6B9B76]/80 hover:underline"
            >
              Contact Us →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
