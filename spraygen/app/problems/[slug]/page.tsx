import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblem, getProblems } from "@/lib/problems";

// Only the slugs returned by generateStaticParams exist: any other slug is a 404
export const dynamicParams = false;

export async function generateStaticParams() {
  const problems = await getProblems();
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({ params }: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblem(slug);
  if (!problem) return {};
  return { title: problem.title };
}

export default async function ProblemPage({ params }: PageProps<"/problems/[slug]">) {
  const { slug } = await params;
  const problem = await getProblem(slug);
  if (!problem) notFound();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">{problem.title}</h1>
      <p className="mt-2">
        {problem.targetGrade} · {problem.holdStyle} · set by {problem.setterName}
      </p>
      <Link href="/problems" className="mt-6 inline-block underline">
        Back to all problems
      </Link>
    </main>
  );
}
