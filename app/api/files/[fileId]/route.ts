import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { fileId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const file = await db.sharedFile.findUnique({
      where: {
        id: params.fileId,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Delete file record from database
    await db.sharedFile.delete({
      where: {
        id: params.fileId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { fileId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { customName, fileUrl } = await req.json();

    const file = await db.sharedFile.findUnique({
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

    const updatedFile = await db.sharedFile.update({
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
