import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { researcherId } = await req.json();

    // Check if the follow relationship exists
    const existingFollow = await db.followers.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: researcherId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json({ error: "Not following this researcher" }, { status: 400 });
    }

    // Delete follow relationship
    const unfollow = await db.followers.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: researcherId,
        },
      },
    });

    return NextResponse.json(unfollow);
  } catch (error) {
    console.error("Error unfollowing researcher:", error);
    return NextResponse.json(
      {
        error: "Failed to unfollow researcher",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
