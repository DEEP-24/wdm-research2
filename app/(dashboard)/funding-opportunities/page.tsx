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
import { CalendarIcon, PhoneIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
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
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Funding Opportunities</h2>
          <p className="text-muted-foreground">Browse and manage available funding opportunities</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedOpportunity(null);
              setIsDialogOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        {opportunities.length === 0 ? (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              {isAdmin ? (
                <>
                  <h3 className="mt-4 text-lg font-semibold">No opportunities created</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Create your first funding opportunity to get started.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Opportunity
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-semibold">No opportunities available</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Check back later for new funding opportunities.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="flex flex-col">
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold">{opportunity.title}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due {new Date(opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="space-y-2">
                    <div className="font-medium">${opportunity.amount.toLocaleString()}</div>
                    <div className="flex flex-wrap gap-1">
                      {(typeof opportunity.topics === "string"
                        ? JSON.parse(opportunity.topics)
                        : opportunity.topics
                      ).map((topic: string, index: number) => (
                        <Badge
                          key={`${topic}-${
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            index
                          }`}
                          variant="secondary"
                          className="px-2 py-0.5"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">{opportunity.organizationName}</div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{opportunity.phoneNumber}</span>
                    </div>
                    <div className="text-sm text-blue-600">{opportunity.contactEmail}</div>
                  </div>

                  {isAdmin && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setIsDialogOpen(true);
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-[42px]"
                        onClick={() => handleDelete(opportunity.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Modal */}
      {isAdmin && (
        <Dialog open={isDialogOpen && !selectedOpportunity} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white p-0">
            <div className="p-6 border-b border-gray-100">
              <DialogTitle className="text-xl font-medium text-gray-800">
                Create New Opportunity
              </DialogTitle>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-6"
            >
              {/* Form fields for Create */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-title" className="text-sm font-medium text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="create-title"
                    name="title"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter opportunity title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-amount" className="text-sm font-medium text-gray-700">
                    Amount ($)
                  </Label>
                  <Input
                    id="create-amount"
                    name="amount"
                    type="number"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="create-description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="create-description"
                  name="description"
                  className="mt-1.5 border-gray-200"
                  placeholder="Enter opportunity description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-deadline" className="text-sm font-medium text-gray-700">
                    Deadline
                  </Label>
                  <Input
                    id="create-deadline"
                    name="deadline"
                    type="date"
                    required
                    className="mt-1.5 border-gray-200"
                    min={new Date().toISOString().split("T")[0]}
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be today or a future date
                  </p>
                </div>
                <div>
                  <Label htmlFor="create-topics" className="text-sm font-medium text-gray-700">
                    Topics
                  </Label>
                  <Input
                    id="create-topics"
                    name="topics"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter topics, separated by commas"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple topics with commas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-org-name" className="text-sm font-medium text-gray-700">
                      Organization Name
                    </Label>
                    <Input
                      id="create-org-name"
                      name="organizationName"
                      className="mt-1.5 border-gray-200"
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="create-phone"
                      name="phoneNumber"
                      className="mt-1.5 border-gray-200"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="create-email" className="text-sm font-medium text-gray-700">
                    Contact Email
                  </Label>
                  <Input
                    id="create-email"
                    name="contactEmail"
                    type="email"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter contact email"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Create Opportunity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {isAdmin && selectedOpportunity && (
        <Dialog open={isDialogOpen && !!selectedOpportunity} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white p-0">
            <div className="p-6 border-b border-gray-100">
              <DialogTitle className="text-xl font-medium text-gray-800">
                Edit Opportunity
              </DialogTitle>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-6"
            >
              {/* Form fields for Edit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={selectedOpportunity.title}
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter opportunity title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">
                    Amount ($)
                  </Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    defaultValue={selectedOpportunity.amount}
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedOpportunity.description}
                  className="mt-1.5 border-gray-200"
                  placeholder="Enter opportunity description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-deadline" className="text-sm font-medium text-gray-700">
                    Deadline
                  </Label>
                  <Input
                    id="edit-deadline"
                    name="deadline"
                    type="date"
                    required
                    className="mt-1.5 border-gray-200"
                    min={new Date().toISOString().split("T")[0]}
                    defaultValue={
                      new Date(selectedOpportunity.deadline).toISOString().split("T")[0]
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be today or a future date
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-topics" className="text-sm font-medium text-gray-700">
                    Topics
                  </Label>
                  <Input
                    id="edit-topics"
                    name="topics"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter topics, separated by commas"
                    defaultValue={JSON.parse(selectedOpportunity.topics).join(", ")}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple topics with commas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-org-name" className="text-sm font-medium text-gray-700">
                      Organization Name
                    </Label>
                    <Input
                      id="edit-org-name"
                      name="organizationName"
                      className="mt-1.5 border-gray-200"
                      placeholder="Enter organization name"
                      defaultValue={selectedOpportunity.organizationName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      name="phoneNumber"
                      className="mt-1.5 border-gray-200"
                      placeholder="Enter phone number"
                      defaultValue={selectedOpportunity.phoneNumber}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
                    Contact Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="contactEmail"
                    type="email"
                    className="mt-1.5 border-gray-200"
                    placeholder="Enter contact email"
                    defaultValue={selectedOpportunity.contactEmail}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedOpportunity(null);
                  }}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Update Opportunity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
