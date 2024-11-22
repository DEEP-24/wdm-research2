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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types/user";
import { UserRole, ProposalStatus } from "@prisma/client";
import { EyeIcon, MessageCircleIcon, PaperclipIcon, SendIcon, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Project Proposals</h1>
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
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <SendIcon className="w-4 h-4 mr-2" /> Submit New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-blue-700">
                {isEditMode ? "Edit Proposal" : "Submit New Proposal"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-blue-600">
                  Project Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={newProposal.title}
                  onChange={handleInputChange}
                  required
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-blue-600">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newProposal.description || ""}
                  onChange={handleInputChange}
                  required
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-blue-600">Attachments</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attachmentName" className="text-sm text-gray-600">
                        Name
                      </Label>
                      <Input
                        id="attachmentName"
                        value={attachmentInput.name}
                        onChange={(e) =>
                          setAttachmentInput((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Document name"
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachmentUrl" className="text-sm text-gray-600">
                        URL
                      </Label>
                      <Input
                        id="attachmentUrl"
                        value={attachmentInput.url}
                        onChange={(e) =>
                          setAttachmentInput((prev) => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="https://..."
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAttachment}
                    disabled={!attachmentInput.name || !attachmentInput.url}
                    className="w-full"
                  >
                    Add Attachment
                  </Button>
                </div>

                {newProposal.attachments && getAttachments(newProposal.attachments).length > 0 && (
                  <div className="mt-4">
                    <Label className="text-blue-600">Current Attachments:</Label>
                    <ul className="list-disc pl-5 space-y-2">
                      {getAttachments(newProposal.attachments).map(
                        (file: { name: string; url: string }, index: number) => (
                          <li
                            key={`attachment-${
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              index
                            }`}
                            className="text-sm flex items-center gap-2 bg-gray-50 p-2 rounded"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                type="text"
                                defaultValue={file.name}
                                onBlur={(e) => {
                                  const currentAttachments = [
                                    ...getAttachments(newProposal.attachments),
                                  ];
                                  const updatedAttachments = currentAttachments.map((att, idx) => {
                                    if (idx === index) {
                                      return { ...att, name: e.target.value || "Untitled" };
                                    }
                                    return att;
                                  });
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    attachments: JSON.stringify(updatedAttachments),
                                  }));
                                }}
                                className="flex-1 h-8"
                                placeholder="Name"
                              />
                              <Input
                                type="text"
                                defaultValue={file.url}
                                onBlur={(e) => {
                                  const currentAttachments = [
                                    ...getAttachments(newProposal.attachments),
                                  ];
                                  const updatedAttachments = currentAttachments.map((att, idx) => {
                                    if (idx === index) {
                                      return { ...att, url: e.target.value };
                                    }
                                    return att;
                                  });
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    attachments: JSON.stringify(updatedAttachments),
                                  }));
                                }}
                                className="flex-1 h-8"
                                placeholder="URL"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
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
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isEditMode ? "Update Proposal" : "Submit Proposal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-700">
            {currentUser.role === UserRole.USER ? "My Projects" : "All Projects"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <PaperclipIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No project proposals found.</p>
              <p className="text-sm">Submit a new proposal to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  {currentUser?.role !== "USER" && <TableHead>Submitted By</TableHead>}
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <span>{proposal.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          proposal.status === "APPROVED"
                            ? "default"
                            : proposal.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    {currentUser?.role !== "USER" && (
                      <TableCell>
                        {proposal.user.firstName} {proposal.user.lastName}
                      </TableCell>
                    )}
                    <TableCell>{new Date(proposal.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {proposal.attachments ? (
                        <div className="flex items-center text-sm text-blue-600">
                          <PaperclipIcon className="w-4 h-4 mr-2" />
                          {getAttachments(proposal.attachments).length} file(s)
                        </div>
                      ) : (
                        <span className="text-gray-400">No attachments</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setViewProposal(proposal)}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" /> View
                        </Button>

                        {currentUser?.role === "ADMIN" ? (
                          <Select
                            defaultValue={proposal.status}
                            onValueChange={(value) => handleStatusChange(proposal.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ProposalStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0) +
                                    status.slice(1).toLowerCase().replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          currentUser?.id === proposal.userId && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 hover:text-amber-800"
                                onClick={() => handleEdit(proposal)}
                              >
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => setProposalToDelete(proposal)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </Button>
                            </>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {viewProposal && (
        <Dialog open={!!viewProposal} onOpenChange={() => setViewProposal(null)}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-blue-700">
                {viewProposal.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>{viewProposal.description}</p>
              <div className="text-sm text-gray-600">
                Status: <Badge variant="secondary">{viewProposal.status}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                Submitted by: {viewProposal.user.firstName} {viewProposal.user.lastName}
              </div>
              <div className="text-sm text-gray-600">
                Submitted: {new Date(viewProposal.submittedAt).toLocaleString()}
              </div>
              {viewProposal.attachments && viewProposal.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-700">Attachments:</h3>
                  <ul className="list-disc pl-5">
                    {getAttachments(viewProposal.attachments).map(
                      (attachment: { url: string; name: string }, index: number) => (
                        <li
                          key={`attachment-${viewProposal.id}-${index}`}
                          className="text-blue-600 flex items-center"
                        >
                          <PaperclipIcon className="w-4 h-4 mr-2" />
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            {attachment.name || `Attachment ${index + 1}`}
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-700">Reviews:</h3>
                {getProposalReviews(viewProposal.id).map((review: ProposalReview) => (
                  <div key={review.id} className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">{review.feedback}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reviewed by: {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reviewed on: {new Date(review.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {proposalToDelete && (
        <AlertDialog open={!!proposalToDelete} onOpenChange={() => setProposalToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the proposal &quot;
                {proposalToDelete.title}&quot; and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
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
