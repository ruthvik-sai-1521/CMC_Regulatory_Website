import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { PipelineRun } from "../api/types";
import { useAuth } from "../context/AuthContext";
import PipelineRunAnimation from "../components/PipelineRunAnimation";

const severityColor: Record<string, string> = {
  critical: "text-red-700",
  major: "text-amber-dark",
  minor: "text-slate",
};

const verdictColor: Record<string, string> = {
  PASS: "bg-teal text-paper",
  REVIEW: "bg-amber text-paper",
  FAIL: "bg-red-700 text-paper",
};

export default function Workspace() {
  const { user, loading } = useAuth();
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<File | null>(null);
  const [qaPackage, setQaPackage] = useState<File | null>(null);
  const [history, setHistory] = useState<PipelineRun[]>([]);

  useEffect(() => {
    if (user) {
      api.get<PipelineRun[]>("/pipeline/runs").then(setHistory).catch(() => setHistory([]));
    }
  }, [user, run]);

  async function runSample() {
    setError(null);
    setRunning(true);
    try {
      const result = await api.post<PipelineRun>("/pipeline/run-sample");
      setRun(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The pipeline run failed. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  async function runUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!dossier || !qaPackage) {
      setError("Please choose both PDF files before running the pipeline.");
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const form = new FormData();
      form.append("dossier", dossier);
      form.append("qa_package", qaPackage);
      const result = await api.postForm<PipelineRun>("/pipeline/run", form);
      setRun(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The pipeline run failed. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="container-page py-16 md:py-20">
      <p className="text-sm text-teal-dark">Workspace</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-medium">Run the compliance pipeline</h1>
      <p className="mt-4 max-w-2xl text-slate">
        {loading
          ? " "
          : user
          ? `Signed in as ${user.full_name}. Your runs are saved to your history below.`
          : "You're not signed in — this still works. Sign in only if you'd like your run history saved."}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-sm border border-line bg-white/60 p-6">
          <h2 className="text-base font-medium">Option A — bundled sample</h2>
          <p className="mt-1 text-sm text-slate">
            Runs the pipeline against the reference Amlodipine Besylate API package. No files
            needed.
          </p>
          <button onClick={runSample} disabled={running} className="btn-primary mt-5 disabled:opacity-60">
            {running ? "Running…" : "Run with bundled sample"}
          </button>
        </div>

        <form onSubmit={runUpload} className="rounded-sm border border-line bg-white/60 p-6">
          <h2 className="text-base font-medium">Option B — upload your own PDFs</h2>
          <p className="mt-1 text-sm text-slate">PDF only, up to 15 MB each.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="dossier" className="field-label">
                Regulatory dossier PDF
              </label>
              <input
                id="dossier"
                type="file"
                accept="application/pdf"
                className="block w-full text-sm"
                onChange={(e) => setDossier(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <label htmlFor="qa_package" className="field-label">
                QA compliance package PDF
              </label>
              <input
                id="qa_package"
                type="file"
                accept="application/pdf"
                className="block w-full text-sm"
                onChange={(e) => setQaPackage(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <button type="submit" disabled={running} className="btn-secondary mt-5 disabled:opacity-60">
            {running ? "Running…" : "Run pipeline on uploaded files"}
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}

      {running && (
        <div aria-busy="true">
          <PipelineRunAnimation />
          <p className="sr-only">Running the compliance pipeline, please wait.</p>
        </div>
      )}

      {!running && !run && (
        <div className="mt-12 rounded-sm border border-dashed border-line p-10 text-center">
          <p className="text-sm font-medium text-ink">No run yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate">
            Run the bundled sample or upload your own dossier and QA package above — the result
            and rule-by-rule findings will appear here.
          </p>
        </div>
      )}

      {!running && run && (
        <div className="mt-12 rounded-sm border border-line p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">Result</h2>
              <p className="text-sm text-slate">
                {run.dossier_filename} + {run.qa_package_filename}
              </p>
            </div>
            {run.verdict && (
              <span className={`rounded-sm px-3 py-1 text-sm font-medium ${verdictColor[run.verdict] ?? ""}`}>
                {run.verdict} · {run.compliance_score}%
              </span>
            )}
          </div>

          {run.status === "failed" && (
            <p className="mt-4 text-sm text-red-700">{run.error_message}</p>
          )}

          {run.report && (
            <div className="mt-6 overflow-hidden rounded-sm border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/60 text-slate">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rule</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {run.report.findings.map((f) => (
                    <tr key={f.id} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate">{f.id}</span>
                        <p className="mt-1">{f.description}</p>
                      </td>
                      <td className={`px-4 py-3 font-medium ${f.passed ? "text-teal-dark" : severityColor[f.severity]}`}>
                        {f.passed ? "Pass" : `Fail (${f.severity})`}
                      </td>
                      <td className="px-4 py-3 text-slate">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {user && history.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-medium">Your run history</h2>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate">{new Date(h.created_at).toLocaleString()}</span>
                <span>{h.used_bundled_sample ? "Bundled sample" : h.dossier_filename}</span>
                <span className="font-medium">
                  {h.verdict ?? h.status} {h.compliance_score != null && `· ${h.compliance_score}%`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
