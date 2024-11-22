import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "INVESTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const investments = await db.investment.findMany({
      where: {
        investorId: user.id,
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            companyName: true,
            riskLevel: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log("API: Found investments:", investments); // Debug log
    return NextResponse.json(investments);
  } catch (error) {
    console.error("Failed to fetch investments:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "INVESTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { opportunityId, amount } = json;

    const result = await db.$transaction(async (tx) => {
      const investment = await tx.investment.create({
        data: {
          amount,
          investorId: user.id,
          opportunityId,
        },
      });

      await tx.investmentOpportunity.update({
        where: { id: opportunityId },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });

      return investment;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Failed to create investment:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
