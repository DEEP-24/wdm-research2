"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ExploreButton } from "./components/explore-button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Investment = {
  id: string;
  amount: number;
  date: string;
  opportunity: {
    id: string;
    title: string;
    companyName: string;
    riskLevel: "Low" | "Medium" | "High";
  };
};

interface User {
  id: string;
  role: UserRole;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/auth/user");
      const data = await response.json();
      setUser(data);

      if (!data || data.role !== "INVESTOR") {
        redirect("/");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await fetch("/api/investments");
        if (!response.ok) {
          throw new Error("Failed to fetch investments");
        }
        const data = await response.json();
        setInvestments(data);
      } catch (error) {
        console.error("Error fetching investments:", error);
        toast.error("Failed to fetch investments");
      }
    };

    if (user?.role === "INVESTOR") {
      fetchInvestments();
    }
  }, [user]);

  const totalInvestment = investments.reduce((sum, investment) => sum + investment.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalInvestment.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{investments.length}</p>
          </CardContent>
        </Card>
      </div>

      {investments.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-xl text-center text-gray-600">
              You haven't made any investments yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Investment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 whitespace-nowrap">Project Name</th>
                      <th className="p-3 whitespace-nowrap">Company</th>
                      <th className="p-3 whitespace-nowrap">Amount</th>
                      <th className="p-3 whitespace-nowrap">Date</th>
                      <th className="p-3 whitespace-nowrap">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr key={investment.id} className="border-b border-blue-100">
                        <td className="p-3 whitespace-nowrap">{investment.opportunity.title}</td>
                        <td className="p-3 whitespace-nowrap">
                          {investment.opportunity.companyName}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          ${investment.amount.toLocaleString()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {new Date(investment.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={cn(
                              "font-bold",
                              investment.opportunity.riskLevel === "Low" && "text-green-600",
                              investment.opportunity.riskLevel === "Medium" && "text-yellow-600",
                              investment.opportunity.riskLevel === "High" && "text-red-600",
                            )}
                          >
                            {investment.opportunity.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <ExploreButton />
      </div>
    </div>
  );
}
