import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqData = [
  {
    question: "How do I apply for a grant?",
    answer:
      "To apply for a grant, navigate to the 'Funding Opportunities' page, select the grant you're interested in, and click the 'Apply' button. Follow the application process, providing all required information.",
  },
  {
    question: "What is the typical timeline for grant decisions?",
    answer:
      "Grant decision timelines vary depending on the specific opportunity. Generally, you can expect to hear back within 4-8 weeks after the application deadline. You can check your application status on the 'Application Status' page.",
  },
  {
    question: "How can I update my profile information?",
    answer:
      "To update your profile information, go to the 'Profile' page in your dashboard. Click on the 'Edit Profile' button to make changes to your personal information, contact details, or other relevant data.",
  },
  {
    question: "How do I connect with other researchers?",
    answer:
      "You can find and connect with other researchers through the 'Researchers' page. Follow researchers to stay updated with their work and use the chat feature to communicate directly.",
  },
];

const FAQPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center text-[#6B9B76]">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Find answers to the most common questions about our platform
        </p>
      </div>

      <Card className="max-w-3xl mx-auto border-[#6B9B76]/20">
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={`faq-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`} value={`item-${index}`}>
              <AccordionTrigger className="text-left px-4 hover:no-underline hover:bg-[#6B9B76]/10">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default FAQPage;
