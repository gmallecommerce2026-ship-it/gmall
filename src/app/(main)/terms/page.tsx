import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ — GMall',
  description: 'Điều khoản sử dụng nền tảng GMall.',
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm">
      <h1>Điều khoản dịch vụ GMall</h1>
      <p className="text-gray-500">Cập nhật lần cuối: {new Date().getFullYear()}</p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>
        Khi bạn truy cập hoặc sử dụng GMall, bạn đồng ý tuân theo các điều khoản
        dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng.
      </p>

      <h2>2. Tài khoản người dùng</h2>
      <p>
        Bạn chịu trách nhiệm giữ an toàn cho tài khoản và mật khẩu. Mọi hoạt
        động dưới tài khoản của bạn được coi là do bạn thực hiện.
      </p>

      <h2>3. Giao dịch mua bán</h2>
      <p>
        GMall là nền tảng kết nối người mua và người bán. Các shop trên nền tảng
        chịu trách nhiệm về chất lượng sản phẩm; GMall đóng vai trò trung gian.
      </p>

      <h2>4. Quỹ từ thiện</h2>
      <p>
        Một phần doanh thu GMall được trích vào các quỹ từ thiện được công bố
        công khai trên trang <a href="/charity">/charity</a>.
      </p>

      <h2>5. Thay đổi điều khoản</h2>
      <p>
        GMall có quyền cập nhật điều khoản này bất cứ lúc nào. Thay đổi lớn sẽ
        được thông báo qua email đã đăng ký.
      </p>

      <h2>6. Liên hệ</h2>
      <p>
        Mọi thắc mắc liên quan đến điều khoản, vui lòng liên hệ{' '}
        <a href="mailto:an.nguyenthien112802@gmail.com">
          an.nguyenthien112802@gmail.com
        </a>.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        Đây là bản điều khoản khung — nội dung pháp lý chi tiết cần được
        legal team review trước khi go-live production.
      </p>
    </article>
  );
}
