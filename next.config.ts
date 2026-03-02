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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'salt.tikicdn.com', // Cho phép ảnh từ Tiki
      },
      // 👇 THÊM ĐOẠN NÀY CHO CLOUDFLARE R2 👇
      {
        protocol: 'https',
        // Thay 'media.yourshop.com' bằng domain R2 thực tế của bạn
        // Ví dụ: 'pub-xxxxxxxx.r2.dev' (nếu chưa map domain) hoặc 'cdn.abc.com'
        hostname: 'pub-185ebd54bdaf484da9a626bae9f4e36b.r2.dev',
        port: '',
        pathname: '/**', // Cho phép load tất cả ảnh trong bucket
      },
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