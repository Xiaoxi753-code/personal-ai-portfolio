import Link from "next/link";
import Navbar from "@/components/Navbar";

const mockMessages = [
  { name: "小满", avatar: "🌿", date: "2026.09.18", text: "这个主页的颜色很舒服，期待看到更多项目更新！" },
  { name: "一颗橙子", avatar: "🍊", date: "2026.09.17", text: "AI 分身的边界提示很细心，祝你的全栈学习一路顺利。" },
  { name: "晚风来信", avatar: "🌙", date: "2026.09.16", text: "路过这里，留下一个小小的赞。愿每次尝试都有新的收获。" },
  { name: "云朵同学", avatar: "☁️", date: "2026.09.15", text: "期待以后能在留言板看到更多有趣的故事和灵感。" },
];

export default function MessagePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#effcf9] via-[#f8fbff] to-[#fff7fb] text-slate-700 selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />

      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pb-28 sm:pt-48">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-emerald-600 shadow-sm backdrop-blur-sm">
              MESSAGE WALL · 纯静态示例
            </span>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-800 sm:text-7xl">
              留下一句话，
              <span className="block bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 bg-clip-text pb-2 text-transparent">让这里有回声。</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              这是一个无需登录的留言板视觉原型。输入框和发布按钮目前仅用于展示界面，留言不会真的提交或保存。
            </p>
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(76,110,130,0.1)] backdrop-blur-xl sm:p-8">
            <label htmlFor="message-draft" className="text-sm font-semibold text-slate-700">写下你的想法</label>
            <textarea id="message-draft" rows={4} placeholder="例如：今天也要保持好奇心……" className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Mock UI · 发布功能尚未接入后端</p>
              <button type="button" title="静态占位按钮" className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-sky-400">发布留言</button>
            </div>
          </div>

          <section className="mt-16" aria-labelledby="wall-title">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold tracking-[0.2em] text-emerald-500 uppercase">Little notes</p><h2 id="wall-title" className="mt-3 text-3xl font-semibold text-slate-800">留言墙</h2></div>
              <span className="text-xs text-slate-400">4 条 Mock 留言</span>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {mockMessages.map((message) => (
                <article key={`${message.name}-${message.date}`} className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_12px_35px_rgba(76,110,130,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white">
                  <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 text-xl" aria-hidden="true">{message.avatar}</span><div><h3 className="text-sm font-semibold text-slate-700">{message.name}</h3><time className="text-xs text-slate-400">{message.date}</time></div></div>
                  <p className="mt-5 text-sm leading-7 text-slate-600">{message.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <footer className="border-t border-emerald-100 bg-white/60 px-5 py-10 text-center">
        <Link href="/" className="text-sm font-medium text-emerald-600 no-underline transition hover:text-sky-600">← 返回首页</Link>
      </footer>
    </main>
  );
}
