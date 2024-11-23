import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // First fetch existing sessions to handle deletions
    const existingEvent = await db.academicEvent.findUnique({
      where: { id: params.eventId },
      include: { sessions: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get IDs of sessions that should remain
    const updatedSessionIds = data.sessions
      .filter((session: any) => session.id)
      .map((session: any) => session.id);

    // Delete all sessions that are not in the updated list
    await db.academicEvent.deleteMany({
      where: {
        id: params.eventId,
        AND: [
          {
            id: {
              notIn: updatedSessionIds,
            },
          },
        ],
      },
    });

    // Separate new and existing sessions
    const existingSessions = data.sessions.filter((session: any) => session.id);
    const newSessions = data.sessions.filter((session: any) => !session.id);

    // Update the event with new data
    const event = await db.academicEvent.update({
      where: { id: params.eventId },
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
        sessions: {
          // First delete any existing sessions not in the update
          deleteMany: {
            id: {
              notIn: updatedSessionIds,
            },
          },
          // Update existing sessions
          update: existingSessions.map((session: any) => ({
            where: {
              id: session.id,
            },
            data: {
              title: session.title,
              description: session.description,
              startTime: session.startTime,
              endTime: session.endTime,
              location: session.location,
              maxAttendees: session.maxAttendees,
            },
          })),
          // Create new sessions
          create: newSessions.map((session: any) => ({
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

    // Perform a final cleanup of any orphaned sessions
    await db.academicEventSession.deleteMany({
      where: {
        eventId: params.eventId,
        id: {
          notIn: event.sessions.map((session) => session.id),
        },
      },
    });

    // Fetch the final state of the event
    const updatedEvent = await db.academicEvent.findUnique({
      where: { id: params.eventId },
      include: {
        sessions: true,
        user: true,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: unknown) {
    console.error("Failed to update event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { eventId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.academicEvent.delete({
      where: { id: params.eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error: unknown) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    console.log("Fetching event with ID:", params.eventId);

    const event = await db.academicEvent.findUnique({
      where: {
        id: params.eventId,
      },
      include: {
        sessions: true,
      },
    });

    console.log("Found event:", event);

    if (!event) {
      console.log("Event not found");
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch event" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      isVirtual,
      maxAttendees,
      registrationDeadline,
      status,
      sessions,
    } = json;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.academicEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: isVirtual ? null : location,
        isVirtual,
        maxAttendees,
        registrationDeadline: new Date(registrationDeadline),
        status,
        userId: user.id,
        sessions: {
          create: sessions.map((session: any) => ({
            title: session.title,
            description: session.description,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            location: isVirtual ? null : session.location,
            maxAttendees: session.maxAttendees,
          })),
        },
      },
      include: {
        sessions: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 },
    );
  }
}
