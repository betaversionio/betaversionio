import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This portfolio could not be found.
      </p>
      <Link
        to="/"
        className="mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Go back home
      </Link>
    </div>
  );
}
