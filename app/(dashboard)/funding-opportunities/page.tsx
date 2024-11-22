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
        deadline: new Date(deadline).toISOString(), // Convert to ISO string
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
        deadline: new Date(deadline).toISOString(),
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funding Opportunities</h1>
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

      <ScrollArea className="h-[calc(100vh-200px)]">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="text-gray-500 mb-4">
              {isAdmin ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">No Funding Opportunities Yet</h3>
                  <p className="text-sm">
                    Get started by creating your first funding opportunity using the "Create New"
                    button above.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">No Opportunities Available</h3>
                  <p className="text-sm">
                    There are currently no funding opportunities available. Please check back later.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-blue-700">
                    {opportunity.title}
                  </CardTitle>
                  <p className="text-gray-600">{opportunity.description}</p>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-lg">
                      Amount: ${opportunity.amount.toLocaleString()}
                    </p>
                    <p className="flex items-center text-gray-500">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
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
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Contact Information:</h4>
                    <p className="text-sm">{opportunity.organizationName}</p>
                    <p className="text-sm text-blue-600">{opportunity.contactEmail}</p>
                    <p className="text-sm flex items-center">
                      <PhoneIcon className="mr-2 h-4 w-4" />
                      {opportunity.phoneNumber}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setIsDialogOpen(true);
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(opportunity.id)}>
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

      {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedOpportunity ? "Edit Opportunity" : "Create New Opportunity"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedOpportunity) {
                  handleEdit(new FormData(e.currentTarget));
                } else {
                  handleCreate(new FormData(e.currentTarget));
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedOpportunity?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={selectedOpportunity?.description}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    defaultValue={selectedOpportunity?.amount}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    defaultValue={
                      selectedOpportunity
                        ? new Date(selectedOpportunity.deadline).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Deadline must be today or a future date
                  </p>
                </div>
                <div>
                  <Label htmlFor="topics">Topics (comma-separated)</Label>
                  <Input
                    id="topics"
                    name="topics"
                    defaultValue={
                      selectedOpportunity ? JSON.parse(selectedOpportunity.topics).join(", ") : ""
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    defaultValue={selectedOpportunity?.organizationName}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={selectedOpportunity?.contactEmail}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={selectedOpportunity?.phoneNumber}
                    required
                  />
                </div>
                <Button type="submit">
                  {selectedOpportunity ? "Update" : "Create"} Opportunity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
