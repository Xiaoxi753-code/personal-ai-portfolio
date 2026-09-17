"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";

type ProjectCardProps = {
  index: string;
  title: string;
  description: string;
  tags: string[];
};

function ProjectCard({ index, title, description, tags }: ProjectCardProps) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.07] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm text-cyan-300">{index}</span>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
          项目占位
        </span>
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
      <div className="mt-7 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 selection:bg-cyan-300 selection:text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[42rem] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_75%_20%,rgba(139,92,246,0.16),transparent_36%)]" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <a
          href="#home"
          className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-sm font-semibold tracking-[0.18em] text-transparent no-underline transition-opacity hover:opacity-75"
        >
          LY · Portfolio
        </a>
        <div className="flex items-center gap-5 text-sm text-slate-400 sm:gap-7">
          <a
            className="text-slate-400 no-underline transition-colors duration-200 hover:text-cyan-300"
            href="#projects"
          >
            项目
          </a>
          <a
            className="text-slate-400 no-underline transition-colors duration-200 hover:text-violet-300"
            href="#contact"
          >
            联系
          </a>
        </div>
      </nav>

      <section
        id="home"
        className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-6xl items-center px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="max-w-4xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
            正在构建我的数字世界
          </p>

          <h1 className="inline-block bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text pb-2 text-5xl leading-normal font-semibold tracking-[-0.04em] text-transparent sm:text-7xl lg:text-8xl">
            Liang Yuying
          </h1>
          <p className="mt-7 max-w-3xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-2xl leading-tight font-medium text-transparent sm:text-4xl sm:leading-tight">
            探索技术与创新的开发者
          </p>
          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            你好，我正在从零开始学习全栈开发，并把每一次探索沉淀成真实作品。
            这里将记录我的项目、成长与思考，也会逐步加入一个了解我的 AI 数字分身。
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isChatOpen}
              className="rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_16px_50px_rgba(34,211,238,0.25)] transition-all duration-300 hover:-translate-y-1 hover:from-cyan-200 hover:via-sky-300 hover:to-violet-300 hover:shadow-[0_22px_70px_rgba(56,189,248,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 active:translate-y-0"
            >
              🤖 问问我的 AI 分身
            </button>
            <a
              href="#projects"
              className="rounded-2xl border border-white/15 px-6 py-4 text-center text-base font-medium text-white no-underline transition-all duration-200 hover:border-cyan-300/40 hover:bg-white/[0.06] hover:text-cyan-200"
            >
              浏览我的项目 ↓
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            AI 分身正在装修中，按钮暂时只作为入口占位。
          </p>
        </div>
      </section>

      <section
        id="projects"
        className="relative z-10"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-2xl">
            <p className="font-mono text-sm tracking-[0.2em] text-cyan-300 uppercase">
              Experience & Projects
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              经历与项目
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
              这里将展示我在学习和实践中完成的代表作品。当前内容为结构占位，后续会替换成真实项目。
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <ProjectCard
              index="01"
              title="个人知识管理实验室"
              description="一个用于整理学习笔记、项目经验与灵感的数字空间，探索如何让知识真正可查找、可连接、可复用。"
              tags={["Next.js", "Knowledge", "Design"]}
            />
            <ProjectCard
              index="02"
              title="智能生活助手"
              description="一个围绕日常计划与信息整理展开的 AI 助手概念项目，尝试把复杂任务变成清晰、友好的交互体验。"
              tags={["AI", "Product", "Prototype"]}
            />
          </div>
        </div>
      </section>

      <footer id="contact" className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-10">
          <div>
            <p className="text-sm font-medium text-cyan-300">保持联系</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              一起创造点有意思的东西。
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 no-underline transition-colors duration-200 hover:border-cyan-300/40 hover:text-cyan-200"
            >
              GitHub ↗
            </a>
            <a
              href="mailto:hello@example.com"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 no-underline transition-colors duration-200 hover:border-violet-300/40 hover:text-violet-200"
            >
              Email ↗
            </a>
          </div>
        </div>
        <div className="px-5 py-6 text-center text-xs text-slate-600">
          © 2026 Liang Yuying · 正在持续建设中
        </div>
      </footer>

      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </main>
  );
}
