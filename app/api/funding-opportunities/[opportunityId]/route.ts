import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "amount",
      "deadline",
      "topics",
      "contactEmail",
      "organizationName",
      "phoneNumber",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate amount is a positive number
    if (typeof data.amount !== "number" || data.amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const opportunity = await db.fundingOpportunity.update({
      where: {
        id: params.opportunityId,
      },
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        deadline: data.deadline,
        topics: JSON.stringify(data.topics),
        contactEmail: data.contactEmail,
        organizationName: data.organizationName,
        phoneNumber: data.phoneNumber,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("Update opportunity error:", error);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.fundingOpportunity.delete({
      where: {
        id: params.opportunityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json({ error: "Failed to delete opportunity" }, { status: 500 });
  }
}
