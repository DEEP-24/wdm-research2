import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { customName, fileUrl } = await req.json();

    if (!fileUrl) {
      return new NextResponse("URL is required", { status: 400 });
    }

    // Create file record in database
    const sharedFile = await db.files.create({
      data: {
        customName: customName || fileUrl.split("/").pop() || "Shared File",
        userId: user.id,
        fileUrl: fileUrl,
      },
      include: {
        uploadedBy: true,
      },
    });

    return NextResponse.json(sharedFile);
  } catch (error) {
    console.error("[FILES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const files = await db.files.findMany({
      include: {
        uploadedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("[FILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
