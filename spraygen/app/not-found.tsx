import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link href="/problems" className="mt-6 inline-block underline">
        See all problems
      </Link>
    </main>
  );
}
