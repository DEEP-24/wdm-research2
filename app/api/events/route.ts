import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await db.event.findMany({
      include: {
        sessions: true,
        registrations: true,
        user: true,
      },
    });
    return NextResponse.json(events);
  } catch (error: unknown) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const event = await db.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        isVirtual: data.isVirtual,
        maxAttendees: data.maxAttendees,
        registrationDeadline: data.registrationDeadline,
        status: data.status,
        userId: user.id,
        sessions: {
          create: data.sessions.map((session: any) => ({
            title: session.title,
            description: session.description,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location,
            maxAttendees: session.maxAttendees,
          })),
        },
      },
      include: {
        sessions: true,
        user: true,
      },
    });

    return NextResponse.json(event);
  } catch (error: unknown) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
