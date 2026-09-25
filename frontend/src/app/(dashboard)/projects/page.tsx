"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BoardsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/projects/recent");
  }, [router]);

  return null;
}
