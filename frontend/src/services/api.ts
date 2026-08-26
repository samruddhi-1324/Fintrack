const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
    let message = 'An error occurred';
    if (typeof errorBody.detail === 'string') {
      message = errorBody.detail;
    } else if (Array.isArray(errorBody.detail)) {
      message = errorBody.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    } else if (errorBody.detail) {
      message = JSON.stringify(errorBody.detail);
    }
    throw new Error(message || `HTTP Error ${response.status}`);
  }

  return response.json();
}
