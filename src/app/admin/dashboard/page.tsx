"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import Navbar from "@/components/Navbar";
import { getSupabaseBrowserClient } from "@/utils/supabase";

type Message = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAvatar(nickname: string) {
  return nickname.trim().slice(0, 1).toUpperCase() || "访";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMessages = useCallback(async () => {
    await Promise.resolve();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("数据库服务尚未配置，请检查环境变量后重启开发服务器。 ");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, nickname, content, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages((data ?? []) as Message[]);
    } catch (error) {
      console.error("Failed to load admin messages:", error);
      setErrorMessage("留言加载失败，请检查网络后重试。 ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(initialLoadTimer);
  }, [loadMessages]);

  async function handleDelete(message: Message) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `确定要删除「${message.nickname}」的这条留言吗？删除后无法恢复。`,
    );
    if (!confirmed) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("数据库服务尚未配置，暂时无法删除。 ");
      return;
    }

    setDeletingId(message.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", message.id);

      if (error) throw error;
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== message.id),
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
      setErrorMessage("删除失败，请确认已执行删除权限 SQL，或稍后重试。 ");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("登录服务尚未配置，暂时无法退出。 ");
      return;
    }

    setIsSigningOut(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("Admin logout failed:", error);
      setErrorMessage("退出登录失败，请稍后重试。 ");
      setIsSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef8ff] via-[#f8f5ff] to-[#fff7f3] text-slate-700 selection:bg-violet-200 selection:text-violet-950">
      <Navbar />

      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pt-48">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(76,90,130,0.14)] backdrop-blur-xl sm:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-indigo-500 uppercase">Private dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">欢迎老板！</h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">这里是个人主页的后台控制台。你可以查看留言，并删除不合适的内容。</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-400" />已通过身份验证</span>
            </div>

            <AdminNav />

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs text-slate-400">留言总数</p><p className="mt-2 text-2xl font-semibold text-slate-700">{isLoading ? "…" : messages.length}</p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs text-slate-400">数据库</p><p className="mt-2 font-semibold text-slate-700">Supabase</p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs text-slate-400">管理权限</p><p className="mt-2 font-semibold text-slate-700">读取 / 删除</p></div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">Message moderation</p><h2 className="mt-2 text-2xl font-semibold text-slate-800">留言管理</h2></div><button type="button" onClick={() => void loadMessages()} disabled={isLoading || Boolean(deletingId)} className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? "加载中…" : "刷新列表"}</button></div>
              <p aria-live="polite" className="mt-4 min-h-6 text-sm text-rose-600">{errorMessage}</p>

              {isLoading ? (
                <div className="mt-4 space-y-3" aria-label="正在加载留言">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-50" />)}</div>
              ) : messages.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">暂时没有留言。</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {messages.map((message) => (
                    <article key={message.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-semibold text-indigo-700">{getAvatar(message.nickname)}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="text-sm font-semibold text-slate-700">{message.nickname}</h3><time dateTime={message.created_at} className="text-xs text-slate-400">{formatMessageDate(message.created_at)}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{message.content}</p></div></div>
                      <button type="button" onClick={() => void handleDelete(message)} disabled={Boolean(deletingId)} className="shrink-0 self-end rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-start">{deletingId === message.id ? "删除中…" : "删除"}</button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-7"><button type="button" onClick={handleSignOut} disabled={isSigningOut || Boolean(deletingId)} className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">{isSigningOut ? "退出中…" : "退出登录"}</button></div>
          </div>
        </div>
      </section>
    </main>
  );
}
