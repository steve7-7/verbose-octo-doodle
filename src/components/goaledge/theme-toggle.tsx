"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

// Theme toggle button. Uses next-themes' resolvedTheme.
// We render both icons and toggle visibility via CSS to avoid hydration mismatch,
// since next-themes resolves on the client after mount.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
        className,
      )}
      aria-label="Toggle theme"
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun shows in dark mode, Moon shows in light mode.
          Both rendered; CSS controls visibility based on .dark on <html>. */}
      <Sun className="hidden h-4 w-4 [.dark_&]:block" />
      <Moon className="block h-4 w-4 [.dark_&]:hidden" />
    </button>
  );
}
