const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];


export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('fintrack_access_token', token);
    } else {
      sessionStorage.removeItem('fintrack_access_token');
    }
  }
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    inMemoryAccessToken = sessionStorage.getItem('fintrack_access_token');
  }
  return inMemoryAccessToken;
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Include credentials for HttpOnly refresh cookie transmission
  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };

  const response = await fetch(url, requestOptions);

  // If 401 Unauthorized and not already refreshing or calling refresh/login endpoint, attempt token refresh
  if (
    response.status === 401 &&
    retryCount === 0 &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/register') &&
    !endpoint.includes('/auth/refresh')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.access_token;
          setAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry original request with new token
          return fetchApi<T>(endpoint, options, retryCount + 1);
        } else {
          isRefreshing = false;
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
            const isPublicPath = publicPaths.some((path) => window.location.pathname.startsWith(path));
            if (!isPublicPath) {
              window.location.href = '/login';
            }
          }
        }
      } catch (err) {
        isRefreshing = false;
        setAccessToken(null);
      }
    } else {
      // Queue requests while refreshing
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((newToken: string) => {
          options.headers = {
            ...(options.headers as Record<string, string> || {}),
            'Authorization': `Bearer ${newToken}`
          };
          fetchApi<T>(endpoint, options, retryCount + 1).then(resolve).catch(reject);
        });
      });
    }
  }

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
