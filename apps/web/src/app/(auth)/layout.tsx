"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
      <Particles
        className="absolute inset-0"
        color="#666666"
        ease={20}
        quantity={120}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-8">
        <Button asChild className="absolute top-4 left-4" variant="ghost">
          <Link href="/">
            <ChevronLeft className="size-4" />
            Home
          </Link>
        </Button>

        <div className="mx-auto sm:w-sm">{children}</div>
      </div>
    </div>
  );
}
