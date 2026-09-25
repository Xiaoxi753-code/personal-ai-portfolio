import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Liang Yuying 的个人主页 & AI 数字分身",
    template: "%s | Liang Yuying",
  },
  description:
    "Liang Yuying 的个人主页、项目作品与 AI 数字分身，记录全栈开发、技术探索和持续成长。",
  keywords: [
    "Liang Yuying",
    "个人主页",
    "AI 数字分身",
    "全栈开发",
    "Next.js",
    "Supabase",
  ],
  authors: [{ name: "Liang Yuying" }],
  creator: "Liang Yuying",
  openGraph: {
    title: "Liang Yuying 的个人主页 & AI 数字分身",
    description:
      "浏览个人项目与成长记录，也可以和 Liang Yuying 的 AI 数字分身对话。",
    type: "website",
    locale: "zh_CN",
    siteName: "Liang Yuying 的个人主页",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
