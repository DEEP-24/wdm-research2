import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an organizer
    if (currentUser.role !== UserRole.ORGANIZER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all reservations with related data
    const reservations = await db.eventRegistration.findMany({
      include: {
        event: {
          include: {
            sessions: true,
          },
        },
        session: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching all reservations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
