"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getSupabaseBrowserClient } from "@/utils/supabase";

type Message = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

type Feedback = {
  type: "success" | "error";
  text: string;
} | null;

const MESSAGE_COOLDOWN_MS = 60_000;
const LAST_PUBLISHED_AT_KEY = "message-last-published-at";

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

export default function MessagePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const loadMessages = useCallback(async (showLoading = true) => {
    await Promise.resolve();

    if (showLoading) setIsLoading(true);
    setLoadError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoadError("留言服务尚未配置，请重启开发服务器后再试。");
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, nickname, content, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setMessages((data ?? []) as Message[]);
      return true;
    } catch (error) {
      console.error("Failed to load messages:", error);
      setLoadError("留言暂时加载失败，请检查网络后重试。");
      return false;
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

  useEffect(() => {
    function updateCooldown() {
      let storedValue: string | null = null;

      try {
        storedValue = window.localStorage.getItem(LAST_PUBLISHED_AT_KEY);
      } catch (error) {
        console.warn("Unable to read message cooldown:", error);
        setCooldownSeconds(0);
        return;
      }

      const lastPublishedAt = Number(storedValue);

      if (!storedValue || !Number.isFinite(lastPublishedAt)) {
        if (storedValue) {
          try {
            window.localStorage.removeItem(LAST_PUBLISHED_AT_KEY);
          } catch (error) {
            console.warn("Unable to clear invalid message cooldown:", error);
          }
        }
        setCooldownSeconds(0);
        return;
      }

      const secondsLeft = Math.max(
        0,
        Math.ceil(
          (lastPublishedAt + MESSAGE_COOLDOWN_MS - Date.now()) / 1_000,
        ),
      );

      setCooldownSeconds(secondsLeft);
      if (secondsLeft === 0) {
        try {
          window.localStorage.removeItem(LAST_PUBLISHED_AT_KEY);
        } catch (error) {
          console.warn("Unable to clear message cooldown:", error);
        }
      }
    }

    updateCooldown();
    const cooldownTimer = window.setInterval(updateCooldown, 1_000);

    return () => window.clearInterval(cooldownTimer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanNickname = nickname.trim();
    const cleanContent = content.trim();

    let lastPublishedAt = Number.NaN;
    try {
      lastPublishedAt = Number(
        window.localStorage.getItem(LAST_PUBLISHED_AT_KEY),
      );
    } catch (error) {
      console.warn("Unable to read message cooldown:", error);
    }
    const secondsLeft = Number.isFinite(lastPublishedAt)
      ? Math.max(
          0,
          Math.ceil(
            (lastPublishedAt + MESSAGE_COOLDOWN_MS - Date.now()) / 1_000,
          ),
        )
      : 0;

    if (secondsLeft > 0) {
      setCooldownSeconds(secondsLeft);
      setFeedback({
        type: "error",
        text: `发布太频繁啦，请等待 ${secondsLeft} 秒后再试。`,
      });
      return;
    }

    if (!cleanNickname || !cleanContent) {
      setFeedback({ type: "error", text: "请先填写昵称和留言内容。" });
      return;
    }

    if ([...cleanNickname].length > 30) {
      setFeedback({ type: "error", text: "昵称最多 30 个字。" });
      return;
    }

    if ([...cleanContent].length > 500) {
      setFeedback({ type: "error", text: "留言最多 500 个字。" });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFeedback({
        type: "error",
        text: "留言服务尚未配置，请重启开发服务器后再试。",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.from("messages").insert({
        nickname: cleanNickname,
        content: cleanContent,
      });

      if (error) throw error;

      const publishedAt = Date.now();
      try {
        window.localStorage.setItem(
          LAST_PUBLISHED_AT_KEY,
          String(publishedAt),
        );
      } catch (error) {
        console.warn("Unable to persist message cooldown:", error);
      }
      setCooldownSeconds(Math.ceil(MESSAGE_COOLDOWN_MS / 1_000));
      setNickname("");
      setContent("");
      setFeedback({ type: "success", text: "留言发布成功，谢谢你的分享！" });
      await loadMessages(false);
    } catch (error) {
      console.error("Failed to publish message:", error);
      setFeedback({
        type: "error",
        text: "留言发布失败，请检查网络或稍后重试。",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#effcf9] via-[#f8fbff] to-[#fff7fb] text-slate-700 selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />

      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pb-28 sm:pt-48">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-emerald-600 shadow-sm backdrop-blur-sm">
              MESSAGE WALL · 真实留言
            </span>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-800 sm:text-7xl">
              留下一句话，
              <span className="block bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 bg-clip-text pb-2 text-transparent">
                让这里有回声。
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              无需注册即可留言。请不要填写密码、联系方式或其他敏感信息；公开留言会展示在下方。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-12 rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(76,110,130,0.1)] backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-5">
              <div>
                <label htmlFor="message-nickname" className="text-sm font-semibold text-slate-700">
                  你的昵称
                </label>
                <input
                  id="message-nickname"
                  value={nickname}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setFeedback(null);
                  }}
                  maxLength={30}
                  disabled={isSubmitting}
                  placeholder="最多 30 个字"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="message-draft" className="text-sm font-semibold text-slate-700">
                    写下你的想法
                  </label>
                  <span className="text-xs text-slate-400">{[...content].length}/500</span>
                </div>
                <textarea
                  id="message-draft"
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setFeedback(null);
                  }}
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                  placeholder="例如：今天也要保持好奇心……"
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite" className="min-h-5 text-xs">
                {feedback ? (
                  <p className={feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}>
                    {feedback.text}
                  </p>
                ) : (
                  <p className="text-slate-400">昵称 1–30 字，留言 1–500 字</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || cooldownSeconds > 0}
                className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting
                  ? "发布中…"
                  : cooldownSeconds > 0
                    ? `请等待 ${cooldownSeconds} 秒`
                    : "发布留言"}
              </button>
            </div>
          </form>

          <section className="mt-16" aria-labelledby="wall-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-emerald-500 uppercase">
                  Little notes
                </p>
                <h2 id="wall-title" className="mt-3 text-3xl font-semibold text-slate-800">
                  留言墙
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {isLoading ? "加载中…" : `${messages.length} 条留言`}
              </span>
            </div>

            {isLoading ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2" aria-label="正在加载留言">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-36 animate-pulse rounded-3xl bg-white/70" />
                ))}
              </div>
            ) : loadError ? (
              <div className="mt-8 rounded-3xl border border-rose-100 bg-white/80 p-6 text-center shadow-sm">
                <p className="text-sm text-rose-600">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadMessages()}
                  className="mt-4 rounded-full border border-rose-200 px-5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  重新加载
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-emerald-200 bg-white/65 p-10 text-center">
                <p className="text-sm text-slate-500">还没有留言，欢迎留下第一句话。</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_12px_35px_rgba(76,110,130,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 text-base font-semibold text-emerald-700"
                        aria-hidden="true"
                      >
                        {getAvatar(message.nickname)}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">{message.nickname}</h3>
                        <time dateTime={message.created_at} className="text-xs text-slate-400">
                          {formatMessageDate(message.created_at)}
                        </time>
                      </div>
                    </div>
                    <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {message.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="border-t border-emerald-100 bg-white/60 px-5 py-10 text-center">
        <Link href="/" className="text-sm font-medium text-emerald-600 no-underline transition hover:text-sky-600">
          ← 返回首页
        </Link>
      </footer>
    </main>
  );
}
