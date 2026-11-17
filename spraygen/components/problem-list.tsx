import Link from "next/link";
import type { Problem } from "@/lib/problems";

export function ProblemList({ problems }: { problems: Problem[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {problems.map((problem) => (
        <li key={problem.id} className="rounded border p-4">
          <Link href={`/problems/${problem.slug}`} className="font-semibold underline">
            {problem.title} ({problem.targetGrade})
          </Link>
          <p className="text-sm">{problem.holdStyle}</p>
        </li>
      ))}
    </ul>
  );
}
