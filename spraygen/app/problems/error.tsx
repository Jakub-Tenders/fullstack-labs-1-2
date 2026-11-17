"use client";

export default function ProblemsError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">The problems could not be loaded</h1>
      <p className="mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
      <button type="button" onClick={() => retry()} className="mt-4 rounded border px-4 py-2">
        Try again
      </button>
    </main>
  );
}
