export interface User {
  id: string;
  email: string;
  full_name: string;
  company?: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DemoBookingInput {
  full_name: string;
  work_email: string;
  company: string;
  role?: string;
  team_size?: string;
  message?: string;
  website?: string; // honeypot, always left blank by real users
}

export interface DemoBooking {
  id: string;
  full_name: string;
  work_email: string;
  company: string;
  role?: string | null;
  team_size?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
}

export interface RuleFinding {
  id: string;
  description: string;
  severity: "critical" | "major" | "minor";
  field: string;
  observed_value: unknown;
  passed: boolean;
  reason: string;
}

export interface PipelineReport {
  extracted_fields: Record<string, unknown>;
  score: number;
  verdict: "PASS" | "REVIEW" | "FAIL";
  findings: RuleFinding[];
  summary: {
    total_rules: number;
    passed: number;
    failed: number;
    critical_failures: number;
  };
}

export type ResourceCategory = "guide" | "regulatory_update" | "whitepaper" | "changelog";

export interface ResourceListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  read_minutes: number;
  author_name: string;
  author_role: string;
  published_at: string;
}

export interface Resource extends ResourceListItem {
  body_markdown: string;
  published: boolean;
  updated_at: string;
}

export interface PipelineRun {
  id: string;
  dossier_filename: string;
  qa_package_filename: string;
  status: "queued" | "running" | "succeeded" | "failed";
  used_bundled_sample: boolean;
  compliance_score?: number | null;
  verdict?: string | null;
  report?: PipelineReport | null;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}
