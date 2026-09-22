import Link from "next/link";

export default function CRMNotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-flora-border bg-white p-8 text-center">
      <h1 className="font-display text-2xl font-semibold text-flora-foreground">
        Not found
      </h1>
      <p className="mt-2 text-sm text-flora-muted">
        The record you are looking for does not exist or was deleted.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-block rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-flora-primary-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
