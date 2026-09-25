"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavigation = [
  { href: "/admin/dashboard", label: "留言管理" },
  { href: "/admin/knowledge", label: "AI 知识库" },
  { href: "/admin/projects", label: "项目管理" },
  { href: "/admin/love", label: "恋爱空间" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="后台管理导航"
      className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-slate-100/80 p-1.5"
    >
      {adminNavigation.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium no-underline transition ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-indigo-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
