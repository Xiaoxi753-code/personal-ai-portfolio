"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Navbar from "@/components/Navbar";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProjectContent,
  updateProjectStatus,
  type ProjectRecord,
} from "@/services/projects";
import { getSupabaseBrowserClient } from "@/utils/supabase";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(value));
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pending, setPending] = useState<{ id: number; type: "toggle" | "delete" } | null>(null);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadProjects = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，请检查环境变量并重启开发服务器。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setListError("");
    try {
      setProjects(await listProjects(client));
    } catch (error) {
      console.error("Failed to load projects:", error);
      setListError("项目加载失败，请确认已建表并检查网络和登录状态。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setUrl("");
    setEditingId(null);
    setFormError("");
    setListError("");
    setFeedback("");
  }

  function startEditing(project: ProjectRecord) {
    if (isCreating || pending || editingId !== null) return;
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setUrl(project.url ?? "");
    setFormError("");
    setListError("");
    setFeedback(`正在编辑「${project.title}」。`);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating || pending) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanUrl = url.trim();
    if (!cleanTitle || !cleanDescription) {
      setFormError("请填写项目名称和描述。");
      return;
    }

    if (cleanUrl) {
      try {
        const parsed = new URL(cleanUrl);
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error("INVALID_PROTOCOL");
      } catch {
        setFormError("项目链接必须是完整的 http:// 或 https:// 地址。");
        return;
      }
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError(`数据库服务尚未配置，暂时无法${editingId === null ? "新增" : "修改"}项目。`);
      return;
    }

    setIsCreating(true);
    setFormError("");
    setFeedback("");
    try {
      if (editingId !== null) {
        const updated = await updateProjectContent(client, editingId, {
          title: cleanTitle,
          description: cleanDescription,
          url: cleanUrl || null,
        });
        setProjects((current) =>
          current.map((item) => item.id === editingId ? updated : item),
        );
        resetForm();
        setFeedback(`「${updated.title}」已保存修改。`);
        return;
      }

      const created = await createProject(client, {
        title: cleanTitle,
        description: cleanDescription,
        url: cleanUrl || null,
      });
      setProjects((current) => [created, ...current]);
      resetForm();
      setFeedback(`「${created.title}」已新增。`);
    } catch (error) {
      console.error("Failed to save project:", error);
      setFormError(`${editingId === null ? "新增" : "修改"}失败，请检查管理员登录状态或网络后重试。`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggle(project: ProjectRecord) {
    if (pending || isCreating || isLoading || editingId !== null) return;
    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，暂时无法修改状态。");
      return;
    }

    setPending({ id: project.id, type: "toggle" });
    setListError("");
    setFeedback("");
    try {
      const updated = await updateProjectStatus(client, project.id, !project.is_active);
      setProjects((current) => current.map((item) => item.id === project.id ? updated : item));
      setFeedback(`「${project.title}」已${updated.is_active ? "启用" : "停用"}。`);
    } catch (error) {
      console.error("Failed to update project:", error);
      setListError("状态更新失败，请检查登录状态或网络后重试。");
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(project: ProjectRecord) {
    if (pending || isCreating || isLoading || editingId !== null) return;
    if (!window.confirm(`确定要永久删除「${project.title}」吗？删除后无法恢复。`)) return;

    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，暂时无法删除项目。");
      return;
    }

    setPending({ id: project.id, type: "delete" });
    setListError("");
    setFeedback("");
    try {
      const deletedId = await deleteProject(client, project.id);
      setProjects((current) => current.filter((item) => item.id !== deletedId));
      setFeedback(`「${project.title}」已删除。`);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setListError("删除失败，请检查登录状态或网络后重试。");
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef8ff] via-[#f8f5ff] to-[#fff7f3] text-slate-700 selection:bg-violet-200 selection:text-violet-950">
      <Navbar />
      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pt-48">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(76,90,130,0.14)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-indigo-500 uppercase">Content manager</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-800 sm:text-5xl">项目管理</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">在这里录入真实项目；停用后项目不再显示在首页，删除后无法恢复。</p>
          <AdminNav />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form onSubmit={handleCreate} className="h-fit rounded-3xl border border-indigo-100 bg-indigo-50/45 p-5 sm:p-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">{editingId === null ? "Create" : "Edit"}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">{editingId === null ? "新增项目" : "编辑项目"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{editingId === null ? "录入准备在首页公开展示的真实项目。" : "修改完成后保存；取消编辑会清空表单并返回新增模式。"}</p>
              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="project-title" className="text-sm font-semibold text-slate-700">项目名称</label>
                  <input id="project-title" value={title} onChange={(event) => { setTitle(event.target.value); setFormError(""); }} maxLength={100} disabled={isCreating || pending !== null} placeholder="例如：我的第一个真实项目" className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60" />
                </div>
                <div>
                  <label htmlFor="project-description" className="text-sm font-semibold text-slate-700">项目描述</label>
                  <textarea id="project-description" value={description} onChange={(event) => { setDescription(event.target.value); setFormError(""); }} maxLength={2000} rows={6} disabled={isCreating || pending !== null} placeholder="这个项目解决什么问题？现在进展如何？" className="mt-2.5 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60" />
                  <p className="mt-1.5 text-right text-xs text-slate-400">{description.length}/2000</p>
                </div>
                <div>
                  <label htmlFor="project-url" className="text-sm font-semibold text-slate-700">项目链接（选填）</label>
                  <input id="project-url" type="url" value={url} onChange={(event) => { setUrl(event.target.value); setFormError(""); }} maxLength={2048} disabled={isCreating || pending !== null} placeholder="https://example.com" className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60" />
                </div>
              </div>
              <p aria-live="polite" className="mt-5 min-h-6 text-sm text-rose-600">{formError}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={isCreating || pending !== null} className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.2)] transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60">{isCreating ? "保存中…" : editingId === null ? "新增项目" : "保存修改"}</button>
                {editingId !== null ? <button type="button" onClick={resetForm} disabled={isCreating || pending !== null} className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">取消编辑</button> : null}
              </div>
            </form>

            <section aria-labelledby="project-list-title">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">Read / Update / Delete</p>
                  <h2 id="project-list-title" className="mt-2 text-2xl font-semibold text-slate-800">已有项目</h2>
                  <p className="mt-2 text-sm text-slate-500">共 {isLoading ? "…" : projects.length} 项，按创建时间倒序排列。</p>
                </div>
                <button type="button" onClick={() => void loadProjects()} disabled={isLoading || isCreating || pending !== null || editingId !== null} className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? "加载中…" : "刷新列表"}</button>
              </div>
              <div aria-live="polite" className="mt-4 min-h-6 text-sm">
                {listError ? <p className="text-rose-600">{listError}</p> : null}
                {feedback ? <p className="text-emerald-600">{feedback}</p> : null}
              </div>
              {isLoading ? (
                <div aria-label="正在加载项目" className="mt-5 space-y-4">{[0, 1].map((item) => <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100" />)}</div>
              ) : listError && projects.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">项目暂时无法加载，请检查上方提示并重试。</div>
              ) : projects.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">还没有项目，请先在左侧录入第一条真实项目。</div>
              ) : (
                <div className="mt-5 space-y-4">
                  {projects.map((project) => (
                    <article key={project.id} className="rounded-3xl border border-slate-100 bg-slate-50/75 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${project.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{project.is_active ? "已展示" : "已停用"}</span>
                        <time dateTime={project.created_at} className="ml-auto text-xs text-slate-400">{formatDate(project.created_at)}</time>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-800">{project.title}</h3>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{project.description}</p>
                      {project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-3 block w-fit break-all text-sm text-indigo-600 no-underline hover:text-violet-600">{project.url} ↗</a> : null}
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-4">
                        <button type="button" onClick={() => startEditing(project)} disabled={pending !== null || isCreating || isLoading || editingId !== null} className="rounded-full border border-sky-200 px-4 py-2 text-xs font-medium text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50">{editingId === project.id ? "编辑中" : "编辑"}</button>
                        <button type="button" onClick={() => void handleToggle(project)} disabled={pending !== null || isCreating || isLoading || editingId !== null} className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">{pending?.id === project.id && pending.type === "toggle" ? "更新中…" : project.is_active ? "停用" : "启用"}</button>
                        <button type="button" onClick={() => void handleDelete(project)} disabled={pending !== null || isCreating || isLoading || editingId !== null} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">{pending?.id === project.id && pending.type === "delete" ? "删除中…" : "删除"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
