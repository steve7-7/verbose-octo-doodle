"use client";

import { useState } from "react";
import { Clock, ArrowLeft, ArrowRight, Search, BookOpen } from "lucide-react";
import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog-data";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "./empty-state";

const CATEGORIES = ["All", "Match Preview", "Betting Guide", "Analysis", "News"] as const;
type Category = (typeof CATEGORIES)[number];

export function BlogTab() {
  const [category, setCategory] = useState<Category>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<BlogArticle | null>(null);

  const filtered = BLOG_ARTICLES.filter((a) => {
    const matchesCat = category === "All" || a.category === category;
    const matchesQ =
      !q ||
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(q.toLowerCase());
    return matchesCat && matchesQ;
  });

  // Article detail view
  if (selected) {
    return <ArticleView article={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Blog &amp; insights
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Match previews, betting guides and expert analysis to sharpen your edge.
        </p>
      </div>

      {/* Featured article (most recent) */}
      {filtered.length > 0 && !q && category === "All" && (
        <FeaturedCard article={filtered[0]!} onClick={() => setSelected(filtered[0]!)} />
      )}

      {/* Category filter + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                category === c
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Article grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="No articles found"
          description="Try a different category or search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} onClick={() => setSelected(a)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ article, onClick }: { article: BlogArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-sm transition hover:shadow-lg"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", article.gradient)} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
      <div className="relative flex min-h-[200px] flex-col justify-end p-6 text-white">
        <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur">
          ⭐ Featured · {article.category}
        </span>
        <h2 className="text-xl font-bold leading-tight sm:text-2xl">{article.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{article.excerpt}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
          <span>by {article.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min read
          </span>
        </div>
      </div>
    </button>
  );
}

function ArticleCard({ article, onClick }: { article: BlogArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      {/* Cover */}
      <div className={cn("relative h-32 bg-gradient-to-br", article.gradient)}>
        <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          {article.category}
        </span>
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold leading-snug text-slate-900 group-hover:text-emerald-700">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">{article.excerpt}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min
          </span>
        </div>
      </div>
    </button>
  );
}

function ArticleView({ article, onBack }: { article: BlogArticle; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </button>

      {/* Cover */}
      <div className={cn("relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br sm:h-64", article.gradient)}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur">
            {article.category}
          </span>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{article.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>by {article.author}</span>
        <span>·</span>
        <span>{formatDate(article.publishedAt)}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime} min read
        </span>
      </div>

      {/* Excerpt */}
      <p className="border-l-4 border-emerald-400 pl-4 text-lg font-medium italic text-slate-700">
        {article.excerpt}
      </p>

      {/* Content */}
      <article className="max-w-none">
        {article.content.split("\n\n").map((para, i) => {
          if (para.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="mt-8 flex items-center gap-2 text-xl font-bold text-slate-900"
              >
                <span className="h-5 w-1 rounded-full bg-emerald-500" />
                {para.replace("## ", "")}
              </h2>
            );
          }
          // Check if it's a list item (starts with a number+.)
          if (/^\d+\.\s/.test(para)) {
            const lines = para.split("\n").filter(Boolean);
            return (
              <ol key={i} className="mt-3 space-y-2">
                {lines.map((line, j) => (
                  <li key={j} className="flex gap-2 leading-relaxed text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {j + 1}
                    </span>
                    <span>{line.replace(/^\d+\.\s/, "")}</span>
                  </li>
                ))}
              </ol>
            );
          }
          // Check if it starts with "- " (bullet)
          if (para.startsWith("- ")) {
            const lines = para.split("\n").filter(Boolean);
            return (
              <ul key={i} className="mt-3 space-y-1.5">
                {lines.map((line, j) => (
                  <li key={j} className="flex gap-2 leading-relaxed text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{line.replace(/^-\s/, "")}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="mt-3 leading-relaxed text-slate-600">
              {para}
            </p>
          );
        })}
      </article>

      {/* CTA */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-center text-white shadow-lg shadow-emerald-600/20">
        <h3 className="text-lg font-bold">Ready to put this into practice?</h3>
        <p className="mt-1 text-sm text-emerald-50">
          Browse today&apos;s predictions and build your accumulator with these insights.
        </p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
        >
          Browse tips
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
