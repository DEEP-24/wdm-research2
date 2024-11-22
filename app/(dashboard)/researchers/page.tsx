"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading researchers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Connect with Researchers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchers.map((researcher) => (
          <Card key={researcher.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={researcher.imageURL}
                alt={`${researcher.firstName} ${researcher.lastName}`}
                layout="fill"
                objectFit="cover"
                objectPosition="center top"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {researcher.firstName} {researcher.lastName}
                {researcher.isFollowingYou && (
                  <span className="text-sm font-normal text-blue-600 ml-2">Follows you</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600 font-medium">Expertise</p>
                <p className="text-sm">{researcher.expertise}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Research Interests</p>
                <p className="text-sm">{researcher.researchInterests}</p>
              </div>
              <div className="flex gap-2">
                {researcher.isFollowing ? (
                  <>
                    <Button
                      onClick={() => handleFollow(researcher.id)}
                      variant="outline"
                      className="flex-1"
                      disabled={followLoading === researcher.id}
                    >
                      {followLoading === researcher.id ? "..." : "Unfollow"}
                    </Button>
                    <Button
                      onClick={() => handleOpenChat(researcher)}
                      className="flex-1"
                      disabled={followLoading === researcher.id}
                    >
                      Chat
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleFollow(researcher.id)}
                    className="w-full"
                    disabled={followLoading === researcher.id}
                  >
                    {followLoading === researcher.id ? "..." : "Follow"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
