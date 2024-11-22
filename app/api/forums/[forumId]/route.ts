import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { forumId: string } }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();
    const forum = await db.forum.update({
      where: { id: params.forumId },
      data: { name, description },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error updating forum:", error);
    return NextResponse.json({ error: "Error updating forum" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { forumId: string } }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.forum.delete({
      where: { id: params.forumId },
    });
    return NextResponse.json({ message: "Forum deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum:", error);
    return NextResponse.json({ error: "Error deleting forum" }, { status: 500 });
  }
}
