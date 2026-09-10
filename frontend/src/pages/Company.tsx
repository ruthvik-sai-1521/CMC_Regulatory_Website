import { Link } from "react-router-dom";
import { useGsapReveal } from "../hooks/useGsapReveal";

const principles = [
  {
    title: "Show the reasoning, not just the score",
    body: "Every finding in a compliance report links back to the exact field and rule that produced it. A verdict a reviewer can't trace back to its source isn't useful, no matter how accurate it is.",
  },
  {
    title: "Automate the mechanical, not the judgment",
    body: "Locating values and checking them against a rule set is mechanical work worth automating. Deciding whether a borderline deviation is acceptable is a judgment call that stays with a qualified reviewer.",
  },
  {
    title: "Configurable rules, not a black box",
    body: "The rule set that scores a dossier is a plain, editable file, not a hidden model. A firm's own regulatory rules should be inspectable and versioned like any other compliance artifact.",
  },
  {
    title: "Data stays the customer's",
    body: "Uploaded documents are processed to produce a report and are not used to train any model. Every run is logged with a request ID for audit purposes -- see the Security page for specifics.",
  },
];

const milestones = [
  { label: "Core pipeline", body: "Structured extraction + configurable GxP rule audit, with a bundled sample dossier so the pipeline is testable with no account and no real documents." },
  { label: "Public resource hub", body: "Real guides and regulatory notes on CMC/GxP review, backed by an admin-editable CRUD API rather than static marketing pages." },
  { label: "Login persistence fix", body: "Diagnosed and fixed the root cause of registered accounts disappearing after a restart -- see the Resources changelog for the writeup." },
];

export default function Company() {
  const principlesRef = useGsapReveal<HTMLDivElement>({ childSelector: "[data-reveal-item]" });
  const milestonesRef = useGsapReveal<HTMLDivElement>({ childSelector: "[data-reveal-item]", y: 16 });

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="container-page py-20 md:py-24">
          <p className="text-sm text-teal-light">Company</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] md:text-5xl">
            We build tools for the reviewer, not around them
          </h1>
          <p className="mt-6 max-w-xl text-base text-paper/80">
            Rauzr Technologies Pvt Ltd started from a simple observation: most of a regulatory reviewer's time
            on a first pass isn't spent making judgment calls -- it's spent locating values
            across long PDFs and re-checking arithmetic that should already have been
            validated. We build the pipeline that handles that first, so the reviewer's
            attention goes to the parts that actually need it.
          </p>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <h2 className="max-w-lg text-3xl font-medium">What we believe about compliance tooling</h2>
        <div ref={principlesRef} className="mt-12 grid gap-6 md:grid-cols-2">
          {principles.map((p) => (
            <div
              key={p.title}
              data-reveal-item
              className="rounded-sm border border-line bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal hover:shadow-md"
            >
              <h3 className="text-base font-medium">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white/60">
        <div className="container-page py-20 md:py-24">
          <h2 className="max-w-lg text-3xl font-medium">Where the reference build stands today</h2>
          <p className="mt-4 max-w-2xl text-sm text-slate">
            This is an open reference build, not a finished commercial product -- see the README
            for the full architecture writeup, limitations, and what's planned next.
          </p>
          <div ref={milestonesRef} className="mt-10 grid gap-8 md:grid-cols-3">
            {milestones.map((m, i) => (
              <div key={m.label} data-reveal-item className="border-t border-line pt-6">
                <span className="font-mono text-sm text-teal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-base font-medium">{m.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink text-paper">
        <div className="container-page flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-md text-2xl font-medium">
            Read how the pipeline works, or try it on the bundled sample dossier.
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/product" className="btn-primary">
              See the product
            </Link>
            <Link
              to="/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-paper/30 px-5 py-3 text-sm font-medium text-paper transition-colors hover:border-paper"
            >
              Try the sample pipeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
