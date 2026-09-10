import { useState, type FormEvent } from "react";
import { api, ApiError } from "../api/client";
import type { DemoBooking, DemoBookingInput } from "../api/types";

const initialState: DemoBookingInput = {
  full_name: "",
  work_email: "",
  company: "",
  role: "",
  team_size: "",
  message: "",
  website: "", // honeypot -- left blank and hidden from real users via CSS
};

const teamSizes = ["1–10", "11–50", "51–200", "201–1000", "1000+"];

export default function BookDemo() {
  const [form, setForm] = useState<DemoBookingInput>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<DemoBooking | null>(null);

  function update<K extends keyof DemoBookingInput>(key: K, value: DemoBookingInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await api.post<DemoBooking | null>("/demo-bookings", form);
      // A null result means the honeypot caught a bot -- show the same
      // success state so the sender learns nothing.
      setBooking(
        result ?? {
          id: "n/a",
          full_name: form.full_name,
          work_email: form.work_email,
          company: form.company,
          status: "pending",
          created_at: new Date().toISOString(),
        }
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <div className="container-page max-w-lg py-24">
        <p className="text-sm text-teal-dark">Request received</p>
        <h1 className="mt-2 text-3xl font-medium">Thanks, {booking.full_name.split(" ")[0]}.</h1>
        <p className="mt-4 text-slate">
          We've logged your request for {booking.company}. A member of the team will reach out at{" "}
          {booking.work_email} to schedule a time.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-lg py-16 md:py-20">
      <p className="text-sm text-teal-dark">Book a demo</p>
      <h1 className="mt-2 text-3xl font-medium">Tell us about your team</h1>
      <p className="mt-3 text-sm text-slate">
        No account needed — we'll follow up by email to find a time.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
        <div>
          <label htmlFor="full_name" className="field-label">
            Full name
          </label>
          <input
            id="full_name"
            required
            className="field-input"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="work_email" className="field-label">
            Work email
          </label>
          <input
            id="work_email"
            type="email"
            required
            className="field-input"
            value={form.work_email}
            onChange={(e) => update("work_email", e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="company" className="field-label">
            Company
          </label>
          <input
            id="company"
            required
            className="field-input"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            autoComplete="organization"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="field-label">
              Role
            </label>
            <input
              id="role"
              className="field-input"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="team_size" className="field-label">
              Team size
            </label>
            <select
              id="team_size"
              className="field-input"
              value={form.team_size}
              onChange={(e) => update("team_size", e.target.value)}
            >
              <option value="">Select…</option>
              {teamSizes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="field-label">
            What would you like to see? (optional)
          </label>
          <textarea
            id="message"
            rows={4}
            className="field-input"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </div>

        {/* Honeypot: real visitors never see or fill this in. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? "Submitting…" : "Request a demo"}
        </button>
      </form>
    </div>
  );
}
