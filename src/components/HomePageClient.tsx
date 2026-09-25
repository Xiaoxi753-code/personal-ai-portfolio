"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";
import Navbar from "@/components/Navbar";
import type { ProjectRecord } from "@/services/projects";

type ProjectCardProps = {
  index: string;
  project: Pick<ProjectRecord, "title" | "description" | "url">;
};

function ProjectCard({ index, project }: ProjectCardProps) {
  return (
    <article className="group rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_rgba(76,97,130,0.08)] transition duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-[0_24px_60px_rgba(56,142,220,0.16)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm font-semibold text-sky-500">{index}</span>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
          项目展示
        </span>
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-800">{project.title}</h3>
      <p className="mt-4 whitespace-pre-wrap break-words text-base leading-7 text-slate-500">{project.description}</p>
      {project.url ? (
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-sky-600 no-underline transition hover:bg-sky-100 hover:text-indigo-600">
          查看项目 ↗
        </a>
      ) : null}
    </article>
  );
}

export default function HomePageClient({ projects, projectsError }: { projects: ProjectRecord[]; projectsError: boolean }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#eaf7ff] via-[#f5f3ff] to-[#fff7f1]"
      >
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-96 w-96 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="absolute bottom-28 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-100/60 blur-3xl" />
      </div>
    <main className="relative z-10 min-h-screen text-slate-800 selection:bg-sky-200 selection:text-sky-950">
      <Navbar />

      <section id="home" className="relative flex min-h-[min(850px,100vh)] items-center px-5 pb-36 pt-36 sm:px-8 sm:pb-44 sm:pt-40 lg:px-10">
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm text-sky-600 shadow-sm backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.65)]" />正在构建我的数字世界</p>
            <h1 className="inline-block bg-gradient-to-r from-sky-600 via-indigo-500 to-violet-500 bg-clip-text pb-2 text-5xl leading-normal font-bold tracking-[-0.04em] text-transparent sm:text-7xl lg:text-8xl">Liang Yuying</h1>
            <p className="mt-7 max-w-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-2xl leading-tight font-semibold text-transparent sm:text-4xl sm:leading-tight">探索技术与创新的开发者</p>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">你好，我正在从零开始学习全栈开发，并把每一次探索沉淀成真实作品。这里将记录我的项目、成长与思考，也会逐步加入一个了解我的 AI 数字分身。</p>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={() => setIsChatOpen(true)} aria-haspopup="dialog" aria-expanded={isChatOpen} className="rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-4 text-base font-semibold text-white shadow-[0_16px_40px_rgba(99,102,241,0.25)] transition-all duration-300 hover:-translate-y-1 hover:from-sky-400 hover:via-indigo-400 hover:to-violet-400 hover:shadow-[0_22px_55px_rgba(99,102,241,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 active:translate-y-0">🤖 问问我的 AI 分身</button>
              <a href="#projects" className="rounded-2xl border border-slate-300 bg-white/55 px-6 py-4 text-center text-base font-medium text-slate-600 no-underline shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-white hover:text-sky-600">浏览我的项目 ↓</a>
            </div>
            <p className="mt-4 text-sm text-slate-400">AI 分身已上线，欢迎向它了解我的公开资料。</p>
          </div>
        </div>
      </section>

      <div className="relative z-20 mt-[-1px] bg-white">
        <svg aria-hidden="true" className="pointer-events-none absolute -top-28 left-0 h-28 w-full fill-white sm:-top-36 sm:h-36" viewBox="0 0 1440 180" preserveAspectRatio="none"><path d="M0,105 C190,165 310,35 520,92 C735,151 822,182 1050,104 C1210,48 1310,68 1440,22 L1440,180 L0,180 Z" /></svg>
      <section id="projects" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-2xl"><p className="font-mono text-sm tracking-[0.2em] text-sky-500 uppercase">Experience & Projects</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">经历与项目</h2><p className="mt-5 text-base leading-7 text-slate-500 sm:text-lg">这里展示我在学习和实践中持续更新的真实项目。</p></div>
          {projectsError ? (
            <p role="status" className="mt-12 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-8 text-slate-600">项目暂时无法加载，请稍后刷新再试。</p>
          ) : projects.length === 0 ? (
            <p role="status" className="mt-12 rounded-2xl border border-sky-100 bg-sky-50 px-6 py-8 text-slate-600">博主正在爆肝开发中，真实项目即将上线，敬请期待！</p>
          ) : (
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} index={String(index + 1).padStart(2, "0")} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer id="contact" className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-slate-100 px-5 py-16 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-10"><div><p className="text-sm font-medium text-sky-500">保持联系</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">一起创造点有意思的东西。</h2></div><div className="flex flex-wrap gap-3"><a href="https://github.com/Xiaoxi753-code" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm text-slate-600 no-underline transition-colors duration-200 hover:border-sky-300 hover:text-sky-600">GitHub ↗</a><a href="mailto:1028608593@qq.com" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm text-slate-600 no-underline transition-colors duration-200 hover:border-violet-300 hover:text-violet-600">Email ↗</a></div></div>
        <div className="bg-slate-50 px-5 py-6 text-center text-xs text-slate-400">© 2026 Liang Yuying · 正在持续建设中</div>
      </footer>
      </div>

      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </main>
    </>
  );
}
