import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Socket.IO is now handled by the custom server
    return NextResponse.json({ message: "Socket service is running" }, { status: 200 });
  } catch (error) {
    console.error("Socket route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
