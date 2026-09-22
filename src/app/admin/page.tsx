"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getSupabaseBrowserClient } from "@/utils/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("请填写管理员邮箱和密码。 ");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("登录服务尚未配置，请检查环境变量后重启开发服务器。 ");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage("账号或密码错误，请检查后重试。 ");
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Admin login failed:", error);
      setErrorMessage("登录服务暂时无法响应，请稍后重试。 ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef8ff] via-[#f8f5ff] to-[#fff7f3] text-slate-700 selection:bg-violet-200 selection:text-violet-950">
      <Navbar />

      <section className="flex min-h-screen items-center justify-center px-5 pb-12 pt-32 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl text-white shadow-[0_14px_35px_rgba(99,102,241,0.25)]">
              🔐
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.22em] text-indigo-500 uppercase">
              Private entrance
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
              管理员登录
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              使用 Supabase Auth 验证管理员账号后进入后台控制台。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(76,90,130,0.14)] backdrop-blur-xl sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="text-sm font-semibold text-slate-700">
                  邮箱（Email）
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="admin@example.com"
                  disabled={isSubmitting}
                  className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700">
                  密码（Password）
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="请输入密码"
                  disabled={isSubmitting}
                  className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div
              aria-live="polite"
              className={`mt-5 min-h-12 rounded-2xl px-4 py-3 text-sm leading-6 ${errorMessage ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}
            >
              {errorMessage || "登录错误提示会显示在这里。"}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "登录中…" : "登录"}
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              仅限管理员账号使用，请勿在公共设备保存密码。
            </p>
          </form>

          <Link
            href="/"
            className="mx-auto mt-6 block w-fit text-sm font-medium text-indigo-500 no-underline transition hover:text-violet-600"
          >
            ← 返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}
