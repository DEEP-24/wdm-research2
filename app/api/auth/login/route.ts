import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schema";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          fieldErrors: {
            email: ["Invalid email format"],
            password: ["Invalid password format"],
          },
        },
        { status: 400 },
      );
    }

    const { email, password } = validatedFields.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          fieldErrors: {
            email: ["Email does not exist"],
          },
        },
        { status: 400 },
      );
    }

    const passwordsMatch = await argon2.verify(user.password, password);

    if (!passwordsMatch) {
      return NextResponse.json(
        {
          fieldErrors: {
            password: ["Incorrect password"],
          },
        },
        { status: 400 },
      );
    }

    // Set the cookie
    cookies().set("token", user.id);

    // Return redirect URL with the success response
    return NextResponse.json({ success: true, redirectTo: "/" });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
