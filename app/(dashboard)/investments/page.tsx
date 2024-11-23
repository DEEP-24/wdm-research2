"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ExploreButton } from "./components/explore-button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, BarChart2, TrendingUp } from "lucide-react";

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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">My Investments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium text-gray-500">Total Investment</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-gray-900">
                ${totalInvestment.toLocaleString()}
              </p>
              <DollarSign className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium text-gray-500">Active Investments</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-gray-900">{investments.length}</p>
              <BarChart2 className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium text-gray-500">Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-gray-900">Active</p>
              <TrendingUp className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          {investments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">
                You haven't made any investments yet.
              </p>
              <p className="text-sm text-gray-500">Start investing to grow your portfolio!</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-3 text-sm font-medium text-gray-500">
                        Project Name
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-500">Company</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-500">
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr
                        key={investment.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-sm text-gray-900">
                          {investment.opportunity.title}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {investment.opportunity.companyName}
                        </td>
                        <td className="p-3 text-sm font-medium text-green-600">
                          ${investment.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(investment.date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "text-sm px-2 py-1 rounded-md",
                              investment.opportunity.riskLevel === "Low" &&
                                "bg-green-50 text-green-600",
                              investment.opportunity.riskLevel === "Medium" &&
                                "bg-yellow-50 text-yellow-600",
                              investment.opportunity.riskLevel === "High" &&
                                "bg-red-50 text-red-600",
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
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center">
        <ExploreButton />
      </div>
    </div>
  );
}
