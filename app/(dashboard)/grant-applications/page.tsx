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
import { EyeIcon, InfoIcon, PaperclipIcon, Trash2 } from "lucide-react";
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Application</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Grant Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="project_select">Select Project</Label>
                <Select onValueChange={handleProjectSelect}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="project_title">Project Title</Label>
                <Input
                  id="project_title"
                  name="project_title"
                  value={selectedProject?.title || ""}
                  disabled
                  required
                />
              </div>
              <div>
                <Label htmlFor="project_description">Project Description</Label>
                <Textarea
                  id="project_description"
                  name="project_description"
                  value={selectedProject?.description || ""}
                  disabled
                  rows={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="requestAmount">Requested Amount ($)</Label>
                <Input
                  id="requestAmount"
                  name="requestAmount"
                  type="number"
                  value={newApplication.requestAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  name="keywords"
                  value={newApplication.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., sustainability, innovation, technology"
                  required
                />
              </div>
              <div>
                <Label htmlFor="attachments">Attachments</Label>
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

                {newApplication.attachments.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-blue-600">Current Attachments:</Label>
                    <ul className="list-disc pl-5 space-y-2">
                      {newApplication.attachments.map((file, index) => (
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
                              className="flex-1 h-8"
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
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-700">
              Application Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Eligibility Criteria:</strong> Carefully review the eligibility
                    requirements for each grant opportunity. Ensure your organization and project
                    meet all specified criteria before applying.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Project Alignment:</strong> Clearly demonstrate how your project aligns
                    with the funding opportunity's goals and priorities. Use specific examples and
                    data to support your claims.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Budget Preparation:</strong> Develop a detailed, realistic budget that
                    accurately reflects your project's needs. Be prepared to justify each expense
                    and show how it contributes to your project's success.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Proposal Writing Tips:</strong> Write a clear, concise, and compelling
                    project description. Use simple language, avoid jargon, and focus on the problem
                    you're addressing and your proposed solution.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Supporting Documents:</strong> Gather all necessary supporting
                    documents, such as financial statements, tax records, and letters of support.
                    Ensure they are up-to-date and properly formatted.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Review Process:</strong> Have colleagues or mentors review your
                    application before submission. Fresh eyes can catch errors and provide valuable
                    feedback on clarity and persuasiveness.
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Submission Deadlines:</strong> Note all deadlines and submit your
                    application well in advance. Late submissions are often automatically
                    disqualified, regardless of merit.
                  </div>
                </li>
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700">
              {currentUser.role === "ADMIN" ? "All Applications" : "Your Applications"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No applications found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApplications.map((app) => (
                    <Card
                      key={app.id}
                      className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardTitle className="text-lg font-bold truncate">
                          {app.projectProposal.title}
                        </CardTitle>
                        {currentUser.role === "ADMIN" && (
                          <div className="text-sm text-white/80">
                            Submitted by: {app.submittedBy.firstName} {app.submittedBy.lastName}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                              Requested Amount:
                            </span>
                            <span className="text-sm font-semibold">
                              ${app.requestAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <Badge
                              variant={
                                app.status === "ACCEPTED"
                                  ? "secondary"
                                  : app.status === "REJECTED"
                                    ? "destructive"
                                    : "default"
                              }
                              className="capitalize"
                            >
                              {app.status.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {app.reviewedBy && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                Reviewed by:
                              </span>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${app.reviewedBy.firstName} ${app.reviewedBy.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {`${app.reviewedBy.firstName[0]}${app.reviewedBy.lastName[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold">{`${app.reviewedBy.firstName} ${app.reviewedBy.lastName}`}</span>
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-600 block mb-1">
                              Keywords:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {app.keywords.split(",").map((keyword, i) => (
                                <Badge
                                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                  key={i}
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-800"
                                >
                                  {keyword.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {app.attachments && app.attachments.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 block mb-1">
                                Attachments:
                              </span>
                              <div className="flex items-center">
                                <PaperclipIcon className="w-4 h-4 mr-2 text-blue-500" />
                                <span className="text-sm">{app.attachments.length} file(s)</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" /> View Details
                        </Button>
                        {currentUser.role === "ADMIN" && (
                          <div className="mt-2">
                            <Label htmlFor={`status-${app.id}`}>Update Status</Label>
                            <Select
                              defaultValue={app.status}
                              onValueChange={(value) => handleStatusChange(app.id, value)}
                            >
                              <SelectTrigger id={`status-${app.id}`}>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(GrantStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-700">
              Application Details
            </DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-600">Project Title</h3>
                <p>{selectedApplication.projectProposal.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600">Project Description</h3>
                <p>{selectedApplication.projectProposal.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600">Requested Amount</h3>
                <p>${selectedApplication.requestAmount.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600">Keywords</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedApplication.keywords.split(",").map((keyword, i) => (
                    <Badge
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={i}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800"
                    >
                      {keyword.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600">Status</h3>
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
              {selectedApplication.reviewedBy && (
                <div>
                  <h3 className="font-semibold text-blue-600">Reviewed By</h3>
                  <p>{`${selectedApplication.reviewedBy.firstName} ${selectedApplication.reviewedBy.lastName}`}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-blue-600">Attachments</h3>
                {selectedApplication.attachments.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedApplication.attachments.map((file, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      <li key={index} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" /> View
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No attachments</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
