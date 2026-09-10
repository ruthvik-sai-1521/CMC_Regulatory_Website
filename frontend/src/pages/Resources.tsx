import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { ResourceCategory, ResourceListItem } from "../api/types";
import { useGsapReveal } from "../hooks/useGsapReveal";

const categoryLabels: Record<ResourceCategory, string> = {
  guide: "Guide",
  regulatory_update: "Regulatory update",
  whitepaper: "Whitepaper",
  changelog: "Changelog",
};

const categoryFilters: Array<{ value: ResourceCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "guide", label: "Guides" },
  { value: "regulatory_update", label: "Regulatory updates" },
  { value: "whitepaper", label: "Whitepapers" },
  { value: "changelog", label: "Changelog" },
];

export default function Resources() {
  const [resources, setResources] = useState<ResourceListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [reloadKey, setReloadKey] = useState(0);
  const gridRef = useGsapReveal<HTMLDivElement>({ childSelector: "[data-reveal-item]" });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const query = category === "all" ? "" : `?category=${category}`;
    api
      .get<ResourceListItem[]>(`/resources${query}`)
      .then((data) => {
        if (!cancelled) setResources(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load resources.");
      });
    return () => {
      cancelled = true;
    };
  }, [category, reloadKey]);

  return (
    <div className="container-page py-16 md:py-20">
      <p className="text-sm text-teal-dark">Resources</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-medium">
        Guides, regulatory updates, and whitepapers on CMC/GxP compliance
      </h1>
      <p className="mt-4 max-w-2xl text-slate">
        Written by the team building the pipeline itself -- practical notes on what actually
        matters during a first-pass regulatory review, not marketing copy.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        {categoryFilters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={category === f.value}
            onClick={() => setCategory(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              category === f.value
                ? "border-teal bg-teal text-paper"
                : "border-line text-slate hover:border-teal hover:text-teal-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-dark">
          <p>{error}</p>
          <button type="button" onClick={() => { setResources(null); setReloadKey((key) => key + 1); }} className="btn-secondary border-amber/50 px-3 py-2 text-xs text-amber-dark hover:border-amber-dark hover:text-amber-dark">Try again</button>
        </div>
      )}

      {!resources && !error && (
        <div className="mt-10 grid gap-6 md:grid-cols-2" role="status" aria-label="Loading resources">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-sm border border-line bg-white/60" />)}
        </div>
      )}

      {resources && resources.length === 0 && (
        <p className="mt-10 text-sm text-slate">No resources in this category yet.</p>
      )}

      {resources && resources.length > 0 && (
        <div ref={gridRef} className="mt-10 grid gap-6 md:grid-cols-2">
          {resources.map((r) => (
            <Link
              key={r.id}
              to={`/resources/${r.slug}`}
              data-reveal-item
              className="flex flex-col rounded-sm border border-line bg-white/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-xs text-slate">
                <span className="rounded-full bg-ink/5 px-2.5 py-1 font-medium text-ink">
                  {categoryLabels[r.category]}
                </span>
                <span>{r.read_minutes} min read</span>
              </div>
              <h2 className="mt-4 text-lg font-medium leading-snug">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{r.summary}</p>
              <p className="mt-4 text-xs text-slate/80">
                {r.author_name} · {r.author_role}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
