"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#10b981", "#0ea5e9", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#fbbf24",
];

// Renders a burst of confetti pieces that fall and fade.
// Pass `fire` (a changing value) to trigger a new burst.
// We use a key-based remount so each burst is a fresh component,
// avoiding setState-in-effect lint issues.
export function Confetti({ fire }: { fire: number }) {
  if (fire === 0) return null;
  return <ConfettiBurst key={fire} />;
}

function ConfettiBurst() {
  const [visible, setVisible] = useState(true);

  // Generate pieces once on mount (stable for this burst)
  const pieces = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    delay: Math.random() * 0.4,
    duration: 2.4 + Math.random() * 1.2,
  }));

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
