// src/api/registrations.ts
// Мини-клиент для работы с регистрациями Qadam Math

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://qadammath.ozat.online/api/v1";

/** Тело запроса на регистрацию */
export interface RegistrationRequest {
  parentFullName: string;
  studentFullName: string;
  studentPhone: string;     // форматируй как "+7 700 000 0000"
  studentGrade: string;     // "3" | "4" | "5" | "6" | "7" ...
  city: string;             // например: "Алматы"
  wantsSelectiveSchool: boolean;
}

/** Ожидаемый ответ бэка (минимум: id) */
export interface RegistrationResponse extends RegistrationRequest {
  id: number;
  // backend может добавить поля: createdAt/updatedAt и т.п.
}

/** Общая ошибка API */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Хелпер: бросаем содержимое ответа как ошибку */
async function throwApiError(res: Response): Promise<never> {
  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.json();
    msg = data?.message || JSON.stringify(data);
  } catch {
    msg = await res.text();
  }
  throw new ApiError(res.status, msg || `HTTP ${res.status}`);
}

/** Создать регистрацию (POST /registrations) */
export async function createRegistration(
  body: RegistrationRequest,
  signal?: AbortSignal
): Promise<RegistrationResponse> {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) await throwApiError(res);
  return res.json();
}

/** (опционально) Получить список регистраций */
export async function listRegistrations(
  signal?: AbortSignal
): Promise<RegistrationResponse[]> {
  const res = await fetch(`${API_BASE}/registrations`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
}
