import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
