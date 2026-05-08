// TS-fix wiki 0031: file rỗng -> Next 15+ yêu cầu module, redirect sang /product-details
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/product-details?slug=${encodeURIComponent(slug)}`);
}
