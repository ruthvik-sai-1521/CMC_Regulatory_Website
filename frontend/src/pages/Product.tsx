import { useGsapReveal } from "../hooks/useGsapReveal";

const rules = [
  { id: "R-001", desc: "Batch yield must fall within the validated range (85–102%).", severity: "critical" },
  { id: "R-002", desc: "Nitrosamine impurity must not exceed the acceptable intake limit.", severity: "critical" },
  { id: "R-003", desc: "Certificate of Analysis (CoA) must be present.", severity: "major" },
  { id: "R-004", desc: "Every key starting material must have a matching CoA reference.", severity: "major" },
  { id: "R-005", desc: "No open, unresolved deviations linked to the batch.", severity: "critical" },
  { id: "R-006", desc: "Nomenclature (INN / IUPAC name) must be present.", severity: "minor" },
];

export default function Product() {
  const rulesRef = useGsapReveal<HTMLTableSectionElement>({ childSelector: "tr", y: 16, stagger: 0.06 });

  return (
    <div className="container-page py-16 md:py-20">
      <p className="text-sm text-teal-dark">Product</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-medium">How the pipeline works</h1>
      <p className="mt-4 max-w-2xl text-slate">
        Rauzr Technologies' core is a three-stage pipeline: ingest source PDFs, extract structured CMC
        data, then evaluate that data against a configurable GxP rule set. The rule set below
        ships with this reference build; production deployments replace it with a firm's own
        rule library.
      </p>

      <div className="mt-12 overflow-hidden rounded-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/60 text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Rule</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody ref={rulesRef}>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs text-slate">{r.id}</td>
                <td className="px-4 py-3">{r.desc}</td>
                <td className="px-4 py-3 capitalize">{r.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-xs text-slate">
        This is an illustrative rule set for demonstration, not a validated GxP compliance tool.
        See the README for how to extend `rules.yaml` with your own checks.
      </p>
    </div>
  );
}
