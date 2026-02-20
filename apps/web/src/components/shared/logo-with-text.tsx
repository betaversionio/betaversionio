import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoWithTextProps {
  href?: string;
  logoClassName?: string;
  textClassName?: string;
  className?: string;
}

export function LogoWithText({
  href = "/",
  logoClassName,
  textClassName,
  className,
}: LogoWithTextProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 transition-colors hover:opacity-80",
        className,
      )}
    >
      <Logo className={cn("h-8 w-8 text-foreground", logoClassName)} />
      <span
        className={cn(
          "text-md font-semibold tracking-tight",
          textClassName,
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
