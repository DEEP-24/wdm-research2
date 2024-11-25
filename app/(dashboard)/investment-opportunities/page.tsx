"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  role: "ADMIN" | "INVESTOR" | "USER" | "ORGANIZER";
}

interface Investment {
  id: string;
  amount: number;
  date: string;
  investor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  investorId: string;
}

interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  sector: string;
  companyName: string;
  riskLevel: string;
  investments: {
    id: string;
    amount: number;
    investorId: string;
    date: string;
  }[];
}

export default function InvestmentOpportunities() {
  const [user, setUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<InvestmentOpportunity | null>(
    null,
  );
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvestments, setSelectedInvestments] = useState<Investment[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/auth/user");
      const data = await response.json();
      setUser(data);
    };
    fetchUser();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch("/api/investment-opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      const data = await response.json();
      setOpportunities(data);
    } catch (_err) {
      toast.error("Failed to fetch investment opportunities");
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleInvest = async (opportunityId: string, amount: number) => {
    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, amount }),
      });

      if (!response.ok) {
        throw new Error("Investment failed");
      }

      await fetchOpportunities();
      toast.success(
        `Successfully invested $${amount.toLocaleString()} in ${selectedOpportunity?.title}`,
      );
      setIsInvestDialogOpen(false);
    } catch (_err) {
      toast.error("Failed to make investment");
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("deadline") as string;

    // Create date at end of the selected day in local timezone
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Deadline cannot be in the past");
      return;
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetAmount: Number.parseFloat(formData.get("targetAmount") as string),
      deadline: selectedDate.toISOString(),
      sector: formData.get("sector") as string,
      companyName: formData.get("companyName") as string,
      riskLevel: formData.get("riskLevel") as string,
    };

    try {
      const response = await fetch("/api/investment-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create opportunity");
      }

      await fetchOpportunities();
      toast.success("Investment opportunity created successfully");
      setIsCreateDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create investment opportunity",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/investment-opportunities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Investment opportunity deleted successfully");
      fetchOpportunities();
      setIsDeleteDialogOpen(false);
    } catch (_error) {
      toast.error("Failed to delete investment opportunity");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get("deadline") as string;

    // Create date at end of the selected day in local timezone
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Deadline cannot be in the past");
      return;
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetAmount: Number.parseFloat(formData.get("targetAmount") as string),
      deadline: selectedDate.toISOString(),
      sector: formData.get("sector") as string,
      companyName: formData.get("companyName") as string,
      riskLevel: formData.get("riskLevel") as string,
    };

    try {
      const response = await fetch(`/api/investment-opportunities/${selectedOpportunity?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success("Investment opportunity updated successfully");
      fetchOpportunities();
      setIsEditDialogOpen(false);
    } catch (_error) {
      toast.error("Failed to update investment opportunity");
    }
  };

  const viewInvestments = async (id: string) => {
    try {
      const response = await fetch(`/api/investment-opportunities/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch investments");
      }

      const data = await response.json();
      setSelectedInvestments(data.investments);
      setSelectedOpportunity(data);
      setIsViewDialogOpen(true);
    } catch (_error) {
      toast.error("Failed to fetch investments");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    return localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateUserInvestment = (opportunity: InvestmentOpportunity, userId: string): number => {
    return opportunity.investments
      .filter((inv) => inv.investorId === userId)
      .reduce((total, inv) => total + inv.amount, 0);
  };

  const isGoalCompleted = (opportunity: InvestmentOpportunity): boolean => {
    return opportunity.currentAmount >= opportunity.targetAmount;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#6B9B76]">
          Investment Opportunities
        </h1>
        {user?.role === "ADMIN" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#6B9B76] text-[#6B9B76] hover:bg-[#6B9B76]/10 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#6B9B76]/5 p-0">
              <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                    Create Investment Opportunity
                  </DialogTitle>
                </DialogHeader>
              </div>

              <form onSubmit={handleCreateOpportunity} className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-[#6B9B76]">
                      Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      placeholder="Enter opportunity title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-[#6B9B76]">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-[#6B9B76]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76] min-h-[100px]"
                    placeholder="Enter opportunity description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount" className="text-sm font-medium text-[#6B9B76]">
                      Target Amount ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B9B76]" />
                      <Input
                        id="targetAmount"
                        name="targetAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        className="pl-10 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                        placeholder="Enter target amount"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm font-medium text-[#6B9B76]">
                      Deadline
                    </Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B9B76] w-4 h-4" />
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        required
                        className="pl-10 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                        min={new Date().toISOString().split("T")[0]}
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-sm font-medium text-[#6B9B76]">
                      Sector
                    </Label>
                    <Input
                      id="sector"
                      name="sector"
                      className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      placeholder="e.g., Technology, Healthcare"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskLevel" className="text-sm font-medium text-[#6B9B76]">
                      Risk Level
                    </Label>
                    <Select name="riskLevel" required defaultValue="">
                      <SelectTrigger className="border-[#6B9B76]/20">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#6B9B76]/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#6B9B76] hover:bg-[#5a8463] text-white">
                    Create Opportunity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border border-[#6B9B76]/20 shadow-sm bg-[#6B9B76]/5">
        <CardContent className="p-6">
          <ScrollArea className="h-[calc(100vh-220px)]">
            {opportunities.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-[#6B9B76]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-[#6B9B76]" />
                </div>
                <p className="text-[#6B9B76] font-medium mb-2">
                  No investment opportunities available
                </p>
                {user?.role === "ADMIN" && (
                  <p className="text-sm text-gray-600">
                    Click the "Create Opportunity" button to add a new investment opportunity
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="group p-5 rounded-lg border border-[#6B9B76]/20 hover:border-[#6B9B76] bg-white transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-xl font-medium text-[#6B9B76] group-hover:text-[#5a8463]">
                            {opportunity.title}
                          </h3>
                          <p className="text-gray-600">{opportunity.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.sector.split(",").map((s) => (
                            <Badge
                              key={`${opportunity.id}-${s.trim()}`}
                              variant="secondary"
                              className="bg-[#6B9B76]/10 text-[#6B9B76] hover:bg-[#6B9B76]/20"
                            >
                              {s.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Target Amount</p>
                          <p className="font-medium text-[#6B9B76]">
                            ${opportunity.targetAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Current Amount</p>
                          <p className="font-medium text-[#6B9B76]">
                            ${opportunity.currentAmount.toLocaleString()}
                          </p>
                        </div>
                        {user?.role === "INVESTOR" && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Your Investment</p>
                            <p className="font-medium text-[#6B9B76]">
                              ${calculateUserInvestment(opportunity, user.id).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md text-sm text-gray-600 border border-[#6B9B76]/10">
                          <CalendarIcon className="w-4 h-4" />
                          Deadline: {formatDate(opportunity.deadline)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md text-sm text-gray-600 border border-[#6B9B76]/10">
                          {opportunity.companyName}
                        </span>
                        <span
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm border ${
                            opportunity.riskLevel === "Low"
                              ? "bg-[#6B9B76]/10 text-[#6B9B76] border-[#6B9B76]/20"
                              : opportunity.riskLevel === "Medium"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          Risk Level: {opportunity.riskLevel}
                        </span>
                      </div>

                      {user?.role === "INVESTOR" && (
                        <div className="pt-4">
                          {isGoalCompleted(opportunity) ? (
                            <div className="w-full p-2 text-center bg-[#6B9B76]/10 text-[#6B9B76] rounded-md border border-[#6B9B76]/20">
                              Investment Goal Completed
                            </div>
                          ) : (
                            <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full bg-[#6B9B76] hover:bg-[#5a8463] text-white"
                                  onClick={() => setSelectedOpportunity(opportunity)}
                                >
                                  Invest Now
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-[#6B9B76]/5 p-0">
                                <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                                      Invest in {selectedOpportunity?.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                </div>

                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const amount = Number(formData.get("amount"));
                                    if (amount > 0) {
                                      handleInvest(selectedOpportunity!.id, amount);
                                    }
                                  }}
                                  className="p-6 space-y-6 bg-white"
                                >
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium text-[#6B9B76]">
                                          Target Amount
                                        </Label>
                                        <div className="p-3 bg-[#6B9B76]/5 rounded-lg text-gray-900">
                                          ${opportunity.targetAmount.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium text-[#6B9B76]">
                                          Current Amount
                                        </Label>
                                        <div className="p-3 bg-[#6B9B76]/5 rounded-lg text-gray-900">
                                          ${opportunity.currentAmount.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="amount"
                                        className="text-sm font-medium text-[#6B9B76]"
                                      >
                                        Investment Amount ($)
                                      </Label>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B9B76]" />
                                        <Input
                                          id="amount"
                                          name="amount"
                                          type="number"
                                          min="1"
                                          max={opportunity.targetAmount - opportunity.currentAmount}
                                          required
                                          className="pl-10 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                                          placeholder="Enter investment amount"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-gray-600">Remaining needed:</span>
                                        <span className="font-medium text-[#6B9B76]">
                                          $
                                          {(
                                            opportunity.targetAmount - opportunity.currentAmount
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-[#6B9B76]">
                                        Your Current Investment
                                      </Label>
                                      <div className="p-3 bg-[#6B9B76]/5 rounded-lg text-gray-900">
                                        $
                                        {calculateUserInvestment(
                                          opportunity,
                                          user.id,
                                        ).toLocaleString()}
                                      </div>
                                    </div>

                                    <div className="p-4 bg-[#6B9B76]/5 rounded-lg space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#6B9B76]">
                                          {opportunity.companyName}
                                        </span>
                                        <Badge
                                          variant="secondary"
                                          className="bg-[#6B9B76]/10 text-[#6B9B76]"
                                        >
                                          {opportunity.riskLevel} Risk
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Deadline: {formatDate(opportunity.deadline)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-4 border-t border-[#6B9B76]/10">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsInvestDialogOpen(false)}
                                      className="border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="submit"
                                      className="bg-[#6B9B76] hover:bg-[#5a8463] text-white"
                                    >
                                      Confirm Investment
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}

                      {user?.role === "ADMIN" && (
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewInvestments(opportunity.id)}
                            className="text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Investments
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOpportunity(opportunity);
                              setIsEditDialogOpen(true);
                            }}
                            className="text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOpportunityToDelete(opportunity.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#6B9B76]/5 p-0">
          <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                Investments for {selectedOpportunity?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white space-y-4">
            {selectedInvestments.length === 0 ? (
              <p className="text-center text-gray-600">No investments yet</p>
            ) : (
              <div className="space-y-4">
                {selectedInvestments.map((investment) => (
                  <Card key={investment.id} className="border border-[#6B9B76]/20">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#6B9B76]">
                            {investment.investor.firstName} {investment.investor.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{investment.investor.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#6B9B76]">
                            ${investment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">{formatDate(investment.date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#6B9B76]/5 p-0">
          <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                Edit Investment Opportunity
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleEdit} className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-[#6B9B76]">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedOpportunity?.title}
                  className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-[#6B9B76]">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={selectedOpportunity?.companyName}
                  className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-[#6B9B76]">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={selectedOpportunity?.description}
                className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-sm font-medium text-[#6B9B76]">
                  Target Amount ($)
                </Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  defaultValue={selectedOpportunity?.targetAmount}
                  className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium text-[#6B9B76]">
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  min={new Date().toISOString().split("T")[0]}
                  defaultValue={
                    selectedOpportunity ? formatDateForInput(selectedOpportunity.deadline) : ""
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector" className="text-sm font-medium text-[#6B9B76]">
                  Sector
                </Label>
                <Input
                  id="sector"
                  name="sector"
                  defaultValue={selectedOpportunity?.sector}
                  className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel" className="text-sm font-medium text-[#6B9B76]">
                  Risk Level
                </Label>
                <Select name="riskLevel" required defaultValue={selectedOpportunity?.riskLevel}>
                  <SelectTrigger className="border-[#6B9B76]/20">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#6B9B76]/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#6B9B76] hover:bg-[#5a8463] text-white">
                Update Opportunity
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#6B9B76]/5 sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-medium text-[#6B9B76]">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the investment opportunity
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
              onClick={() => setOpportunityToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (opportunityToDelete) {
                  handleDelete(opportunityToDelete);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
