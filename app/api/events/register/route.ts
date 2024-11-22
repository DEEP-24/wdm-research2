import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request){
  try{
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const reservation = await db.eventRegistration.create({
      data: {
        userId: user.id,
        eventId: data.eventId,
        sessionId: data.sessionId,
      },
    })

    return NextResponse.json(reservation);
  } catch (error: unknown) {
  console.error("Failed to create reservations:", error);
  return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}



