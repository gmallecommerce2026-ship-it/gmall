// src/lib/api/ApiClient.ts
// [round15 FIX 401-clear-store] import store để clear auth state khi 401, khớp axios interceptor.
import { useUserStore } from '@/store/useUserStore';

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

        // [round15 FIX 401-clear-store] Reconcile client state với server truth (cookie đã hết hạn):
        // reset persisted store TRƯỚC khi redirect — mirror axios interceptor (api.ts) để Header/MiniCart
        // không còn hiển thị logged-in. Dùng reset nhẹ (set state + xoá storage) thay vì store.logout()
        // để tránh redirect side-effect của logout() chọi với redirect có-định-hướng bên dưới.
        try {
          useUserStore.setState({ user: null, isAuthenticated: false });
          localStorage.removeItem('user-storage');
          // [round15 L2 FIX] Trước đây 401 chỉ xoá user-storage → cart-storage +
          // gmall-checkout-storage còn nguyên → máy dùng chung rehydrate giỏ hàng
          // user cũ sang user mới (cross-user leak). Mirror đầy đủ useUserStore.logout()
          // (trừ redirect, vì block dưới đã có redirect có-định-hướng riêng).
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('gmall-checkout-storage');
        } catch { /* ignore */ }
        // [round15 L2 FIX] Reset in-memory cart + tear down chat socket (lazy import
        // tránh circular dependency) — khớp logout() để badge/MiniCart/widget chat
        // không còn dữ liệu user cũ sau khi session hết hạn qua path 401 này.
        try {
          import('@/store/useCartStore')
            .then((m) => m.useCartStore.getState().clearCart())
            .catch(() => {});
        } catch { /* ignore */ }
        try {
          import('@/store/useChatStore')
            .then((m) => {
              const s = m.useChatStore.getState();
              s.disconnectSocket();
              s.clearMessages();
              m.useChatStore.setState({
                conversations: [],
                activeConversationId: null,
                isOpen: false,
              });
            })
            .catch(() => {});
        } catch { /* ignore */ }

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

      // [round15 FIX error-shape] Throw error mang message đã chuẩn hoá + gắn shape axios-style
      // (err.response.data.message + err.status) để consumer đọc `error.response.data.message`
      // hoặc `error.message` đều lấy được lý do thật từ BE, không rơi về toast generic.
      let normalizedMessage = `API ${res.status}: ${msg}`;
      try {
        const errorJson = JSON.parse(msg);
        if (errorJson && errorJson.message) {
          normalizedMessage = Array.isArray(errorJson.message)
            ? errorJson.message.join(', ')
            : errorJson.message;
        }
      } catch {
        // body không phải JSON → giữ normalizedMessage mặc định ở trên
      }
      const err = new Error(normalizedMessage) as Error & {
        status?: number;
        response?: { status: number; data: { message: string } };
      };
      err.status = res.status;
      err.response = { status: res.status, data: { message: normalizedMessage } };
      throw err;
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

// Fix BUG-FE-10 (wiki 0030): import from centralized config (throws in prod if missing)
import { API_BASE_URL } from './config';
export const apiClient = new ApiClient(API_BASE_URL);