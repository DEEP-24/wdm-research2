import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const SupportPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/support/faq" className="text-blue-600 hover:underline">
              View FAQs
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Guides</CardTitle>
            <CardDescription>Step-by-step tutorials and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/support/guides" className="text-blue-600 hover:underline">
              Browse Guides
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/support/contact" className="text-blue-600 hover:underline">
              Contact Us
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
