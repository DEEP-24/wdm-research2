import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await db.eventRegistration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          include: {
            sessions: true,
          },
        },
        session: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationId } = await request.json();

    
    const registration = await db.eventRegistration.findFirst({
      where: {
        id: registrationId,
        userId: user.id,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Delete the registration
    await db.eventRegistration.delete({
      where: {
        id: registrationId,
      },
    });

    return NextResponse.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
} 