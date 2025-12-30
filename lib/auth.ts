// ============================================
// TOKEN MANAGEMENT
// ============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get/Set Tokens
export const getAccessToken = () => 
  localStorage.getItem('admin_access_token') || sessionStorage.getItem('admin_access_token');

export const getRefreshToken = () => 
  localStorage.getItem('admin_refresh_token') || sessionStorage.getItem('admin_refresh_token');

export const saveTokens = (accessToken: string, refreshToken: string, remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('admin_access_token', accessToken);
  storage.setItem('admin_refresh_token', refreshToken);
  
  // Set cookie
  const maxAge = remember ? 30 * 24 * 60 * 60 : 0;
  document.cookie = `admin_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Strict`;
};

export const clearTokens = () => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie = 'admin_access_token=; path=/; max-age=0';
};

// Check token expiry
const isTokenExpired = (token: string) => {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

// ============================================
// TOKEN REFRESH
// ============================================
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

export const refreshToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    window.location.href = '/login';
    return null;
  }

  // If already refreshing, wait
  if (isRefreshing) {
    return new Promise(resolve => pendingRequests.push(resolve));
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Refresh failed');

    const wasRemembered = !!localStorage.getItem('admin_refresh_token');
    saveTokens(data.data.accessToken, data.data.refreshToken, wasRemembered);

    // Notify pending requests
    pendingRequests.forEach(callback => callback(data.data.accessToken));
    pendingRequests = [];
    
    return data.data.accessToken;
  } catch (error) {
    clearTokens();
    window.location.href = '/login';
    return null;
  } finally {
    isRefreshing = false;
  }
};

// ============================================
// AUTHENTICATED FETCH
// ============================================
export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = getAccessToken();

  // Refresh if expired
  if (!token || isTokenExpired(token)) {
    token = await refreshToken();
    if (!token) throw new Error('Authentication failed');
  }

  // Make request
  let response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // Retry once if 401
  if (response.status === 401) {
    token = await refreshToken();
    if (token) {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  }

  return response;
}

// ============================================
// AUTH ACTIONS
// ============================================
export const auth = {
  async login(email: string, password: string, remember: boolean) {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    saveTokens(data.data.accessToken, data.data.refreshToken, remember);
    return data;
  },

  async logout(logoutFromAllDevices = false) {
    try {
      await apiFetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        body: JSON.stringify({ logoutFromAllDevices }),
      });
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  },

  isAuthenticated() {
    return !!getAccessToken();
  },
};
