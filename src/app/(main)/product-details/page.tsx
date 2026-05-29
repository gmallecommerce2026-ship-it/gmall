import { redirect } from 'next/navigation';

// `/product-details` (no id) không có sản phẩm nào để show.
// Redirect về home thay vì crash render ProductDetailsPage với props rỗng.
export default function Page() {
  redirect('/');
}
