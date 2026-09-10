import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PipelineAnimation from "../components/PipelineAnimation";
import StatCounter from "../components/StatCounter";
import TrustMarquee from "../components/TrustMarquee";
import CapabilityMarquee from "../components/CapabilityMarquee";
import CaseStudyCarousel from "../components/CaseStudyCarousel";
import { useMagnetic } from "../hooks/useMagnetic";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { target: 98, suffix: "%", label: "Rule-match accuracy on the reference dossier set" },
  { target: 40, suffix: "×", label: "Faster than a manual first-pass review" },
  { target: 18, suffix: "", label: "GxP rules evaluated per pipeline run" },
];

const steps = [
  {
    n: "01",
    title: "Ingest source PDFs",
    body: "Drop in a regulatory dossier (ICH CTD Module 3.2.S) and a site QA package — eBMR, CoA, deviation logs — exactly as your team already files them.",
  },
  {
    n: "02",
    title: "Structured extraction",
    body: "Rauzr Technologies parses nomenclature, key starting materials, yields, impurity levels, and QA records into a structured record it can reason about.",
  },
  {
    n: "03",
    title: "GxP rule audit",
    body: "A configurable rule set evaluates every batch, producing a scored compliance report and a clear filing verdict — pass, review, or fail.",
  },
];

const workflows = [
  { title: "Submission intake", body: "Standardize incoming dossiers before they reach a reviewer's desk." },
  { title: "Batch release audit", body: "Check yield, impurity, and deviation data against your rule set automatically." },
  { title: "CoA / KSM matching", body: "Confirm every key starting material has a matching certificate of analysis." },
  { title: "Nitrosamine screening", body: "Flag impurity levels that exceed acceptable intake limits before they become a finding." },
];

export default function Landing() {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const primaryCtaRef = useMagnetic<HTMLAnchorElement>();

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const copy = heroCopyRef.current;
    const media = heroMediaRef.current;
    if (!hero || !copy || !media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(copy.children, { opacity: 0, y: 24 }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.12,
      });
      gsap.to(media, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative isolate overflow-hidden border-b border-line bg-ink text-paper">
        <div ref={heroMediaRef} className="absolute inset-0 -z-10 h-[112%] bg-[radial-gradient(circle_at_78%_38%,rgba(58,163,145,0.24),transparent_28%),linear-gradient(120deg,#0b1420_0%,#14263a_58%,#203d4d_100%)] motion-reduce:h-full" aria-hidden="true">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(246,244,239,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(246,244,239,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="absolute right-[12%] top-[18%] h-64 w-64 rounded-full border border-teal-light/20 motion-safe:animate-pulse-soft" />
          <div className="absolute right-[18%] top-[27%] h-32 w-32 rounded-full border border-amber-light/30" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,27,43,0.98)_0%,rgba(15,27,43,0.82)_48%,rgba(15,27,43,0.55)_100%)]" />
        <div className="container-page grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-32">
          <div ref={heroCopyRef} className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-light">CMC &amp; GxP regulatory compliance</p>
            <h1 className="mt-5 max-w-xl font-display text-5xl font-medium leading-[1.02] md:text-7xl">
              Read the dossier. Run the audit. Know the verdict.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-paper/75 md:text-lg">
              Rauzr Technologies turns unstructured regulatory dossiers and QA packages into a scored,
              rule-by-rule compliance report — so your regulatory and quality teams spend their
              time on judgment calls, not manual document review.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link ref={primaryCtaRef} to="/book-demo" className="btn-primary">
                Book a demo
              </Link>
              <Link
                to="/workspace"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-paper/30 px-5 py-3 text-sm font-medium text-paper transition-colors hover:border-paper"
              >
                Try the sample pipeline
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-paper/50">No account required to try the sample run.</p>
          </div>

          <PipelineAnimation />
        </div>

        {/* Stats */}
        <div className="border-t border-paper/10">
          <div className="container-page grid gap-10 py-10 sm:grid-cols-3 sm:py-12">
            {stats.map((s) => (
              <StatCounter key={s.label} target={s.target} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <TrustMarquee />

      <CapabilityMarquee />

      {/* How it works */}
      <section className="container-page py-20 md:py-24">
        <h2 className="max-w-lg text-3xl font-medium">One pipeline, three stages</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-line pt-6">
              <span className="font-mono text-sm text-teal">{s.n}</span>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <CaseStudyCarousel />

      {/* Workflows */}
      <section className="border-y border-line bg-white/60">
        <div className="container-page py-20 md:py-24">
          <h2 className="max-w-lg text-3xl font-medium">Built for regulatory and quality teams</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {workflows.map((w) => (
              <div
                key={w.title}
                className="flex gap-4 rounded-sm border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-1 hover:border-teal hover:shadow-md"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-medium">{w.title}</h3>
                  <p className="mt-1 text-sm text-slate">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container-page py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-medium">Your dossiers stay yours</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate">
              Uploaded documents are processed to generate a report and are not used to train any
              model. Every pipeline run is logged with a request ID for audit purposes. See the
              full security posture for this reference build.
            </p>
            <Link to="/security" className="mt-6 inline-block text-sm text-teal-dark hover:underline">
              Read the security overview →
            </Link>
          </div>
          <ul className="space-y-4 border-t border-line pt-6 text-sm text-slate md:border-t-0 md:border-l md:pl-8 md:pt-0">
            <li>HTTPS in transit; passwords hashed with bcrypt, never stored in plain text.</li>
            <li>Account login is optional everywhere — the sample pipeline run needs no sign-up.</li>
            <li>File uploads are validated by type and size before processing.</li>
            <li>Every API response follows a consistent, non-leaking error format.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="container-page flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-md text-2xl font-medium">
            See Rauzr Technologies against one of your own dossiers.
          </h2>
          <Link to="/book-demo" className="btn-primary">
            Book a demo
          </Link>
        </div>
      </section>
    </>
  );
}
