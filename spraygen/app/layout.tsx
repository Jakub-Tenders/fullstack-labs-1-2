import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SprayGen",
    default: "SprayGen",
  },
  description: "Spray wall boulder problems",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <nav aria-label="Main" className="mx-auto flex max-w-2xl gap-6 p-4">
            <Link href="/" className="font-bold">
              SprayGen
            </Link>
            <NavLink href="/problems">Problems</NavLink>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
