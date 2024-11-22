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

    // Check if already following
    const existingFollow = await db.followers.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: researcherId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    // Create follow relationship
    const follow = await db.followers.create({
      data: {
        followerId: currentUser.id,
        followingId: researcherId,
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error("Error following researcher:", error);
    return NextResponse.json(
      {
        error: "Failed to follow researcher",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
