import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.investmentOpportunity.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete opportunity:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const updated = await db.investmentOpportunity.update({
      where: { id: params.id },
      data: json,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update opportunity:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const opportunity = await db.investmentOpportunity.findUnique({
      where: { id: params.id },
      include: {
        investments: {
          include: {
            investor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!opportunity) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("Failed to fetch opportunity:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
