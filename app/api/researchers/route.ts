import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
    }

    // Get all researchers with their follow status
    const researchers = await db.user.findMany({
      where: {
        AND: [
          { role: UserRole.USER },
          { id: { not: currentUser.id } }, // Exclude current user
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        expertise: true,
        researchInterests: true,
        imageURL: true,
        followedBy: {
          where: {
            followerId: currentUser.id,
          },
        },
        following: {
          where: {
            followingId: currentUser.id,
          },
        },
      },
    });

    // Add console.log to debug
    console.log("Fetched researchers:", researchers);

    // Transform the data to include isFollowing and isFollowingYou flags
    const transformedResearchers = researchers.map((researcher) => ({
      id: researcher.id,
      firstName: researcher.firstName,
      lastName: researcher.lastName,
      email: researcher.email,
      expertise: researcher.expertise || "", // Handle null values
      researchInterests: researcher.researchInterests || "", // Handle null values
      imageURL: researcher.imageURL || "/default-avatar.png", // Provide default image
      isFollowing: researcher.followedBy.length > 0,
      isFollowingYou: researcher.following.length > 0,
    }));

    // Add console.log to debug
    console.log("Transformed researchers:", transformedResearchers);

    return NextResponse.json(transformedResearchers);
  } catch (error) {
    // Improved error logging
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch researchers",
        details: error instanceof Error ? error.message : null,
      },
      { status: 500 },
    );
  }
}
