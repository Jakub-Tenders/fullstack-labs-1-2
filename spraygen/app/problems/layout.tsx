export default function ProblemsLayout({ children }: LayoutProps<"/problems">) {
  return (
    <>
      <p className="mx-auto max-w-2xl px-8 pt-6 text-sm">Spray wall problems</p>
      {children}
    </>
  );
}
