"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ExploreButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/investment-opportunities")}>
      Explore More Opportunities
    </Button>
  );
}
