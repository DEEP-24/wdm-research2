import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const post = await db.post.findUnique({
      where: {
        id: params.postId,
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
