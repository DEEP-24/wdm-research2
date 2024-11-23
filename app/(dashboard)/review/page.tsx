"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { CalendarIcon, EyeIcon, MessageCircleIcon, PaperclipIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectProposal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  attachments: string | null;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ProposalReview {
  id: string;
  projectProposalId: string;
  reviewerId: string;
  feedback: string | null;
  reviewedAt: string;
  reviewer?: {
    firstName: string;
    lastName: string;
  };
}

export default function AllProjectsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [reviews, setReviews] = useState<ProposalReview[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);
  const [newFeedback, setNewFeedback] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/auth/user");
        if (!userResponse.ok) {
          router.push("/login");
          return;
        }
        const userData = await userResponse.json();
        setCurrentUser(userData);

        const proposalsResponse = await fetch("/api/proposals");
        if (proposalsResponse.ok) {
          const proposalsData = await proposalsResponse.json();
          const filteredProposals = proposalsData.filter(
            (proposal: ProjectProposal) => proposal.userId !== userData.id,
          );
          setProposals(filteredProposals);
        }

        const reviewsResponse = await fetch("/api/proposals/reviews");
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [router]);

  const handleAddFeedback = async () => {
    if (currentUser && selectedProposal && newFeedback.trim()) {
      try {
        const response = await fetch("/api/proposals/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectProposalId: selectedProposal.id,
            reviewerId: currentUser.id,
            feedback: newFeedback.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        const newReview = await response.json();
        setReviews((prev) => [...prev, newReview]);
        setNewFeedback("");
        toast.success("Feedback submitted successfully");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error("Failed to submit feedback");
      }
    }
  };

  const getProposalReviews = (proposalId: string) => {
    return reviews.filter((review) => review.projectProposalId === proposalId);
  };

  const getAttachmentCount = (attachmentsString: string | null) => {
    if (!attachmentsString) {
      return 0;
    }
    try {
      return JSON.parse(attachmentsString).length;
    } catch {
      return 0;
    }
  };

  const hasUserSubmittedFeedback = (proposalId: string, userId: string) => {
    return reviews.some(
      (review) => review.projectProposalId === proposalId && review.reviewerId === userId,
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-medium text-gray-800 mb-8">Project Reviews</h1>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          {proposals.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No proposals to review</p>
              <p className="text-sm text-gray-500">Check back later for new proposals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
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
                      <p className="text-sm text-gray-500 line-clamp-2">{proposal.description}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          By {proposal.user.firstName} {proposal.user.lastName}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(proposal.submittedAt).toLocaleDateString()}
                        </span>
                        {proposal.attachments && (
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <PaperclipIcon className="w-3.5 h-3.5" />
                            {getAttachmentCount(proposal.attachments)} files
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setIsDialogOpen(true);
                        }}
                      >
                        <EyeIcon className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Review</span>
                      </Button>
                      {currentUser && hasUserSubmittedFeedback(proposal.id, currentUser.id) && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          Reviewed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white p-0">
          {selectedProposal && (
            <>
              <div className="p-6 border-b border-gray-100">
                <DialogTitle className="text-xl font-medium text-gray-800">
                  {selectedProposal.title}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={cn("mt-2 uppercase text-xs font-semibold", {
                    "border-green-200 bg-green-50 text-green-700":
                      selectedProposal.status === "APPROVED",
                    "border-red-200 bg-red-50 text-red-700": selectedProposal.status === "REJECTED",
                    "border-yellow-200 bg-yellow-50 text-yellow-700":
                      selectedProposal.status === "UNDER_REVIEW",
                    "border-gray-200 bg-gray-50 text-gray-700":
                      selectedProposal.status === "SUBMITTED",
                  })}
                >
                  {selectedProposal.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedProposal.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted by</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedProposal.user.firstName} {selectedProposal.user.lastName}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted on</h4>
                    <p className="text-gray-600 text-sm">
                      {new Date(selectedProposal.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedProposal.attachments &&
                  getAttachmentCount(selectedProposal.attachments) > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Attachments</h4>
                      <div className="grid gap-2">
                        {JSON.parse(selectedProposal.attachments).map(
                          (attachment: { name: string; url: string }, index: number) => (
                            <a
                              key={`attachment-${selectedProposal.id}-${index}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                            >
                              <PaperclipIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
                              <span className="flex-1">{attachment.name}</span>
                              <span className="text-xs text-gray-400 group-hover:text-gray-500">
                                View →
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {getProposalReviews(selectedProposal.id).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Reviews</h4>
                    <div className="space-y-3">
                      {getProposalReviews(selectedProposal.id).map((review) => (
                        <div
                          key={review.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {review.feedback}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                              By {review.reviewer?.firstName} {review.reviewer?.lastName}
                            </span>
                            <time dateTime={review.reviewedAt} className="text-gray-400">
                              {new Date(review.reviewedAt).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentUser && !hasUserSubmittedFeedback(selectedProposal.id, currentUser.id) && (
                  <div className="space-y-3">
                    <Label htmlFor="newFeedback" className="text-sm font-medium text-gray-700">
                      Add Your Review
                    </Label>
                    <Textarea
                      id="newFeedback"
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="min-h-[100px] border-gray-200 focus:ring-gray-200 focus:border-gray-300"
                      placeholder="Write your feedback here..."
                    />
                    <Button
                      onClick={handleAddFeedback}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <MessageCircleIcon className="w-4 h-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
