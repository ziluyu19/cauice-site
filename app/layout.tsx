import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import fs from "fs";
import path from "path";

// 启动时确保将协会官方标志覆盖到全局 favicon 及图标缓存中
try {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    const appFaviconPath = path.join(process.cwd(), "app", "favicon.ico");
    const pubFaviconPath = path.join(process.cwd(), "public", "favicon.ico");
    const appIconPath = path.join(process.cwd(), "app", "icon.png");

    if (!fs.existsSync(appFaviconPath) || fs.statSync(appFaviconPath).size !== logoBuffer.length) {
      fs.writeFileSync(appFaviconPath, logoBuffer);
    }
    if (!fs.existsSync(pubFaviconPath) || fs.statSync(pubFaviconPath).size !== logoBuffer.length) {
      fs.writeFileSync(pubFaviconPath, logoBuffer);
    }
    if (!fs.existsSync(appIconPath) || fs.statSync(appIconPath).size !== logoBuffer.length) {
      fs.writeFileSync(appIconPath, logoBuffer);
    }
  }
} catch (e) {
  // ignore
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "中国高校校办产业协会国际合作与交流专业委员会",
  description: "International Cooperation and Exchange Committee of the Chinese Association of University-run Industries",
  icons: {
    icon: [
      { url: "/logo.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: ["/logo.png?v=2"],
    apple: [
      { url: "/logo.png?v=2", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
