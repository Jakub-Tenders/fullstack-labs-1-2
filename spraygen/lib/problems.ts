import problems from "@/data/problems.json";

export type Problem = {
  id: number;
  slug: string;
  title: string;
  setterName: string;
  targetGrade: string;
  holdStyle: string;
};

// Simulates a slow database query (1 second)
export async function getProblems(): Promise<Problem[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return problems;
}

export async function getProblem(slug: string): Promise<Problem | undefined> {
  const all = await getProblems();
  return all.find((problem) => problem.slug === slug);
}
