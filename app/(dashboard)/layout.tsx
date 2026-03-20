import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b bg-white dark:bg-zinc-900 p-4">
        {/* Placeholder para Navbar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-xl">YapaSegura</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
