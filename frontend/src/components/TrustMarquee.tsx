const WORDMARKS = [
  "CMC TEAMS",
  "QUALITY SYSTEMS",
  "REGULATORY OPERATIONS",
  "PHARMACEUTICAL MANUFACTURING",
  "GxP REVIEW",
  "ILLUSTRATIVE MARK",
];

/**
 * Illustrative audience marks, not customer logos. Duplicated once so the CSS animation
 * loops seamlessly, and paused on hover/focus for readability and to
 * respect users tracking a specific item.
 */
export default function TrustMarquee() {
  const items = [...WORDMARKS, ...WORDMARKS];

  return (
    <div className="border-y border-line bg-white/60 py-8">
      <p className="container-page text-xs uppercase tracking-widest text-slate/70">
        Illustrative audience marks · no customer logos claimed
      </p>
      <div className="group mt-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-16 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-xl text-slate/50"
              aria-hidden={i >= WORDMARKS.length}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
