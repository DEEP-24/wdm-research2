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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { ProposalStatus, UserRole } from "@prisma/client";
import { EyeIcon, PaperclipIcon, Pencil, SendIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

interface ProjectProposal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  attachments: string | null;
  proposalReviews: ProposalReview[];
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ProposalReview {
  id: string;
  proposalId: string;
  reviewerId: string;
  feedback: string | null;
  reviewedAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
}

interface AttachmentInput {
  name: string;
  url: string;
}

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [newProposal, setNewProposal] = useState<Partial<ProjectProposal>>({
    title: "",
    description: "",
    attachments: "[]",
  });
  const [viewProposal, setViewProposal] = useState<ProjectProposal | null>(null);
  const [proposalToEdit, setProposalToEdit] = useState<ProjectProposal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attachmentInput, setAttachmentInput] = useState<AttachmentInput>({
    name: "",
    url: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<ProjectProposal | null>(null);
  const router = useRouter();

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/proposals");
      if (!res.ok) {
        throw new Error("Failed to fetch proposals");
      }
      const data = await res.json();

      if (currentUser?.role === UserRole.USER) {
        setProposals(
          data.filter((proposal: ProjectProposal) => proposal.userId === currentUser.id),
        );
      } else {
        setProposals(data);
      }
    } catch (_error) {
      toast.error("Failed to fetch proposals");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchProposals();
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProposal((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttachment = () => {
    if (attachmentInput.name && attachmentInput.url) {
      const currentAttachments = getAttachments(newProposal.attachments);
      const updatedAttachments = [...currentAttachments, attachmentInput];
      setNewProposal((prev) => ({
        ...prev,
        attachments: JSON.stringify(updatedAttachments),
      }));
      setAttachmentInput({ name: "", url: "" }); // Reset input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/proposals${isEditMode ? `/${proposalToEdit?.id}` : ""}`, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProposal),
      });

      if (!res.ok) {
        throw new Error(isEditMode ? "Failed to update proposal" : "Failed to create proposal");
      }

      await fetchProposals();
      setNewProposal({ title: "", description: "", attachments: "[]" });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setProposalToEdit(null);
      toast.success(
        isEditMode ? "Proposal updated successfully!" : "Project proposal submitted successfully!",
      );
    } catch (_error) {
      toast.error(isEditMode ? "Failed to update proposal" : "Failed to submit proposal");
    }
  };

  const getProposalReviews = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    return proposal?.proposalReviews || [];
  };

  const getAttachments = (
    attachmentsString: string | null | undefined,
  ): Array<{ name: string; url: string }> => {
    if (!attachmentsString) {
      return [];
    }
    try {
      return JSON.parse(attachmentsString);
    } catch {
      return [];
    }
  };

  const handleEdit = (proposal: ProjectProposal) => {
    setNewProposal({
      title: proposal.title,
      description: proposal.description,
      attachments: proposal.attachments || "[]",
    });
    setProposalToEdit(proposal);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (proposalId: string) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete proposal");
      }

      await fetchProposals();
      setProposalToDelete(null);
      toast.success("Proposal deleted successfully!");
    } catch (_error) {
      toast.error("Failed to delete proposal");
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      await fetchProposals();
      toast.success("Status updated successfully!");
    } catch (_error) {
      toast.error("Failed to update status");
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#6B9B76]">
          {currentUser.role === UserRole.USER ? "My Projects" : "All Projects"}
        </h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setNewProposal({ title: "", description: "", attachments: "[]" });
              setAttachmentInput({ name: "", url: "" });
              setIsEditMode(false);
              setProposalToEdit(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="border-[#6B9B76] text-[#6B9B76] hover:bg-[#6B9B76]/10 w-full sm:w-auto"
            >
              <SendIcon className="w-4 h-4 mr-2" /> Submit New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white p-0">
            <div className="p-6 border-b border-[#6B9B76]/10">
              <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                {isEditMode ? "Edit Proposal" : "Submit New Proposal"}
              </DialogTitle>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={newProposal.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProposal.description || ""}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5 min-h-[100px] border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                    placeholder="Describe your project"
                  />
                </div>

                {/* Current Attachments List with Edit Options */}
                {isEditMode &&
                  newProposal.attachments &&
                  getAttachments(newProposal.attachments).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Current Attachments
                      </Label>
                      <div className="mt-1.5 space-y-2">
                        {getAttachments(newProposal.attachments).map((file, index) => (
                          <div
                            key={`current-attachment-${
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              index
                            }`}
                            className="space-y-2 p-3 bg-[#6B9B76]/5 rounded-lg border border-[#6B9B76]/10"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                value={file.name}
                                onChange={(e) => {
                                  const currentAttachments = [
                                    ...getAttachments(newProposal.attachments),
                                  ];
                                  currentAttachments[index] = {
                                    ...currentAttachments[index],
                                    name: e.target.value,
                                  };
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    attachments: JSON.stringify(currentAttachments),
                                  }));
                                }}
                                className="border-[#6B9B76]/20 text-sm focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                                placeholder="Document name"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  const currentAttachments = [
                                    ...getAttachments(newProposal.attachments),
                                  ];
                                  const updatedAttachments = currentAttachments.filter(
                                    (_, i) => i !== index,
                                  );
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    attachments: JSON.stringify(updatedAttachments),
                                  }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={file.url}
                              onChange={(e) => {
                                const currentAttachments = [
                                  ...getAttachments(newProposal.attachments),
                                ];
                                currentAttachments[index] = {
                                  ...currentAttachments[index],
                                  url: e.target.value,
                                };
                                setNewProposal((prev) => ({
                                  ...prev,
                                  attachments: JSON.stringify(currentAttachments),
                                }));
                              }}
                              className="border-[#6B9B76]/20 text-sm focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                              placeholder="URL"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Add New Attachments Section */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {isEditMode ? "Add New Attachment" : "Attachments"}
                  </Label>
                  <div className="mt-1.5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Document name"
                        value={attachmentInput.name}
                        onChange={(e) =>
                          setAttachmentInput((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      />
                      <Input
                        placeholder="URL"
                        value={attachmentInput.url}
                        onChange={(e) =>
                          setAttachmentInput((prev) => ({ ...prev, url: e.target.value }))
                        }
                        className="border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAttachment}
                      disabled={!attachmentInput.name || !attachmentInput.url}
                      className="w-full border-[#6B9B76] text-[#6B9B76] hover:bg-[#6B9B76]/10"
                    >
                      <PaperclipIcon className="w-4 h-4 mr-2" />
                      Add Attachment
                    </Button>
                  </div>
                </div>

                {/* Added Attachments List */}
                {!isEditMode &&
                  newProposal.attachments &&
                  getAttachments(newProposal.attachments).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Added Attachments</Label>
                      <div className="mt-1.5 space-y-2">
                        {getAttachments(newProposal.attachments).map((file, index) => (
                          <div
                            key={`attachment-${
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              index
                            }`}
                            className="flex items-center justify-between p-2 bg-[#6B9B76]/5 rounded-md border border-[#6B9B76]/10"
                          >
                            <span className="text-sm text-gray-600 truncate flex-1">
                              {file.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => {
                                const currentAttachments = [
                                  ...getAttachments(newProposal.attachments),
                                ];
                                const updatedAttachments = currentAttachments.filter(
                                  (_, i) => i !== index,
                                );
                                setNewProposal((prev) => ({
                                  ...prev,
                                  attachments: JSON.stringify(updatedAttachments),
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-6">
                <Button type="submit" className="w-full bg-[#6B9B76] hover:bg-[#5a8463] text-white">
                  {isEditMode ? "Update Proposal" : "Submit Proposal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-[#6B9B76]/20 shadow-sm bg-[#6B9B76]/5">
        <CardContent className="p-6">
          {proposals.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-[#6B9B76]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PaperclipIcon className="w-8 h-8 text-[#6B9B76]" />
              </div>
              <p className="text-[#6B9B76] font-medium mb-2">No project proposals found</p>
              <p className="text-sm text-gray-600">Submit a new proposal to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="group p-5 rounded-lg border border-[#6B9B76]/20 hover:border-[#6B9B76] bg-white transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-[#6B9B76] group-hover:text-[#5a8463]">
                          {proposal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 uppercase text-[10px] font-semibold px-2.5 py-0.5",
                            {
                              "border-green-200 bg-green-50 text-green-700":
                                proposal.status === "APPROVED",
                              "border-red-200 bg-red-50 text-red-700":
                                proposal.status === "REJECTED",
                              "border-yellow-200 bg-yellow-50 text-yellow-700":
                                proposal.status === "UNDER_REVIEW",
                              "border-gray-200 bg-gray-50 text-gray-700":
                                proposal.status === "SUBMITTED",
                            },
                          )}
                        >
                          {proposal.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-600">
                        {currentUser?.role !== "USER" && (
                          <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                            By {proposal.user.firstName} {proposal.user.lastName}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#6B9B76]" />
                          {new Date(proposal.submittedAt).toLocaleDateString()}
                        </span>
                        {proposal.attachments && (
                          <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                            <PaperclipIcon className="w-3.5 h-3.5 text-[#6B9B76]" />
                            {getAttachments(proposal.attachments).length} files
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10 transition-colors"
                        onClick={() => setViewProposal(proposal)}
                      >
                        <EyeIcon className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                      {currentUser?.role === "ADMIN" ? (
                        <Select
                          defaultValue={proposal.status}
                          onValueChange={(value) => handleStatusChange(proposal.id, value)}
                        >
                          <SelectTrigger className="h-8 w-full border-[#6B9B76]/20 bg-white focus:ring-[#6B9B76]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ProposalStatus).map((status) => (
                              <SelectItem key={status} value={status} className="text-sm">
                                {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        currentUser?.id === proposal.userId && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10 transition-colors"
                              onClick={() => handleEdit(proposal)}
                            >
                              <Pencil className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => setProposalToDelete(proposal)}
                            >
                              <Trash2 className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewProposal && (
        <Dialog open={!!viewProposal} onOpenChange={() => setViewProposal(null)}>
          <DialogContent className="sm:max-w-[600px] bg-[#6B9B76]/5 p-0">
            <div className="p-6 border-b border-[#6B9B76]/10 bg-white">
              <DialogTitle className="text-xl font-medium text-[#6B9B76]">
                {viewProposal.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className={cn("mt-2 uppercase text-xs font-semibold", {
                  "border-green-200 bg-green-50 text-green-700": viewProposal.status === "APPROVED",
                  "border-red-200 bg-red-50 text-red-700": viewProposal.status === "REJECTED",
                  "border-yellow-200 bg-yellow-50 text-yellow-700":
                    viewProposal.status === "UNDER_REVIEW",
                  "border-gray-200 bg-gray-50 text-gray-700": viewProposal.status === "SUBMITTED",
                })}
              >
                {viewProposal.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-white p-4 rounded-lg border border-[#6B9B76]/20">
                <h4 className="text-sm font-medium text-[#6B9B76] mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{viewProposal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-[#6B9B76]/20">
                  <h4 className="text-sm font-medium text-[#6B9B76] mb-2">Submitted by</h4>
                  <p className="text-gray-600 text-sm">
                    {viewProposal.user.firstName} {viewProposal.user.lastName}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#6B9B76]/20">
                  <h4 className="text-sm font-medium text-[#6B9B76] mb-2">Submitted on</h4>
                  <p className="text-gray-600 text-sm">
                    {new Date(viewProposal.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {viewProposal.attachments && getAttachments(viewProposal.attachments).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#6B9B76] mb-3">Attachments</h4>
                  <div className="grid gap-2">
                    {getAttachments(viewProposal.attachments).map((attachment, index) => (
                      <a
                        key={`attachment-${viewProposal.id}-${index}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 text-sm text-gray-600 hover:text-[#6B9B76] bg-white rounded-lg border border-[#6B9B76]/20 hover:border-[#6B9B76] hover:shadow-sm transition-all group"
                      >
                        <PaperclipIcon className="w-4 h-4 mr-3 text-[#6B9B76] opacity-70 group-hover:opacity-100" />
                        <span className="flex-1">
                          {attachment.name || `Attachment ${index + 1}`}
                        </span>
                        <span className="text-xs text-[#6B9B76] opacity-70 group-hover:opacity-100">
                          View →
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {getProposalReviews(viewProposal.id).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#6B9B76] mb-3">Reviews</h4>
                  <div className="space-y-3">
                    {getProposalReviews(viewProposal.id).map((review) => (
                      <div
                        key={review.id}
                        className="p-4 bg-white rounded-lg border border-[#6B9B76]/20"
                      >
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {review.feedback}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                            By {review.reviewer.firstName} {review.reviewer.lastName}
                          </span>
                          <time dateTime={review.reviewedAt} className="text-gray-500">
                            {new Date(review.reviewedAt).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {proposalToDelete && (
        <AlertDialog open={!!proposalToDelete} onOpenChange={() => setProposalToDelete(null)}>
          <AlertDialogContent className="bg-[#6B9B76]/5 sm:max-w-[400px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-medium text-[#6B9B76]">
                Delete Proposal
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete "{proposalToDelete.title}"? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="border-[#6B9B76]/20 hover:bg-[#6B9B76]/10 transition-colors">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white border-0 transition-colors"
                onClick={() => handleDelete(proposalToDelete.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
