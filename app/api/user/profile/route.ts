import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        researchInterests: true,
        expertise: true,
        linkedInURL: true,
        twitterURL: true,
        githubURL: true,
        papers: true,
        dob: true,
        imageURL: true,
        phone: true,
        street: true,
        aptNo: true,
        city: true,
        state: true,
        zipcode: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Convert dob string to Date object
    const dobDate = body.dob ? new Date(body.dob) : undefined;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        researchInterests: body.researchInterests,
        expertise: body.expertise,
        linkedInURL: body.linkedInURL,
        twitterURL: body.twitterURL,
        githubURL: body.githubURL,
        papers: body.papers,
        dob: dobDate,
        imageURL: body.imageURL,
        phone: body.phone,
        street: body.street,
        aptNo: body.aptNo,
        city: body.city,
        state: body.state,
        zipcode: body.zipcode,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
