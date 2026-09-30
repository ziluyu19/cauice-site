import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// 确保将协会官方标志自动同步至全局 favicon 和应用图标，替换掉默认 Next.js 三角标
try {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    const appFaviconPath = path.join(process.cwd(), "app", "favicon.ico");
    const pubFaviconPath = path.join(process.cwd(), "public", "favicon.ico");
    const appIconPath = path.join(process.cwd(), "app", "icon.png");

    fs.writeFileSync(appFaviconPath, logoBuffer);
    fs.writeFileSync(pubFaviconPath, logoBuffer);
    fs.writeFileSync(appIconPath, logoBuffer);
  }
} catch (e) {
  console.warn("Favicon sync warning:", e);
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
