import { Fragment } from "react";

/** Renders **bold** segments within a line of text; everything else is plain text. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    )
  );
}

/**
 * A small, intentionally limited markdown renderer for resource body content.
 * Supports ## headings, "- " bullet lists, "1. " numbered lists, **bold**,
 * and paragraphs. Content is admin-authored (see routers/resources.py --
 * writes are admin-gated), so this favors simplicity over covering the full
 * CommonMark spec.
 */
export default function Markdown({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="prose-content space-y-5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2), `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\.\s/, ""), `${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }

        if (lines.length === 1 && lines[0].startsWith("## ")) {
          return (
            <h2 key={i} className="pt-2 text-xl font-medium text-ink">
              {inline(lines[0].slice(3), `${i}`)}
            </h2>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-slate">
            {inline(lines.join(" "), `${i}`)}
          </p>
        );
      })}
    </div>
  );
}
