import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { db } from "@/lib/db";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { registerSchema } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received registration data:", body);

    const validatedData = registerSchema.parse(body);
    console.log("Validated data:", validatedData);

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await argon2.hash(validatedData.password);

    const role = validatedData.role.toUpperCase() as UserRole;

    await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role,
        phone: validatedData.phone,
        street: validatedData.street,
        apt: validatedData.aptNo || "",
        city: validatedData.city,
        state: validatedData.state,
        zipcode: validatedData.zipcode,
        dob: new Date(validatedData.dob),
        expertise: validatedData.expertise,
        researchInterests: validatedData.researchInterests,
        imageUrl: validatedData.imageURL || "/default-avatar.png",
      },
    });

    return NextResponse.json({ success: true, redirectTo: "/login" });
  } catch (error) {
    console.error("Registration error details:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
