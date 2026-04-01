// frontend/lib/api.ts
// NOTE: JSON fetches are intentionally no-store; images should be cacheable.

type HTTPError = Error & {
  status?: number;
  payload?: any;
  detail?: any;
};

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Exported helper so UI code can build direct download URLs (CSV, images, etc.)
export function apiUrl(path: string): string {
  return joinUrl(path);
}

function joinUrl(path: string) {
  // If someone passes an absolute URL by accident, keep it.
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n) + "…(truncated)";
}

async function parseJSONSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // Keep raw payload for debugging, but avoid gigantic error strings.
    return { _raw: truncate(text, 4000) };
  }
}

async function parseJSONOrNull(res: Response) {
  // Success-path parser: tolerate empty bodies.
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // If a success response returns non-JSON unexpectedly, surface the raw value.
    return { _raw: truncate(text, 4000) };
  }
}

function extractDetail(payload: any) {
  // FastAPI typically uses {"detail": ...}; sometimes detail is nested, or payload itself is the detail.
  if (payload && typeof payload === "object" && "detail" in payload) return (payload as any).detail;
  return payload;
}

async function errorFrom(res: Response, method: string, url: string) {
  const payload = await parseJSONSafe(res);
  const bodyStr = payload === null ? "null" : JSON.stringify(payload);
  const err: HTTPError = new Error(
    `${method} ${url} failed: ${res.status} ${res.statusText} :: ${truncate(bodyStr, 4000)}`
  );
  err.status = res.status;
  err.payload = payload;
  err.detail = extractDetail(payload);
  return err;
}

export async function getText(path: string): Promise<string> {
  const url = joinUrl(path);
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/plain, text/csv, */*" },
  });

  if (!res.ok) throw await errorFrom(res, "GET", url);

  return await res.text();
}


export async function getJSON<T>(path: string): Promise<T> {
  const url = joinUrl(path);
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw await errorFrom(res, "GET", url);

  const payload = await parseJSONOrNull(res);
  return payload as T;
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const url = joinUrl(path);
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw await errorFrom(res, "POST", url);

  const payload = await parseJSONOrNull(res);
  return payload as T;
}

export async function deleteJSON<T>(path: string): Promise<T> {
  const url = joinUrl(path);
  const res = await fetch(url, {
    method: "DELETE",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw await errorFrom(res, "DELETE", url);

  const payload = await parseJSONOrNull(res);
  return payload as T;
}

/**
 * Build an <img src="..."> URL.
 *
 * IMPORTANT:
 * - For image endpoints where the URL already uniquely identifies the content
 *   (e.g., /t/{t}/... plus query params), adding an extra cache-busting param
 *   can reduce cache reuse and worsen initial playback.
 * - Therefore, we only append `v=` when explicitly requested AND when the path
 *   does not already look like a PNG render endpoint.
 */
export function imgSrc(path: string, cacheKey?: string | number): string {
  const url = joinUrl(path);
  if (cacheKey === undefined || cacheKey === null) return url;

  // url is typically absolute; base is only relevant if it's not.
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  u.searchParams.set("v", String(cacheKey));
  return u.toString();
}

/**
 * Explicit cache-buster for images (including PNG renders).
 * Use sparingly.
 */
export function imgSrcBust(path: string, cacheKey: string | number): string {
  const url = joinUrl(path);
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  u.searchParams.set("v", String(cacheKey));
  return u.toString();
}
