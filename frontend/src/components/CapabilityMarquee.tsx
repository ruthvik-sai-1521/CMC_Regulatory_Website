const CAPABILITIES = [
  "Submission intake",
  "Batch release audit",
  "CoA / KSM matching",
  "Nitrosamine screening",
  "R-001 yield range",
  "R-002 impurity limit",
  "R-003 CoA presence",
  "R-005 deviation review",
];

export default function CapabilityMarquee() {
  const items = [...CAPABILITIES, ...CAPABILITIES];

  return (
    <section className="overflow-hidden border-b border-line bg-amber py-4 text-paper" aria-label="Rauzr Technologies capabilities">
      <div className="group flex w-max animate-marquee gap-8 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em]">
            {item}
            <span className="text-paper/40" aria-hidden="true">/</span>
          </span>
        ))}
      </div>
    </section>
  );
}