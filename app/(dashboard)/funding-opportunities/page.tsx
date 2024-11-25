"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  PhoneIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "INVESTOR" | "USER" | "ORGANIZER";
}

interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  topics: string;
  contactEmail: string;
  organizationName: string;
  phoneNumber: string;
  createdBy: User;
}

export default function FundingOpportunities() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchOpportunities();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const user = await response.json();
      setCurrentUser(user);
    } catch {
      router.push("/login");
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";

  const fetchOpportunities = async () => {
    try {
      const response = await fetch("/api/funding-opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      const data = await response.json();
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch opportunities error:", error);
      toast.error("Failed to fetch opportunities");
      setOpportunities([]);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      // Validate required fields
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const amountStr = formData.get("amount") as string;
      const deadline = formData.get("deadline") as string;
      const deadlineDate = new Date(deadline);
      deadlineDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid timezone issues
      const topics = formData.get("topics") as string;
      const contactEmail = formData.get("contactEmail") as string;
      const organizationName = formData.get("organizationName") as string;
      const phoneNumber = formData.get("phoneNumber") as string;

      // Basic validation
      if (
        !title ||
        !description ||
        !amountStr ||
        !deadline ||
        !topics ||
        !contactEmail ||
        !organizationName ||
        !phoneNumber
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Parse amount to ensure it's a valid number
      const amount = Number.parseFloat(amountStr);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Format the data
      const data = {
        title: title.trim(),
        description: description.trim(),
        amount,
        deadline: deadlineDate.toISOString(), // Send as ISO string
        topics: topics
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t), // Remove empty topics
        contactEmail: contactEmail.trim(),
        organizationName: organizationName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      // Send request
      const response = await fetch("/api/funding-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create opportunity");
      }

      toast.success("Opportunity created successfully");
      fetchOpportunities();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Create opportunity error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create opportunity");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/funding-opportunities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete opportunity");
      }

      toast.success("Opportunity deleted successfully");
      fetchOpportunities();
    } catch {
      toast.error("Failed to delete opportunity");
    }
  };

  const handleEdit = async (formData: FormData) => {
    try {
      if (!selectedOpportunity) {
        return;
      }

      // Validate required fields
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const amountStr = formData.get("amount") as string;
      const deadline = formData.get("deadline") as string;
      const deadlineDate = new Date(deadline);
      deadlineDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid timezone issues
      const topics = formData.get("topics") as string;
      const contactEmail = formData.get("contactEmail") as string;
      const organizationName = formData.get("organizationName") as string;
      const phoneNumber = formData.get("phoneNumber") as string;

      // Basic validation
      if (
        !title ||
        !description ||
        !amountStr ||
        !deadline ||
        !topics ||
        !contactEmail ||
        !organizationName ||
        !phoneNumber
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Parse amount to ensure it's a valid number
      const amount = Number.parseFloat(amountStr);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Format the data
      const data = {
        title: title.trim(),
        description: description.trim(),
        amount,
        deadline: deadlineDate.toISOString(), // Send as ISO string
        topics: topics
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        contactEmail: contactEmail.trim(),
        organizationName: organizationName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      const response = await fetch(`/api/funding-opportunities/${selectedOpportunity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update opportunity");
      }

      toast.success("Opportunity updated successfully");
      fetchOpportunities();
      setIsDialogOpen(false);
      setSelectedOpportunity(null);
    } catch (error) {
      console.error("Update opportunity error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update opportunity");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-medium text-[#6B9B76]">
            {isAdmin ? "Manage Funding Opportunities" : "Available Opportunities"}
          </h1>
          {isAdmin && (
            <Button
              onClick={() => {
                setSelectedOpportunity(null);
                setIsDialogOpen(true);
              }}
              variant="outline"
              className="border-[#6B9B76] text-[#6B9B76] hover:bg-[#6B9B76]/10 w-full sm:w-auto"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Opportunity
            </Button>
          )}
        </div>

        <Card className="border border-[#6B9B76]/20 shadow-sm bg-[#6B9B76]/5">
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {opportunities.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-[#6B9B76]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-[#6B9B76]" />
                  </div>
                  <h3 className="text-[#6B9B76] font-medium mb-2">
                    {isAdmin ? "No opportunities created" : "No opportunities available"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAdmin
                      ? "Create your first funding opportunity to get started."
                      : "Check back later for new funding opportunities."}
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-4 bg-[#6B9B76] hover:bg-[#5a8463] text-white"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Opportunity
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {opportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="group p-5 rounded-lg border border-[#6B9B76]/20 hover:border-[#6B9B76] bg-white transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-medium text-[#6B9B76] group-hover:text-[#5a8463]">
                            {opportunity.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {opportunity.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                              <CalendarIcon className="h-4 w-4" />
                              Due {new Date(opportunity.deadline).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                              ${opportunity.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-2">
                            {(typeof opportunity.topics === "string"
                              ? JSON.parse(opportunity.topics)
                              : opportunity.topics
                            ).map((topic: string) => (
                              <Badge
                                key={`${opportunity.id}-${topic}`}
                                variant="secondary"
                                className="bg-[#6B9B76]/10 text-[#6B9B76] hover:bg-[#6B9B76]/20"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <div className="pt-2 space-y-1">
                            <div className="text-sm font-medium text-[#6B9B76]">
                              {opportunity.organizationName}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{opportunity.phoneNumber}</span>
                            </div>
                            <div className="text-sm text-[#6B9B76]">{opportunity.contactEmail}</div>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10"
                              onClick={() => {
                                setSelectedOpportunity(opportunity);
                                setIsDialogOpen(true);
                              }}
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(opportunity.id)}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
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
      </div>

      {/* Create/Edit Modal */}
      {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-[#6B9B76]/5 p-0">
            <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
              <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                {selectedOpportunity ? "Edit Opportunity" : "Create New Opportunity"}
              </DialogTitle>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                selectedOpportunity ? handleEdit(formData) : handleCreate(formData);
              }}
              className="p-6 space-y-6 bg-white"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-[#6B9B76]">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Enter opportunity title"
                    defaultValue={selectedOpportunity?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-[#6B9B76]">
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Enter amount"
                    defaultValue={selectedOpportunity?.amount}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#6B9B76]">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                  placeholder="Enter opportunity description"
                  defaultValue={selectedOpportunity?.description}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline" className="text-sm font-medium text-[#6B9B76]">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    min={new Date().toISOString().split("T")[0]}
                    defaultValue={
                      selectedOpportunity
                        ? new Date(selectedOpportunity.deadline).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  <p className="text-xs text-gray-600 mt-1">Must be today or a future date</p>
                </div>
                <div>
                  <Label htmlFor="topics" className="text-sm font-medium text-[#6B9B76]">
                    Topics
                  </Label>
                  <Input
                    id="topics"
                    name="topics"
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Enter topics, separated by commas"
                    defaultValue={
                      selectedOpportunity
                        ? (typeof selectedOpportunity.topics === "string"
                            ? JSON.parse(selectedOpportunity.topics)
                            : selectedOpportunity.topics
                          ).join(", ")
                        : ""
                    }
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Separate multiple topics with commas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="organizationName"
                      className="text-sm font-medium text-[#6B9B76]"
                    >
                      Organization Name
                    </Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      placeholder="Enter organization name"
                      defaultValue={selectedOpportunity?.organizationName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#6B9B76]">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      placeholder="Enter phone number"
                      defaultValue={selectedOpportunity?.phoneNumber}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-[#6B9B76]">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Enter contact email"
                    defaultValue={selectedOpportunity?.contactEmail}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#6B9B76]/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedOpportunity(null);
                  }}
                  className="border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B9B76] hover:bg-[#5a8463] text-white">
                  {selectedOpportunity ? "Update Opportunity" : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
