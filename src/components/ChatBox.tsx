"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { FormEvent, useMemo, useState } from "react";

type ChatBoxProps = {
  isOpen: boolean;
  onClose: () => void;
};

const suggestedQuestions = [
  "请简单介绍一下你自己",
  "你最有代表性的项目是什么？",
  "你目前正在学习哪些技术？",
];

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default function ChatBox({ isOpen, onClose }: ChatBoxProps) {
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
  });
  const isLoading = status === "submitted" || status === "streaming";

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = draft.trim();
    if (!question || isLoading) {
      return;
    }

    if ([...question].length > 100) {
      setValidationError("问题太长啦，请精简到 100 个字以内。");
      return;
    }

    clearError();
    setValidationError("");
    setDraft("");
    await sendMessage({ text: question });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        className="ml-auto flex h-full max-h-[46rem] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-900 shadow-[0_28px_100px_rgba(2,8,23,0.75)] sm:mt-auto sm:h-[min(42rem,calc(100vh-3rem))]"
      >
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-500 text-xl shadow-[0_8px_30px_rgba(34,211,238,0.25)]">
              🤖
            </div>
            <div className="min-w-0">
              <h2 id="chat-title" className="truncate font-semibold text-white">
                我的 AI 分身
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {isLoading ? "正在思考" : "在线"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭 AI 对话窗口"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-sm">
              🤖
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-200">
              <p>你好，我是 Liang Yuying 的 AI 数字分身。</p>
              <p className="mt-2 text-slate-400">
                我会基于经过本人确认的公开资料回答问题，但我不是本人，也可能犯错。
                遇到不确定或涉及隐私的信息时，我会如实说明并建议你联系本人确认。
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="mt-7">
              <p className="mb-3 text-xs font-medium tracking-[0.16em] text-slate-500 uppercase">
                你可以这样问
              </p>
              <div className="flex flex-col items-start gap-2.5">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      clearError();
                      setValidationError("");
                      setDraft(question);
                    }}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2.5 text-left text-sm text-cyan-100 transition-all hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {messages.map((message) => {
              const text = getMessageText(message);
              if (!text) return null;

              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "rounded-tr-sm bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950"
                        : "rounded-tl-sm border border-white/10 bg-white/[0.06] text-slate-200"
                    }`}
                  >
                    {text}
                  </p>
                </div>
              );
            })}
          </div>

          {isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-cyan-200">
              <span className="flex gap-1" aria-label="AI 正在生成回答">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
              </span>
              AI 正在组织回答…
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm leading-6 text-amber-100">
              <p>对话暂时无法完成：{error.message}</p>
              <p className="mt-1 text-amber-200/75">
                请确认本地 `.env.local` 已配置，或稍后重试。
              </p>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-slate-950/50 p-4 sm:p-5"
        >
          <label htmlFor="chat-message" className="sr-only">
            输入想问 AI 分身的问题
          </label>
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-950 p-2 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/10">
            <textarea
              id="chat-message"
              value={draft}
              onChange={(event) => {
                clearError();
                setValidationError("");
                setDraft(event.target.value);
              }}
              rows={1}
              maxLength={300}
              placeholder="输入你的问题……"
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isLoading}
              className="grid h-11 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:from-cyan-200 hover:to-violet-300 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isLoading ? "生成中" : "发送"}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] leading-5">
            <p
              role={validationError ? "alert" : undefined}
              className={validationError ? "text-amber-300" : "text-slate-600"}
            >
              {validationError || "单次问题最多 100 个字"}
            </p>
            <p
              className={
                [...draft].length > 100 ? "text-amber-300" : "text-slate-600"
              }
            >
              {[...draft].length}/100
            </p>
          </div>
          <div className="mt-2 space-y-0.5 text-center text-[11px] leading-5">
            <p className="text-slate-500 italic">
              AI 回答基于公开资料生成，可能存在误差。对话暂不长期保存。
            </p>
            <p className="text-slate-600">
              请不要输入密码、证件号或其他敏感信息
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
