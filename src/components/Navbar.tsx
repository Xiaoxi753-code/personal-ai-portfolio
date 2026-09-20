import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed inset-x-3 top-3 z-40 mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_12px_35px_rgba(75,95,125,0.12)] backdrop-blur-xl sm:inset-x-6 sm:px-6 lg:top-5">
      <Link
        href="/"
        className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-sm font-bold tracking-[0.14em] text-transparent no-underline transition-opacity hover:opacity-70"
      >
        LY · Portfolio
      </Link>
      <div className="flex min-w-0 max-w-[78%] items-center gap-3 overflow-x-auto text-xs font-medium whitespace-nowrap text-slate-500 sm:max-w-none sm:gap-6 sm:text-sm">
        <Link
          href="/"
          className="relative shrink-0 py-2 no-underline transition-colors duration-200 hover:text-sky-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-sky-400 after:transition-transform hover:after:scale-x-100"
        >
          首页
        </Link>
        <Link
          href="/#projects"
          className="relative shrink-0 py-2 no-underline transition-colors duration-200 hover:text-sky-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-sky-400 after:transition-transform hover:after:scale-x-100"
        >
          项目
        </Link>
        <Link
          href="/love"
          className="relative shrink-0 py-2 no-underline transition-colors duration-200 hover:text-rose-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-rose-400 after:transition-transform hover:after:scale-x-100"
        >
          恋爱
        </Link>
        <Link
          href="/message"
          className="relative shrink-0 py-2 no-underline transition-colors duration-200 hover:text-emerald-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-emerald-400 after:transition-transform hover:after:scale-x-100"
        >
          留言板
        </Link>
      </div>
    </nav>
  );
}
