import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 container py-4 sm:py-8 px-3 sm:px-6 pb-24">
        {children}
      </main>
    </div>
  );
}
