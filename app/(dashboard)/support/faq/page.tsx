import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  // Add more FAQ items as needed
];

const FAQPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>

      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQPage;
