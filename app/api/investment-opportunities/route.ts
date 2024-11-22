import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const opportunity = await db.investmentOpportunity.create({
      data: {
        ...json,
        createdById: user.id,
      },
    });

    return NextResponse.json(opportunity);
  } catch (error: unknown) {
    console.error("Failed to create opportunity:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const opportunities = await db.investmentOpportunity.findMany({
      include: {
        investments: {
          select: {
            amount: true,
            investorId: true,
          },
        },
      },
    });
    return NextResponse.json(opportunities);
  } catch (error: unknown) {
    console.error("Failed to fetch opportunities:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
