// src/api/registrations.ts
// Мини-клиент для работы с регистрациями Qadam Math

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://qadammath.ozat.online/api/v1";

/** Тело запроса на регистрацию */
export interface RegistrationRequest {
  parentFullName: string;
  studentFullName: string;
  studentPhone: string;   // можешь заранее нормализовать в +7XXXXXXXXXX
  studentGrade: string;   // "3" | "4" | "5" | "6" | "7" ...
  city: string;           // например: "Алматы"
  wantsSelectiveSchool: boolean;
}

/** Ответ бэка */
export interface RegistrationResponse extends RegistrationRequest {
  id: number;
  // Бэк может добавить: createdAt/updatedAt и т.п.
}

/** Универсальная ошибка API с полезными полями */
export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// ---------- внутренние утилиты ----------

function randId() {
  // простой idempotency/request-id (не крипто)
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function parseJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Единая обёртка над fetch с таймаутом, парсингом JSON и выбросом ApiError.
 */
async function request<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 12000);

  // склеиваем сигнал отмены с внешним
  const signals: AbortSignal[] = [controller.signal];
  if (init.signal) {
    const ext = init.signal;
    // если внешний сигнал уже aborted — сразу прекращаем
    if (ext.aborted) {
      clearTimeout(timeout);
      throw new DOMException("Aborted", "AbortError");
    }
    // на отмене внешнего — отменяем и наш
    ext.addEventListener("abort", () => controller.abort(), { once: true });
    signals.push(ext);
  }

  // заголовки
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("X-Request-Id")) headers.set("X-Request-Id", randId());

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    // 204 — без тела
    if (res.status === 204) {
      clearTimeout(timeout);
      return undefined as unknown as T;
    }

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const msg =
        (data && (data as any)?.message) ||
        (typeof data === "string" && data) ||
        (await res.text().catch(() => "")) ||
        `HTTP ${res.status}`;
      clearTimeout(timeout);
      throw new ApiError(res.status, msg, data ?? undefined);
    }

    clearTimeout(timeout);
    return (data as T) ?? (await res.text().then((t) => t as unknown as T));
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      throw new ApiError(499, "Запрос отменён (timeout/abort)");
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err?.message || "Сетевая ошибка", err);
  }
}

// ---------- публичные функции ----------

/** Создать регистрацию (POST /registrations) */
export async function createRegistration(
  body: RegistrationRequest,
  signal?: AbortSignal
): Promise<RegistrationResponse> {
  return request<RegistrationResponse>("/registrations", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

/** Получить список регистраций (GET /registrations) */
export async function listRegistrations(
  signal?: AbortSignal
): Promise<RegistrationResponse[]> {
  return request<RegistrationResponse[]>("/registrations", {
    method: "GET",
    signal,
  });
}
// src/api/registrations.ts

// ...остальной код остаётся как есть

/** Удалить регистрацию (DELETE /registrations/{id}) */
export async function deleteRegistration(
  id: number,
  signal?: AbortSignal
): Promise<void> {
  // если используешь мой универсальный request<T> — зови его.
  // иначе — вот прямой fetch:
  const res = await fetch(
    `${API_BASE}/registrations/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Accept: "application/json" }, signal }
  );
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = (data && data.message) || JSON.stringify(data) || msg;
    } catch {
      try { msg = await res.text() || msg; } catch {}
    }
    throw new ApiError(res.status, msg);
  }
}
