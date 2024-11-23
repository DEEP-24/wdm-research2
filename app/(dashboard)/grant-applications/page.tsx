"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { User } from "@/types/user";
import { GrantStatus } from "@prisma/client";
import { EyeIcon, FileIcon, InfoIcon, PaperclipIcon, PlusIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectProposal {
  id: string;
  title: string;
  description: string;
}

interface GrantApplication {
  id: string;
  projectProposalId: string;
  projectProposal: {
    id: string;
    title: string;
    description: string;
  };
  requestAmount: number;
  keywords: string;
  status: GrantStatus;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
  submittedById: string;
  submittedBy: {
    firstName: string;
    lastName: string;
    imageURL: string;
  };
  attachments: { name: string; type: string; url: string }[];
}

export default function GrantApplications() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<GrantApplication | null>(null);
  const [newApplication, setNewApplication] = useState({
    projectId: "",
    requestAmount: 0,
    keywords: "",
    attachments: [] as { name: string; type: string; url: string }[],
  });
  const [selectedProject, setSelectedProject] = useState<ProjectProposal | null>(null);
  const [attachmentInput, setAttachmentInput] = useState<{
    name: string;
    url: string;
  }>({
    name: "",
    url: "",
  });
  const router = useRouter();

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

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/grant-applications");
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setApplications(data);
    } catch (_error) {
      toast.error("Failed to fetch applications");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/proposals");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      setProjects(data);
    } catch (_error) {
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchApplications();
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewApplication((prev) => ({
      ...prev,
      [name]: name === "requestAmount" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setNewApplication((prev) => ({
        ...prev,
        projectId: project.id,
      }));
    }
  };

  const handleAddAttachment = () => {
    if (attachmentInput.name && attachmentInput.url) {
      setNewApplication((prev) => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            name: attachmentInput.name,
            type: "link", // or determine type from URL
            url: attachmentInput.url,
          },
        ],
      }));
      setAttachmentInput({ name: "", url: "" }); // Reset input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newApplication.projectId || !newApplication.requestAmount || !newApplication.keywords) {
        toast.error("Please fill in all required fields");
        return;
      }

      const res = await fetch("/api/grant-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: newApplication.projectId,
          requestAmount: Number(newApplication.requestAmount),
          keywords: newApplication.keywords,
          attachments: newApplication.attachments,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to submit application");
      }

      await fetchApplications();
      setNewApplication({
        projectId: "",
        requestAmount: 0,
        keywords: "",
        attachments: [],
      });
      setSelectedProject(null);
      setIsDialogOpen(false);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/grant-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      await fetchApplications();
      toast.success("Status updated successfully");
    } catch (_error) {
      toast.error("Failed to update status");
    }
  };

  const filteredApplications =
    currentUser?.role === "USER"
      ? applications.filter((app) => app.submittedById === currentUser.id)
      : applications;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">Grant Applications</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white p-0">
            <div className="p-6 border-b border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-medium text-gray-800">
                  Create New Grant Application
                </DialogTitle>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Project Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="project_select" className="text-sm font-medium text-gray-700">
                      Select Project
                    </Label>
                    <Select onValueChange={handleProjectSelect}>
                      <SelectTrigger className="w-full border-gray-200">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Title */}
                  <div className="space-y-2">
                    <Label htmlFor="project_title" className="text-sm font-medium text-gray-700">
                      Project Title
                    </Label>
                    <Input
                      id="project_title"
                      name="project_title"
                      value={selectedProject?.title || ""}
                      disabled
                      required
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  {/* Request Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="requestAmount" className="text-sm font-medium text-gray-700">
                      Requested Amount ($)
                    </Label>
                    <Input
                      id="requestAmount"
                      name="requestAmount"
                      type="number"
                      value={newApplication.requestAmount}
                      onChange={handleInputChange}
                      required
                      className="border-gray-200"
                      placeholder="Enter amount"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                      Keywords
                    </Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      value={newApplication.keywords}
                      onChange={handleInputChange}
                      placeholder="e.g., sustainability, innovation"
                      required
                      className="border-gray-200"
                    />
                    <p className="text-xs text-gray-500">Separate keywords with commas</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Project Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="project_description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Project Description
                    </Label>
                    <Textarea
                      id="project_description"
                      name="project_description"
                      value={selectedProject?.description || ""}
                      disabled
                      rows={3}
                      required
                      className="bg-gray-50 border-gray-200 resize-none h-[120px]"
                    />
                  </div>

                  {/* Attachments Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Attachments</Label>

                    {/* Add New Attachment */}
                    <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="attachmentName"
                          value={attachmentInput.name}
                          onChange={(e) =>
                            setAttachmentInput((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Document name"
                          className="border-gray-200 bg-white h-9"
                        />
                        <Input
                          id="attachmentUrl"
                          value={attachmentInput.url}
                          onChange={(e) =>
                            setAttachmentInput((prev) => ({ ...prev, url: e.target.value }))
                          }
                          placeholder="https://..."
                          className="border-gray-200 bg-white h-9"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAttachment}
                        disabled={!attachmentInput.name || !attachmentInput.url}
                        className="w-full bg-white h-9"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Attachment
                      </Button>
                    </div>

                    {/* Attachment List */}
                    {newApplication.attachments.length > 0 && (
                      <div className="max-h-[180px] overflow-y-auto space-y-2">
                        {newApplication.attachments.map((file, index) => (
                          <div
                            key={`attachment-${
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              index
                            }`}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                type="text"
                                defaultValue={file.name}
                                onBlur={(e) => {
                                  const currentAttachments = [...newApplication.attachments];
                                  const updatedAttachments = currentAttachments.map((att, idx) => {
                                    if (idx === index) {
                                      return { ...att, name: e.target.value || "Untitled" };
                                    }
                                    return att;
                                  });
                                  setNewApplication((prev) => ({
                                    ...prev,
                                    attachments: updatedAttachments,
                                  }));
                                }}
                                className="h-7 border-gray-200 bg-white text-sm"
                                placeholder="Name"
                              />
                              <Input
                                type="text"
                                defaultValue={file.url}
                                onBlur={(e) => {
                                  const currentAttachments = [...newApplication.attachments];
                                  const updatedAttachments = currentAttachments.map((att, idx) => {
                                    if (idx === index) {
                                      return { ...att, url: e.target.value };
                                    }
                                    return att;
                                  });
                                  setNewApplication((prev) => ({
                                    ...prev,
                                    attachments: updatedAttachments,
                                  }));
                                }}
                                className="h-7 border-gray-200 bg-white text-sm"
                                placeholder="URL"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => {
                                const currentAttachments = [...newApplication.attachments];
                                const updatedAttachments = currentAttachments.filter(
                                  (_, i) => i !== index,
                                );
                                setNewApplication((prev) => ({
                                  ...prev,
                                  attachments: updatedAttachments,
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resources Card */}
      <Card className="border border-gray-100 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Application Resources</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-64">
            <ul className="space-y-4">
              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Grant Writing Best Practices</strong>
                  <p className="text-gray-600 mt-1">
                    Focus on clear objectives, measurable outcomes, and strong methodology. Use data
                    and evidence to support your claims.
                  </p>
                </div>
              </li>

              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Budget Guidelines</strong>
                  <p className="text-gray-600 mt-1">
                    Include detailed cost breakdowns, justify expenses, and ensure alignment with
                    project goals. Consider both direct and indirect costs.
                  </p>
                </div>
              </li>

              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Required Documentation</strong>
                  <p className="text-gray-600 mt-1">
                    Prepare organizational documents, tax records, financial statements, and
                    relevant certifications. Include letters of support if applicable.
                  </p>
                </div>
              </li>

              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Timeline Management</strong>
                  <p className="text-gray-600 mt-1">
                    Submit well before deadlines. Plan for internal review time and potential
                    technical issues. Set reminders for key milestones.
                  </p>
                </div>
              </li>

              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Review Checklist</strong>
                  <p className="text-gray-600 mt-1">
                    ✓ Complete all required fields ✓ Attach supporting documents ✓ Verify budget
                    calculations ✓ Proofread for clarity ✓ Check formatting
                  </p>
                </div>
              </li>

              <li className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <InfoIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Common Pitfalls</strong>
                  <p className="text-gray-600 mt-1">
                    Avoid vague objectives, unrealistic budgets, missing documentation, and
                    last-minute submissions. Follow all formatting guidelines.
                  </p>
                </div>
              </li>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">
            {currentUser.role === "ADMIN" ? "All Applications" : "Your Applications"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[600px]">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">No applications found</p>
                <p className="text-sm text-gray-500">Start by creating a new application!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                            {app.projectProposal.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {app.projectProposal.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md text-gray-500">
                            ${app.requestAmount.toLocaleString()}
                          </span>
                          <Badge
                            variant={
                              app.status === "ACCEPTED"
                                ? "secondary"
                                : app.status === "REJECTED"
                                  ? "destructive"
                                  : "default"
                            }
                            className="capitalize px-2 py-1"
                          >
                            {app.status.toLowerCase()}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {app.keywords.split(",").map((keyword, i) => (
                            <Badge
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              key={i}
                              variant="secondary"
                              className="text-xs bg-gray-50 text-gray-600"
                            >
                              {keyword.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplication(app)}
                          className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        {currentUser.role === "ADMIN" && (
                          <Select
                            defaultValue={app.status}
                            onValueChange={(value) => handleStatusChange(app.id, value)}
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(GrantStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white p-0">
          <div className="p-6 border-b border-gray-100">
            <DialogTitle className="text-xl font-medium text-gray-800">
              Application Details
            </DialogTitle>
          </div>

          {selectedApplication && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Project Title</Label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {selectedApplication.projectProposal.title}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Request Amount</Label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      ${selectedApplication.requestAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedApplication.status === "ACCEPTED"
                            ? "secondary"
                            : selectedApplication.status === "REJECTED"
                              ? "destructive"
                              : "default"
                        }
                        className="capitalize"
                      >
                        {selectedApplication.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Keywords</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.keywords.split(",").map((keyword, i) => (
                        <Badge
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={i}
                          variant="secondary"
                          className="text-xs bg-gray-50 text-gray-600"
                        >
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Project Description</Label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900 min-h-[120px]">
                      {selectedApplication.projectProposal.description}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Submitted By</Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedApplication.submittedBy.imageURL} />
                        <AvatarFallback>
                          {`${selectedApplication.submittedBy.firstName[0]}${selectedApplication.submittedBy.lastName[0]}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-gray-900">
                        {selectedApplication.submittedBy.firstName}{" "}
                        {selectedApplication.submittedBy.lastName}
                      </div>
                    </div>
                  </div>

                  {selectedApplication.reviewedBy && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Reviewed By</Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {selectedApplication.reviewedBy.firstName}{" "}
                        {selectedApplication.reviewedBy.lastName}
                      </div>
                    </div>
                  )}

                  {selectedApplication.attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                      <div className="space-y-2">
                        {selectedApplication.attachments.map((file, index) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <PaperclipIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
