// src/api/certificates.ts
// API клиент для работы с сертификатами

import { API_BASE, ApiError, request, type RegistrationResponse } from "./registrations";

/** Параметры поиска сертификата */
export interface CertificateSearchParams {
  lastName?: string;
  firstName?: string;
  fullName?: string;
  iin?: string;
  phone?: string;
}

/** Регистрация (расширяем RegistrationResponse для сертификатов) */
export interface Registration extends RegistrationResponse {
  iin?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Поиск регистраций для генерации сертификата
 * GET /api/v1/certificates/search
 */
export async function searchCertificates(
  params: CertificateSearchParams,
  signal?: AbortSignal
): Promise<Registration | Registration[]> {
  const queryParams = new URLSearchParams();
  
  if (params.fullName) {
    queryParams.append("fullName", params.fullName);
  } else if (params.lastName || params.firstName) {
    if (params.lastName) queryParams.append("lastName", params.lastName);
    if (params.firstName) queryParams.append("firstName", params.firstName);
  } else if (params.iin) {
    queryParams.append("iin", params.iin);
  } else if (params.phone) {
    queryParams.append("phone", params.phone);
  }

  const queryString = queryParams.toString();
  if (!queryString) {
    throw new ApiError(400, "Необходимо указать один из параметров: fullName, lastName+firstName, iin или phone");
  }

  return request<Registration | Registration[]>(`/certificates/search?${queryString}`, {
    method: "GET",
    signal,
  });
}

/**
 * Скачать сертификат по ID регистрации
 * GET /api/v1/certificates/download?id=1
 */
export async function downloadCertificate(
  id: number,
  signal?: AbortSignal
): Promise<Blob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 секунд для PDF

  const signals: AbortSignal[] = [controller.signal];
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeout);
      throw new DOMException("Aborted", "AbortError");
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
    signals.push(signal);
  }

  try {
    const res = await fetch(`${API_BASE}/certificates/download?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorText || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      clearTimeout(timeout);
      throw new ApiError(res.status, errorMsg);
    }

    const blob = await res.blob();
    clearTimeout(timeout);
    return blob;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      throw new ApiError(499, "Запрос отменён (timeout/abort)");
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err?.message || "Сетевая ошибка", err);
  }
}

