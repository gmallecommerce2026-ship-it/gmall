// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wiki 0094: BẬT LẠI chặn lỗi TypeScript khi build.
  // `ignoreBuildErrors: true` (có từ 02/03) đã che 4 lỗi thật cho tới tận 08/08 — trong đó có
  // bug "avatar shop không bao giờ hiện" (đọc sai tên trường) và một file script backend bị
  // copy nhầm sang FE (import @prisma/client). Build xanh nhưng lỗi vẫn lên production.
  // Đừng bật lại `true`: nếu build gãy, hãy sửa lỗi type.
  typescript: {
    ignoreBuildErrors: false,
  },

  // Wiki 0104: đo trên prod thấy console của khách đầy log debug
  // (`🔍 Menu Item Debug`, `🔍 DEBUG PRODUCT`, dump nguyên object sản phẩm).
  // Đã gỡ các ổ lớn trong mã nguồn, nhưng gỡ tay không chặn được lần sau: chỉ cần
  // một `console.log` quên xoá là lại lên production. `removeConsole` cắt ở tầng
  // biên dịch cho bản production, GIỮ LẠI `error`/`warn` để không mất log vận hành
  // thật (PM2 vẫn cần thấy lỗi). Bản dev không bị ảnh hưởng nên vẫn debug bình thường.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  // 2. Proxy /api/* sang Backend.
  // Wiki 0094: destination trước đây viết cứng `http://localhost:4001`. Giá trị đó ĐÚNG cho
  // VPS (FE `my-next-app` và BE `nest-app` chạy cùng máy, BE PORT=4001) nhưng SAI ở mọi nơi
  // khác: dev BE nghe 3001, còn trên Render thì localhost chính là container FE.
  // Giờ đọc từ env `API_PROXY_TARGET`, fallback về localhost:4001 để hành vi trên VPS KHÔNG
  // đổi. Dev local đặt API_PROXY_TARGET=http://localhost:3001 trong .env.local.
  // Lưu ý: đây là rewrite `afterFiles` nên các route thật trong src/app/api/* (crawler, auth,
  // products) vẫn được ưu tiên — chỉ path /api/* KHÔNG khớp route nào mới rơi xuống đây.
  async rewrites() {
    const apiTarget = (process.env.API_PROXY_TARGET || "http://localhost:4001").replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
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