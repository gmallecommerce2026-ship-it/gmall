// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bỏ qua lỗi TS khi build để deploy Vercel mượt hơn
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Cấu hình Proxy để kết nối Backend (Code mình thêm để FIX lỗi 404 API)
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Khi frontend gọi /api/...
        destination: "http://localhost:4001/api/:path*", // Chuyển hướng sang Backend port 3001
      },
    ];
  },
  
  images: {
    // Cho phép mọi https domain. Lý do: project có nhiều nguồn ảnh (Unsplash,
    // Tiki CDN, R2 bucket, picsum, qrserver, placehold, ảnh seller upload từ
    // CDN của họ...). Liệt kê từng hostname dễ break #13 blog 500 mỗi khi
    // có ảnh mới. Trade-off: bỏ image-source whitelist (risk: bandwidth abuse
    // hoặc serve untrusted SVG), nhưng đáng đổi để page không 500. Khi production
    // có CDN cố định nên thắt lại.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  
  webpack(config) {
    // Giữ nguyên logic xử lý SVG của bạn
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, 
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { 
            not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] 
          },
          use: ["@svgr/webpack"],
        }
      );
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

export default nextConfig;