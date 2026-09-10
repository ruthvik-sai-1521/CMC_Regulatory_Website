import { useEffect, useState } from "react";

const STAGES = [
  { key: "ingest", label: "Ingest", detail: "Amlodipine_Besylate_API.pdf" },
  { key: "extract", label: "Extract", detail: "12 fields structured" },
  { key: "audit", label: "Audit", detail: "18 GxP rules evaluated" },
] as const;

const VERDICT_LABEL = "PASS · 100%";

/**
 * The one deliberate animated element on the landing page: a three-node
 * SVG diagram that cycles through ingest -> extract -> audit, with a dot
 * traveling along the connecting path and each node lighting up in turn.
 * Freezes on a static end-state for prefers-reduced-motion.
 */
export default function PipelineAnimation() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setActiveStage((s) => (s + 1) % (STAGES.length + 1));
    }, 1600);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Reduced motion: show the finished state permanently, no interval running.
  const displayStage = reducedMotion ? STAGES.length : activeStage;
  const isComplete = displayStage === STAGES.length;

  const nodeX = [40, 180, 320];
  const nodeY = 60;

  return (
    <div className="self-start rounded-sm border border-paper/15 bg-ink-700/60 p-6">
      <p className="font-mono text-xs text-paper/60">compliance_pipeline.run()</p>

      <svg
        viewBox="0 0 360 130"
        className="mt-4 w-full"
        role="img"
        aria-label={
          isComplete
            ? "Pipeline diagram: ingest, extract, and audit stages complete, verdict pass"
            : `Pipeline diagram, currently running the ${STAGES[displayStage]?.label ?? ""} stage`
        }
      >
        {/* connecting line */}
        <line x1={nodeX[0]} y1={nodeY} x2={nodeX[2]} y2={nodeY} stroke="#2E8C7D" strokeOpacity="0.25" strokeWidth="2" />

        {/* progress line, grows as stages complete */}
        <line
          x1={nodeX[0]}
          y1={nodeY}
          x2={displayStage >= 2 ? nodeX[2] : displayStage === 1 ? nodeX[1] : nodeX[0]}
          y2={nodeY}
          stroke="#2E8C7D"
          strokeWidth="2"
          style={{ transition: reducedMotion ? "none" : "x2 0.6s ease" }}
        />

        {/* traveling dot, hidden once the run is complete or motion is reduced */}
        {!reducedMotion && !isComplete && (
          <circle r="4" fill="#C98A1D">
            <animate
              attributeName="cx"
              values={`${nodeX[0]};${nodeX[1]};${nodeX[2]};${nodeX[2]}`}
              keyTimes="0;0.4;0.8;1"
              dur="4.8s"
              repeatCount="indefinite"
            />
            <animate attributeName="cy" values={`${nodeY};${nodeY};${nodeY};${nodeY}`} dur="4.8s" repeatCount="indefinite" />
          </circle>
        )}

        {STAGES.map((stage, i) => {
          const lit = displayStage > i || isComplete;
          const active = displayStage === i && !isComplete;
          return (
            <g key={stage.key}>
              <circle
                cx={nodeX[i]}
                cy={nodeY}
                r={active ? 10 : 8}
                fill={lit ? "#2E8C7D" : "#0F1B2B"}
                stroke={lit || active ? "#2E8C7D" : "#4A5568"}
                strokeWidth="2"
                style={{ transition: reducedMotion ? "none" : "r 0.3s ease, fill 0.4s ease" }}
              />
              <text
                x={nodeX[i]}
                y={nodeY + 30}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill={lit || active ? "#F6F4EF" : "#8892A0"}
              >
                {stage.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-5 border-t border-paper/10 pt-4 font-mono text-xs text-paper/70">
        {isComplete ? (
          <p>
            <span className="text-paper/60">verdict →</span>{" "}
            <span className="font-medium text-teal-light">{VERDICT_LABEL}</span>
          </p>
        ) : (
          <p>
            <span className="text-paper/60">running →</span> {STAGES[displayStage]?.detail}
          </p>
        )}
      </div>
    </div>
  );
}
