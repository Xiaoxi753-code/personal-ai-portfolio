import Link from "next/link";
import Navbar from "@/components/Navbar";
import { listPublicLoveMoments } from "@/services/publicLoveMoments";
import type { LoveMomentRecord } from "@/services/loveMoments";

export const dynamic = "force-dynamic";

const cardStyles = [
  { background: "from-rose-100 via-orange-50 to-amber-100", tilt: "-rotate-3", symbol: "✿" },
  { background: "from-sky-100 via-violet-50 to-pink-100", tilt: "rotate-2", symbol: "☼" },
  { background: "from-violet-100 via-rose-50 to-rose-100", tilt: "-rotate-2", symbol: "♡" },
];

function formatMomentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function LovePage() {
  let moments: LoveMomentRecord[] = [];
  let loadError = false;

  try {
    moments = await listPublicLoveMoments();
  } catch (error) {
    console.error("Public love moments load failed:", error);
    loadError = true;
  }

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
    <main className="relative z-10 min-h-screen text-slate-700 selection:bg-rose-200 selection:text-rose-900">
      <Navbar />

      <section className="relative z-10 px-5 pb-36 pt-40 sm:px-8 sm:pb-44 sm:pt-48">
        <div className="relative mx-auto max-w-6xl">
          <span className="inline-flex rounded-full border border-rose-200 bg-white/65 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-rose-500 shadow-sm backdrop-blur-sm">
            A LITTLE SPACE FOR LOVE · OUR REAL MOMENTS
          </span>
          <h1 className="mt-8 max-w-3xl text-5xl leading-tight font-semibold tracking-tight text-slate-800 sm:text-7xl">
            把喜欢的日子，
            <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text pb-2 text-transparent">
              慢慢写成诗。
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
            这里收藏我们愿意公开的温柔时刻。每一条故事都由后台认真记录，也可以随时停用或更新。
          </p>
          <a
            href="#timeline"
            className="mt-9 inline-flex rounded-full border border-rose-200 bg-white/80 px-6 py-3 text-sm font-medium text-rose-600 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-white"
          >
            看看故事 ↓
          </a>
        </div>
      </section>

      <div className="relative z-20 mt-[-1px] bg-[#fffafc]/95 backdrop-blur-[2px]">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-0 h-28 w-full fill-[#fffafc] sm:-top-36 sm:h-36"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path d="M0,105 C190,165 310,35 520,92 C735,151 822,182 1050,104 C1210,48 1310,68 1440,22 L1440,180 L0,180 Z" />
        </svg>
      <section id="timeline" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-rose-400 uppercase">Our little moments</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">时光慢递</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            沿着时间线，慢慢读完那些值得记住的日子。
          </p>
        </div>

        {loadError ? (
          <p role="status" className="mx-auto mt-14 max-w-3xl rounded-3xl border border-rose-100 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            时光信箱暂时没有连上，请稍后再回来看看。
          </p>
        ) : moments.length === 0 ? (
          <p role="status" className="mx-auto mt-14 max-w-3xl rounded-3xl border border-rose-100 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            我们正在认真收藏故事，下一段温柔时光很快就会写在这里。
          </p>
        ) : (
          <ol className="relative mx-auto mt-16 max-w-4xl space-y-12 before:absolute before:top-6 before:bottom-6 before:left-3.5 before:w-px before:bg-rose-200/80 sm:before:left-1/2 sm:before:-translate-x-1/2">
            {moments.map((moment, index) => {
              const cardStyle = cardStyles[index % cardStyles.length];
              return (
                <li key={moment.id} className="relative grid gap-6 pl-12 sm:grid-cols-2 sm:items-center sm:gap-12 sm:pl-0">
              <span aria-hidden="true" className="absolute top-8 left-2 z-10 h-3 w-3 rounded-full border-[3px] border-white bg-rose-400 shadow-[0_0_0_4px_rgba(251,207,232,0.65)] sm:left-1/2 sm:-translate-x-1/2" />
              <div className={index % 2 === 0 ? "sm:pr-7" : "sm:order-2 sm:pl-7"}>
                <div className={`mx-auto max-w-xs ${cardStyle.tilt} rounded-sm bg-white p-3 pb-5 shadow-[0_18px_45px_rgba(149,96,120,0.16)] transition-transform duration-300 hover:rotate-0`}>
                  {moment.image_urls.length > 0 ? (
                    <div className={`grid gap-2 ${moment.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {moment.image_urls.map((url, imageIndex) => (
                        <a
                          key={`${url}-${imageIndex}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`查看「${moment.title}」第 ${imageIndex + 1} 张照片`}
                          className={`${moment.image_urls.length === 1 ? "aspect-[4/3]" : "aspect-square"} rounded-sm bg-slate-100 bg-cover bg-center bg-no-repeat no-underline transition duration-300 hover:opacity-90`}
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${cardStyle.background}`}>
                      <span aria-hidden="true" className="font-serif text-8xl text-rose-400/60">{cardStyle.symbol}</span>
                    </div>
                  )}
                  <p className="mt-4 text-center font-serif text-sm italic text-slate-500">{formatMomentDate(moment.date)}</p>
                </div>
              </div>
              <div className={index % 2 === 0 ? "sm:pl-7" : "sm:order-1 sm:pr-7 sm:text-right"}>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-400">CHAPTER {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-800">{moment.title}</h3>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-500 sm:text-base">{moment.content}</p>
              </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <footer className="border-t border-rose-100 bg-[#fff8f8] px-5 py-12 text-center">
        <p className="text-sm text-slate-500">愿每一段被记录的日常，都值得温柔回望。</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-rose-500 no-underline transition hover:text-violet-500">
          ← 返回首页
        </Link>
      </footer>
      </div>
    </main>
    </>
  );
}
