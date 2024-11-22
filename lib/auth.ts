"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  try {
    const token = cookies().get("user-token");

    if (!token) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: token.value },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        aptNo: true,
        city: true,
        dob: true,
        expertise: true,
        phone: true,
        researchInterests: true,
        imageURL: true,
        state: true,
        street: true,
        zipcode: true,
      },
    });

    if (!user) {
      cookies().delete("user-token");
      return null;
    }

    return user;
  } catch {
    cookies().delete("user-token");
    return null;
  }
}
