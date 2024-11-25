"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Researcher {
  id: string;
  firstName: string;
  lastName: string;
  expertise: string;
  researchInterests: string;
  imageURL: string;
  isFollowing: boolean;
  isFollowingYou: boolean;
  email: string;
}

export default function ResearchersPage() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResearchers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }
      const userData = await response.json();
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Error fetching current user:", error);
      toast.error("Failed to fetch user information");
    }
  };

  const fetchResearchers = async () => {
    try {
      const response = await fetch("/api/researchers");
      if (!response.ok) {
        throw new Error("Failed to fetch researchers");
      }
      const data = await response.json();
      console.log("Fetched researchers:", data);
      setResearchers(data);
    } catch (error) {
      console.error("Error fetching researchers:", error);
      toast.error("Failed to load researchers");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (researcherId: string) => {
    if (!currentUserId) {
      toast.error("Please log in to follow researchers");
      return;
    }

    setFollowLoading(researcherId);
    try {
      const targetResearcher = researchers.find((r) => r.id === researcherId);
      const action = targetResearcher?.isFollowing ? "unfollow" : "follow";

      const response = await fetch(`/api/researchers/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ researcherId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} researcher`);
      }

      setResearchers((prev) =>
        prev.map((researcher) =>
          researcher.id === researcherId
            ? { ...researcher, isFollowing: !researcher.isFollowing }
            : researcher,
        ),
      );

      toast.success(
        `Successfully ${action}ed ${targetResearcher?.firstName} ${targetResearcher?.lastName}`,
      );
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update follow status");

      setResearchers((prev) =>
        prev.map((researcher) =>
          researcher.id === researcherId
            ? { ...researcher, isFollowing: !researcher.isFollowing }
            : researcher,
        ),
      );
    } finally {
      setFollowLoading(null);
    }
  };

  const handleOpenChat = (researcher: Researcher) => {
    router.push(`/chat?userId=${researcher.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-medium text-[#6B9B76] text-center">
            Connect with Researchers
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Discover and connect with leading researchers in your field of interest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {researchers.map((researcher) => (
            <Card
              key={researcher.id}
              className="group border border-[#6B9B76]/20 hover:border-[#6B9B76] bg-white transition-all duration-200 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src={researcher.imageURL}
                  alt={`${researcher.firstName} ${researcher.lastName}`}
                  layout="fill"
                  objectFit="cover"
                  objectPosition="center"
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                {researcher.isFollowingYou && (
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 bg-[#6B9B76]/10 text-[#6B9B76]"
                  >
                    Follows you
                  </Badge>
                )}
              </div>

              <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-[#6B9B76]">
                  {researcher.firstName} {researcher.lastName}
                </CardTitle>
                <p className="text-sm text-gray-600">{researcher.email}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-[#6B9B76]">Expertise</span>
                    <p className="text-sm text-gray-600">{researcher.expertise}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#6B9B76]">Research Interests</span>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {researcher.researchInterests}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {researcher.isFollowing ? (
                    <>
                      <Button
                        onClick={() => handleFollow(researcher.id)}
                        variant="outline"
                        className="flex-1 border-[#6B9B76]/20 text-[#6B9B76] hover:bg-[#6B9B76]/10"
                        disabled={followLoading === researcher.id}
                      >
                        {followLoading === researcher.id ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          "Unfollow"
                        )}
                      </Button>
                      <Button
                        onClick={() => handleOpenChat(researcher)}
                        className="flex-1 bg-[#6B9B76] hover:bg-[#5a8463] text-white"
                        disabled={followLoading === researcher.id}
                      >
                        Chat
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleFollow(researcher.id)}
                      className="w-full bg-[#6B9B76] hover:bg-[#5a8463] text-white"
                      disabled={followLoading === researcher.id}
                    >
                      {followLoading === researcher.id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
            <div className="text-lg text-[#6B9B76] animate-pulse">Loading researchers...</div>
          </div>
        )}
      </div>
    </div>
  );
}
