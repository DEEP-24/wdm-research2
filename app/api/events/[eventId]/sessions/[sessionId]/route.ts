import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: { eventId: string; sessionId: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if the user is the event organizer
    const event = await db.event.findFirst({
      where: {
        id: params.eventId,
        userId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Not authorized to delete this session" }, { status: 403 });
    }

    await db.eventSession.delete({
      where: {
        id: params.sessionId,
        eventId: params.eventId,
      },
    });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
