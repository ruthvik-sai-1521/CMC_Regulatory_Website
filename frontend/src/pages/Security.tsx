const items = [
  {
    title: "Transport security",
    body: "All traffic runs over HTTPS in any deployed environment (Railway terminates TLS at the edge). Local development uses plain HTTP on localhost only.",
  },
  {
    title: "Authentication",
    body: "Passwords are hashed with bcrypt before storage; the API never stores or logs plaintext passwords. Sessions use short-lived JWTs sent as Bearer tokens.",
  },
  {
    title: "Optional login",
    body: "The landing page, demo booking, and sample pipeline run never require an account. Login only gates the saved run-history view.",
  },
  {
    title: "Upload validation",
    body: "Uploaded files are restricted to PDF content-type, capped at 15 MB, and rejected if empty — before any parsing is attempted.",
  },
  {
    title: "Data handling",
    body: "Uploaded documents are processed to produce a compliance report and are not used to train any model. Extracted fields and the resulting report are stored so a signed-in user can review their own run history.",
  },
  {
    title: "Rate limiting",
    body: "Mutating endpoints and pipeline runs are throttled per IP to reduce abuse of the public demo.",
  },
  {
    title: "Error handling",
    body: "All API errors return a consistent JSON shape with no stack traces or internal details exposed to the client.",
  },
];

const controls = [
  { mark: "TLS", title: "HTTPS in transit", detail: "TLS is expected at the deployed edge." },
  { mark: "B", title: "bcrypt passwords", detail: "Passwords are hashed before storage." },
  { mark: "429", title: "Rate limiting", detail: "Mutating and pipeline endpoints are throttled per IP." },
  { mark: "ID", title: "Request tracing", detail: "Responses and logs share a request ID." },
  { mark: "PDF", title: "Upload validation", detail: "PDF type, size, and empty-file checks run first." },
];

export default function Security() {
  return (
    <div className="container-page py-16 md:py-20">
      <p className="text-sm text-teal-dark">Security</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-medium">How this reference build handles data</h1>
      <p className="mt-4 max-w-2xl text-slate">
        This is a demonstration scaffold, not an audited production system. The practices below
        are implemented in this codebase today; see the README's security checklist for what a
        production deployment should add on top.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Implemented security controls">
        {controls.map((control) => (
          <div key={control.title} className="border border-line bg-white/70 p-4">
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-sm bg-ink px-2 font-mono text-xs text-teal-light">{control.mark}</span>
            <h2 className="mt-4 text-sm font-medium">{control.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate">{control.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.title} className="border-t border-line pt-5">
            <h2 className="text-base font-medium">{it.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
