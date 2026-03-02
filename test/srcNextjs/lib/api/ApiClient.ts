// src/lib/api/ApiClient.ts

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // [UPDATE] Thêm Generic <T> để định nghĩa kiểu dữ liệu trả về
  private async request<T = any>(path: string, options: RequestInit = {}): Promise<T | null> {
    const headers: HeadersInit = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    };

    const res = await fetch(`${this.baseUrl}${path}`, fetchOptions);
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;

        // Kiểm tra để tránh lặp vô tận nếu đang ở trang login
        const isLoginPage = pathname.includes('/login');

        if (!isLoginPage) {
          // Logic phân luồng redirect thông minh
          if (pathname.startsWith('/admin')) {
              // Nếu đang ở trang Admin -> Về Login Admin
              window.location.href = '/admin/login';
          } else if (pathname.startsWith('/seller')) {
              // Nếu đang dùng client này cho Seller (dự phòng)
              window.location.href = '/seller/login';
          } else {
              // Mặc định về trang User
              window.location.href = '/login';
          }
          // Dừng xử lý tiếp để không throw Error rác ra console
          return null; 
        }
      }
    }
    if (!res.ok) {
      const msg = await res.text();
      if (path.includes('tracking')) return null; 
      
      try {
          const errorJson = JSON.parse(msg);
          throw new Error(Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message);
      } catch (e) {
          throw new Error(`API ${res.status}: ${msg}`);
      }
    }
    try {
      return await res.json() as T;
    } catch {
      return null;
    }
  }

  // [UPDATE] Thêm <T = any> vào hàm get
  get<T = any>(path: string, options: RequestInit & { params?: Record<string, any> } = {}) {
    let url = path;
    if (options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
        const queryString = params.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        delete options.params;
    }
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  // [UPDATE] Thêm <T = any> vào hàm post
  post<T = any>(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request<T>(path, { 
        ...options, 
        method: 'POST', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }

  // [UPDATE] Thêm <T = any> vào hàm put
  put<T = any>(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request<T>(path, { 
        ...options, 
        method: 'PUT', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }
  
  // [UPDATE] Thêm <T = any> vào hàm patch
  patch<T = any>(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request<T>(path, { 
        ...options, 
        method: 'PATCH', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }
  
  // [UPDATE] Thêm <T = any> vào hàm delete
  delete<T = any>(path: string, options: RequestInit = {}) { 
    return this.request<T>(path, { ...options, method: 'DELETE' }); 
  }

  sendBeacon(path: string, body: any, customHeaders: Record<string, string> = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers: any = { 'Content-Type': 'application/json', ...customHeaders };
    fetch(url, { method: 'POST', headers, body: JSON.stringify(body), keepalive: true }).catch((err) => console.warn(err));
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
);