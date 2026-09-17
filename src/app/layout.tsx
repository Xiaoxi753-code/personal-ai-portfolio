import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liang Yuying | Personal AI Portfolio",
  description: "Liang Yuying 的个人主页与 AI 数字分身项目。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
