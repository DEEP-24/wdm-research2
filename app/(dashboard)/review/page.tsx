"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
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
import { EyeIcon, MessageCircleIcon, PaperclipIcon } from "lucide-react";
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
          setProposals(proposalsData);
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
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">All Project Proposals</h1>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-700">Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.title}</TableCell>
                    <TableCell>
                      {proposal.user ? (
                        `${proposal.user.firstName} ${proposal.user.lastName}`
                      ) : (
                        <span className="text-gray-400">Unknown User</span>
                      )}
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
                    <TableCell>{new Date(proposal.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {proposal.attachments ? (
                        <div className="flex items-center text-sm text-blue-600">
                          <PaperclipIcon className="w-4 h-4 mr-2" />
                          {getAttachmentCount(proposal.attachments)} file(s)
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
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setIsDialogOpen(true);
                          }}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" /> View Details
                        </Button>
                        {currentUser && hasUserSubmittedFeedback(proposal.id, currentUser.id) && (
                          <Badge variant="secondary">Feedback Submitted</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">No project proposals available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Dialog component outside of the map function */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          {selectedProposal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-blue-700">
                  {selectedProposal.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{selectedProposal.description}</p>
                <div className="text-sm text-gray-600">
                  Status: <Badge variant="secondary">{selectedProposal.status}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Submitted: {new Date(selectedProposal.submittedAt).toLocaleString()}
                </div>
                {selectedProposal.attachments &&
                  getAttachmentCount(selectedProposal.attachments) > 0 && (
                    <div>
                      <h3 className="font-semibold text-blue-700">Attachments:</h3>
                      <ul className="list-disc pl-5">
                        {JSON.parse(selectedProposal.attachments).map(
                          (attachment: { name: string; type: string }, index: number) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <li key={index} className="text-sm text-blue-600">
                              <PaperclipIcon className="w-4 h-4 inline mr-2" />
                              {attachment.name} ({attachment.type})
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-700">Reviews:</h3>
                  {getProposalReviews(selectedProposal.id).length > 0 ? (
                    getProposalReviews(selectedProposal.id).map((review) => (
                      <div key={review.id} className="bg-gray-100 p-3 rounded">
                        <p className="text-sm">{review.feedback}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed on: {new Date(review.reviewedAt).toLocaleString()}
                          </p>
                          {review.reviewer && (
                            <p className="text-xs text-gray-500">
                              by {review.reviewer.firstName} {review.reviewer.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No reviews yet</span>
                  )}
                </div>
                {currentUser && !hasUserSubmittedFeedback(selectedProposal.id, currentUser.id) && (
                  <div className="space-y-2">
                    <Label htmlFor="newFeedback" className="text-blue-600">
                      Add Feedback
                    </Label>
                    <Textarea
                      id="newFeedback"
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                    />
                    <Button onClick={handleAddFeedback} className="w-full">
                      <MessageCircleIcon className="w-4 h-4 mr-2" /> Submit Feedback
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
