import { useEffect, useState } from "react";

const stages = [
  { label: "Ingest", detail: "Reading source PDFs" },
  { label: "Extract", detail: "Structuring CMC fields" },
  { label: "Audit", detail: "Evaluating GxP rules" },
  { label: "Report", detail: "Preparing reviewer summary" },
];

export default function PipelineRunAnimation() {
  const [stage, setStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setStage((current) => (current + 1) % stages.length), 1250);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const visibleStage = reducedMotion ? stages.length - 1 : stage;

  return (
    <div className="mt-12 overflow-hidden rounded-sm border border-line bg-ink p-6 text-paper" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-light">Live pipeline</p>
          <p className="mt-2 text-sm text-paper/75">{stages[visibleStage].detail}</p>
        </div>
        <span className="font-mono text-xs text-paper/45">{String(visibleStage + 1).padStart(2, "0")} / 04</span>
      </div>
      <div className="mt-7 grid grid-cols-4 gap-2">
        {stages.map((item, index) => (
          <div key={item.label}>
            <div className="relative h-1 overflow-hidden rounded-full bg-paper/15">
              <span className={`absolute inset-y-0 left-0 rounded-full bg-teal-light transition-[width] duration-500 ${index <= visibleStage ? "w-full" : "w-0"}`} />
            </div>
            <p className={`mt-3 font-mono text-[10px] uppercase tracking-wider ${index === visibleStage ? "text-teal-light" : "text-paper/45"}`}>{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 border-t border-paper/10 pt-4 font-mono text-[10px] text-paper/45">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-light motion-safe:animate-pulse" aria-hidden="true" />
        Processing reference dossier
      </div>
    </div>
  );
}