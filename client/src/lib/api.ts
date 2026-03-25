import { useAuthStore } from "@/stores/authStore";

/**
 * Cliente HTTP:
 * - Producción detrás de Nginx + Cloudflare Tunnel: mismo origen → base "" (rutas relativas /auth, /people…).
 * - Solo definí VITE_API_URL si el API está en otro host (no aplica al flujo “solo URL del túnel”).
 */
const base = () => (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(
  path: string,
  opts: RequestInit & { token?: string | null; skipAuthRedirect?: boolean } = {}
): Promise<unknown> {
  const { token, skipAuthRedirect, headers: h, ...rest } = opts;
  const headers = new Headers(h);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${base()}${path}`, { ...rest, headers });
  const data = await parseJson(res);

  if (res.status === 401 && !skipAuthRedirect && !path.startsWith("/auth/login")) {
    useAuthStore.getState().logout();
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg, res.status, data);
  }
  return data;
}
