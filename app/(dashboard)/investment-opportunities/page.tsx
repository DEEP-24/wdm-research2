"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarIcon, DollarSign, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Investment Opportunities</h1>
        {user?.role === "ADMIN" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Investment Opportunity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOpportunity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount ($)</Label>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      name="sector"
                      placeholder="e.g., Technology, Healthcare"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select name="riskLevel" required defaultValue="">
                      <SelectTrigger>
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

                <Button type="submit" className="w-full">
                  Create Opportunity
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <p className="text-xl text-gray-500 mb-2">No investment opportunities available</p>
            {user?.role === "ADMIN" && (
              <p className="text-sm text-gray-400">
                Click the "Create Opportunity" button to add a new investment opportunity
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-blue-700">
                    {opportunity.title}
                  </CardTitle>
                  <p className="text-gray-600">{opportunity.description}</p>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-lg">
                      Target: ${opportunity.targetAmount.toLocaleString()}
                    </p>
                    <p className="text-green-600">
                      Current: ${opportunity.currentAmount.toLocaleString()}
                    </p>
                    {user?.role === "INVESTOR" && (
                      <p className="text-blue-600">
                        Your Investment: $
                        {calculateUserInvestment(opportunity, user.id).toLocaleString()}
                      </p>
                    )}
                    <p className="flex items-center text-gray-500">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Deadline: {formatDate(opportunity.deadline)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sectors:</h4>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.sector.split(",").map((s, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <Badge key={index} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{opportunity.companyName}</p>
                    <p className="text-sm">
                      Risk Level:{" "}
                      <span
                        className={`font-bold ${
                          opportunity.riskLevel === "Low"
                            ? "text-green-600"
                            : opportunity.riskLevel === "Medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {opportunity.riskLevel}
                      </span>
                    </p>
                  </div>
                </CardContent>
                {user?.role === "INVESTOR" && (
                  <CardContent className="pt-0">
                    {isGoalCompleted(opportunity) ? (
                      <div className="w-full p-2 text-center bg-green-50 text-green-600 rounded-md">
                        Investment Goal Completed
                      </div>
                    ) : (
                      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedOpportunity(opportunity)}
                          >
                            Invest Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invest in {selectedOpportunity?.title}</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const amount = Number(formData.get("amount"));
                              if (amount > 0) {
                                handleInvest(selectedOpportunity!.id, amount);
                              }
                            }}
                          >
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="amount">Investment Amount ($)</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min="1"
                                    max={opportunity.targetAmount - opportunity.currentAmount}
                                    required
                                    className="pl-10"
                                  />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Remaining amount needed: $
                                  {(
                                    opportunity.targetAmount - opportunity.currentAmount
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <Button type="submit" className="w-full">
                                Confirm Investment
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                )}
                {user?.role === "ADMIN" && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewInvestments(opportunity.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Investments
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpportunityToDelete(opportunity.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Investments for {selectedOpportunity?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvestments.length === 0 ? (
              <p className="text-center text-gray-500">No investments yet</p>
            ) : (
              <div className="space-y-4">
                {selectedInvestments.map((investment) => (
                  <Card key={investment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {investment.investor.firstName} {investment.investor.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{investment.investor.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${investment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(investment.date)}</p>
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
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Investment Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={selectedOpportunity?.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={selectedOpportunity?.companyName}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={selectedOpportunity?.description}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  defaultValue={selectedOpportunity?.targetAmount}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  defaultValue={
                    selectedOpportunity ? formatDateForInput(selectedOpportunity.deadline) : ""
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  name="sector"
                  placeholder="e.g., Technology, Healthcare"
                  defaultValue={selectedOpportunity?.sector}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select name="riskLevel" required defaultValue={selectedOpportunity?.riskLevel}>
                  <SelectTrigger>
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
            <Button type="submit" className="w-full">
              Update Opportunity
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the investment opportunity
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (opportunityToDelete) {
                  handleDelete(opportunityToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
