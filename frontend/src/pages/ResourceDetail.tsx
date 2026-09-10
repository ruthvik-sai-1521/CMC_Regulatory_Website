import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { Resource, ResourceCategory } from "../api/types";
import Markdown from "../components/Markdown";
import { useGsapReveal } from "../hooks/useGsapReveal";

const categoryLabels: Record<ResourceCategory, string> = {
  guide: "Guide",
  regulatory_update: "Regulatory update",
  whitepaper: "Whitepaper",
  changelog: "Changelog",
};

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const articleRef = useGsapReveal<HTMLDivElement>({ y: 18, duration: 0.6 });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setResource(null);
    setNotFound(false);
    setError(null);
    api
      .get<Resource>(`/resources/${slug}`)
      .then((data) => {
        if (!cancelled) setResource(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiError ? err.message : "Couldn't load this resource.");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-medium">Resource not found</h1>
        <p className="mt-3 text-slate">It may have been unpublished or the link is out of date.</p>
        <Link to="/resources" className="mt-6 inline-block text-sm text-teal-dark hover:underline">
          ← Back to Resources
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-20">
        <p className="rounded-sm border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-dark">
          {error}
        </p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container-page py-20">
        <p className="text-sm text-slate" role="status">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <article className="container-page max-w-prose py-16 md:py-20">
      <Link to="/resources" className="text-sm text-teal-dark hover:underline">
        ← Back to Resources
      </Link>

      <div ref={articleRef} className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate">
          <span className="rounded-full bg-ink/5 px-2.5 py-1 font-medium text-ink">
            {categoryLabels[resource.category]}
          </span>
          <span>{resource.read_minutes} min read</span>
          <span>
            {new Date(resource.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-medium leading-tight md:text-4xl">{resource.title}</h1>
        <p className="mt-4 text-slate">{resource.summary}</p>
        <p className="mt-2 text-xs text-slate/80">
          {resource.author_name} · {resource.author_role}
        </p>

        <div className="mt-10 border-t border-line pt-8">
          <Markdown content={resource.body_markdown} />
        </div>
      </div>
    </article>
  );
}
