import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: { fileId: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const file = await db.files.findUnique({
      where: { id: params.fileId },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Check if the current user is the owner of the file
    if (file.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Delete the file
    await db.files.delete({
      where: { id: params.fileId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { fileId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { customName, fileUrl } = await req.json();

    const file = await db.files.findUnique({
      where: {
        id: params.fileId,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Check if the user is the owner of the file
    if (file.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedFile = await db.files.update({
      where: {
        id: params.fileId,
      },
      data: {
        customName: customName || fileUrl.split("/").pop() || "Shared File",
        fileUrl,
      },
      include: {
        uploadedBy: true,
      },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("[FILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
