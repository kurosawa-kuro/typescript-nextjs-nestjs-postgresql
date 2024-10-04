// src/app/lib/api/apiClient.ts
const API_BASE_URL = 'http://localhost:3001';

// 汎用的なオブジェクト型を定義
type JsonObject = { [key: string]: unknown };

export class ApiClient {
  static async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      ...options,
      method: 'GET',
    });
  }

  static async post<T extends JsonObject>(endpoint: string, body: T, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  static async postFormData(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }
}