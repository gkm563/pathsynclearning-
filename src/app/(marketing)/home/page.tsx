"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(routes.home);
  }, [router]);

  return null;
}
