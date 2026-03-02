// src/lib/api/ApiClient.ts

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // SỬA HÀM REQUEST ĐỂ XỬ LÝ FORM DATA
  private async request(path: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

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
      return await res.json();
    } catch {
      return null;
    }
  }

  get(path: string, options: RequestInit & { params?: Record<string, any> } = {}) {
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
    return this.request(url, { ...options, method: 'GET' });
  }
  
  post(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request(path, { 
        ...options, 
        method: 'POST', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }

  put(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request(path, { 
        ...options, 
        method: 'PUT', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }
  
  patch(path: string, body?: any, options: RequestInit = {}) { 
    const isFormData = body instanceof FormData;
    return this.request(path, { 
        ...options, 
        method: 'PATCH', 
        body: isFormData ? body : JSON.stringify(body) 
    }); 
  }
  
  delete(path: string, options: RequestInit = {}) { 
    return this.request(path, { ...options, method: 'DELETE' }); 
  }

  sendBeacon(path: string, body: any, customHeaders: Record<string, string> = {}) {
    const url = `${this.baseUrl}${path}`;
    const token = this.getToken();
    const headers: any = { 'Content-Type': 'application/json', ...customHeaders };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(url, { method: 'POST', headers, body: JSON.stringify(body), keepalive: true }).catch((err) => console.warn(err));
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
);