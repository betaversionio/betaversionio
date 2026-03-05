export default function PortfolioNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        This page could not be found.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Go back home
      </a>
    </div>
  );
}
