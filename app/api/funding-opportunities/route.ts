import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const opportunities = await db.fundingOpportunity.findMany({
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
    return NextResponse.json(opportunities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    // Validate deadline is a valid date
    const deadline = new Date(data.deadline);
    if (Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: "Invalid deadline date" }, { status: 400 });
    }

    // Create the opportunity
    const opportunity = await db.fundingOpportunity.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        deadline: deadline,
        topics: JSON.stringify(data.topics),
        contactEmail: data.contactEmail,
        organizationName: data.organizationName,
        phoneNumber: data.phoneNumber,
        createdById: user.id,
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
    console.error("Create opportunity error:", error);
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
}
