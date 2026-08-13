import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Cách GMall thu thập và sử dụng dữ liệu cá nhân.',
};

// Wiki 0068 D9: ngày cập nhật cố định cho trang pháp lý.
const LAST_UPDATED = '15/01/2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wiki 0068 D8: breadcrumb cho trang chính sách */}
      <Breadcrumbs items={[{ name: 'Trang chủ', href: '/' }, { name: 'Chính sách bảo mật', href: '/privacy' }]} />
      <article className="prose prose-sm max-w-none mt-4">
      <h1>Chính sách bảo mật GMall</h1>
      <p className="text-gray-500">Cập nhật lần cuối: {LAST_UPDATED}</p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>Thông tin tài khoản: email, họ tên, số điện thoại, địa chỉ giao hàng.</li>
        <li>Lịch sử mua hàng và đơn hàng để phục vụ chăm sóc khách hàng.</li>
        <li>Cookie và dữ liệu thiết bị để duy trì phiên đăng nhập.</li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Xử lý đơn hàng và vận chuyển.</li>
        <li>Gửi thông báo đơn hàng, OTP xác thực, email marketing (có thể opt-out).</li>
        <li>Cải thiện trải nghiệm người dùng thông qua phân tích sử dụng.</li>
      </ul>

      <h2>3. Chia sẻ với bên thứ ba</h2>
      <p>
        Dữ liệu có thể được chia sẻ với:
      </p>
      <ul>
        <li>Đơn vị vận chuyển (GHN) để giao hàng.</li>
        <li>Cổng thanh toán (Pay2S) để xử lý giao dịch.</li>
        <li>Google/Facebook khi bạn chọn đăng nhập bằng các nền tảng đó.</li>
      </ul>
      <p>Không bán dữ liệu cho bên thứ ba cho mục đích quảng cáo.</p>

      <h2>4. Bảo mật</h2>
      <p>
        Mật khẩu được hash bằng bcrypt. Session dùng JWT httpOnly cookie.
        Kết nối luôn qua HTTPS ở production.
      </p>

      <h2>5. Quyền của bạn</h2>
      <ul>
        <li>Yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân.</li>
        <li>Rút lại sự đồng ý cho các email marketing bất cứ lúc nào.</li>
      </ul>

      <h2>6. Liên hệ</h2>
      <p>
        Yêu cầu về dữ liệu: <a href="mailto:an.nguyenthien112802@gmail.com">
          an.nguyenthien112802@gmail.com
        </a>.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        Bản chính sách khung. Cần review bởi legal team trước khi deploy
        production, đặc biệt nếu có user ngoài Việt Nam (GDPR).
      </p>
      </article>
    </div>
  );
}
