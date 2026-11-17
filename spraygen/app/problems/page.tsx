import type { Metadata } from "next";
import { ProblemList } from "@/components/problem-list";
import { getProblems } from "@/lib/problems";

export const metadata: Metadata = {
  title: "Problems",
};

// Rendered on each request, so loading.tsx also shows under npm start
export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Problems</h1>
      <ProblemList problems={problems} />
    </main>
  );
}
