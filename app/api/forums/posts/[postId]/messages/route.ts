import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const messages = await db.postMessage.findMany({
      where: {
        postId: params.postId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    const message = await db.postMessage.create({
      data: {
        content,
        postId: params.postId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
