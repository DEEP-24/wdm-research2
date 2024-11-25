import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: {
        id: token.value,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        imageUrl: true,
      },
    });

    if (!user) {
      cookieStore.delete("token");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
