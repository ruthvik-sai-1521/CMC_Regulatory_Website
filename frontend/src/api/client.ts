const TOKEN_KEY = "rauzr_token";

// In local dev, VITE_API_BASE_URL is unset and requests go to the relative
// "/api/..." path, which vite.config.ts proxies to the local backend. In
// production the frontend and backend are separate Railway services, so
// this is set at build time to the backend's public URL, e.g.
// Set VITE_API_BASE_URL to the deployed Rauzr Technologies API URL.
const API_BASE =
  window.__RAUZR_API_BASE_URL__ ?? import.meta.env.VITE_API_BASE_URL ?? "";

const isProductionBuild = import.meta.env.MODE === "production";


export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function apiConfigurationError() {
  return new ApiError(
    "The application API is not configured. Set VITE_API_BASE_URL on the frontend deployment.",
    0,
    "API_NOT_CONFIGURED"
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (isProductionBuild && !API_BASE.trim()) {
    throw apiConfigurationError();
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE.replace(/\/$/, "")}/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Unable to reach the Rauzr Technologies API. Check that the backend service is running and that its URL and CORS settings are configured.",
      0,
      "API_UNREACHABLE"
    );
  }

  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.detail || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data?.code);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};
