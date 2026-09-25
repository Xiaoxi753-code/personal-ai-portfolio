"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Navbar from "@/components/Navbar";
import {
  createKnowledgeRecord,
  deleteKnowledgeRecord,
  listKnowledgeRecords,
  type KnowledgeRecord,
  updateKnowledgeContent,
  updateKnowledgeStatus,
} from "@/services/knowledge";
import { getSupabaseBrowserClient } from "@/utils/supabase";

const TITLE_MAX_LENGTH = 100;
const CATEGORY_MAX_LENGTH = 50;
const CONTENT_MAX_LENGTH = 5000;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminKnowledgePage() {
  const [records, setRecords] = useState<KnowledgeRecord[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    type: "toggle" | "delete";
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadKnowledge = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("数据库服务尚未配置，请检查环境变量后重启开发服务器。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listKnowledgeRecords(supabase);
      setRecords(data);
    } catch (error) {
      console.error("Failed to load knowledge records:", error);
      setErrorMessage("知识资料加载失败，请确认 knowledge 表和 RLS 策略已创建。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadKnowledge();
    }, 0);

    return () => window.clearTimeout(initialLoadTimer);
  }, [loadKnowledge]);

  function resetForm() {
    setTitle("");
    setCategory("");
    setContent("");
    setEditingId(null);
    setErrorMessage("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");
  }

  function startEditing(record: KnowledgeRecord) {
    if (isSubmitting || pendingAction || editingId !== null) return;
    setEditingId(record.id);
    setTitle(record.title);
    setCategory(record.category);
    setContent(record.content);
    setErrorMessage("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess(`正在编辑「${record.title}」。`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || pendingAction) return;

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanCategory || !cleanContent) {
      setErrorMessage("请完整填写标题、分类和详细内容。");
      setSuccessMessage("");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage(`数据库服务尚未配置，暂时无法${editingId === null ? "新增" : "修改"}资料。`);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingId !== null) {
        const updatedRecord = await updateKnowledgeContent(supabase, editingId, {
          title: cleanTitle,
          category: cleanCategory,
          content: cleanContent,
        });
        setRecords((currentRecords) =>
          currentRecords.map((item) =>
            item.id === editingId ? updatedRecord : item,
          ),
        );
        resetForm();
        setSuccessMessage(`「${updatedRecord.title}」已保存修改。`);
        return;
      }

      const newRecord = await createKnowledgeRecord(supabase, {
        title: cleanTitle,
        category: cleanCategory,
        content: cleanContent,
      });

      setRecords((currentRecords) => [newRecord, ...currentRecords]);
      resetForm();
      setSuccessMessage("资料已成功加入 AI 知识库。");
    } catch (error) {
      console.error("Failed to save knowledge record:", error);
      setErrorMessage(`${editingId === null ? "新增" : "修改"}失败，请确认已登录并检查网络后重试。`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFeedback() {
    setErrorMessage("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");
  }

  async function handleToggle(record: KnowledgeRecord) {
    if (pendingAction || isLoading || isSubmitting || editingId !== null) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setActionError("数据库服务尚未配置，暂时无法修改状态。");
      return;
    }

    setPendingAction({ id: record.id, type: "toggle" });
    setActionError("");
    setActionSuccess("");

    try {
      const updatedRecord = await updateKnowledgeStatus(
        supabase,
        record.id,
        !record.is_active,
      );
      setRecords((currentRecords) =>
        currentRecords.map((item) =>
          item.id === record.id ? updatedRecord : item,
        ),
      );
      setActionSuccess(
        `「${record.title}」已${updatedRecord.is_active ? "启用" : "停用"}。`,
      );
    } catch (error) {
      console.error("Failed to update knowledge status:", error);
      setActionError("状态更新失败，请确认已登录并检查网络后重试。");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(record: KnowledgeRecord) {
    if (pendingAction || isLoading || isSubmitting || editingId !== null) return;

    if (!window.confirm(`确定要永久删除「${record.title}」吗？删除后无法恢复。`)) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setActionError("数据库服务尚未配置，暂时无法删除资料。");
      return;
    }

    setPendingAction({ id: record.id, type: "delete" });
    setActionError("");
    setActionSuccess("");

    try {
      const deletedId = await deleteKnowledgeRecord(supabase, record.id);
      setRecords((currentRecords) =>
        currentRecords.filter((item) => item.id !== deletedId),
      );
      setActionSuccess(`「${record.title}」已删除。`);
    } catch (error) {
      console.error("Failed to delete knowledge record:", error);
      setActionError("删除失败，请确认已登录并检查网络后重试。");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef8ff] via-[#f8f5ff] to-[#fff7f3] text-slate-700 selection:bg-violet-200 selection:text-violet-950">
      <Navbar />

      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pt-48">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(76,90,130,0.14)] backdrop-blur-xl sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-indigo-500 uppercase">
                  Knowledge center
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">
                  AI 知识库
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  在这里维护数字分身可以使用的公开资料。支持新增、查看、启用或停用，以及删除；停用后 AI 不会再引用该条资料。
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                仅管理员可访问
              </span>
            </div>

            <AdminNav />

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <form
                onSubmit={handleSubmit}
                className="h-fit rounded-3xl border border-indigo-100 bg-indigo-50/45 p-5 sm:p-7"
              >
                <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">
                  {editingId === null ? "Create" : "Edit"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                  {editingId === null ? "新增资料" : "编辑资料"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {editingId === null
                    ? "只填写愿意向访客公开，并允许数字分身引用的事实。"
                    : "修改完成后保存；取消编辑会清空表单并返回新增模式。"}
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="knowledge-title" className="text-sm font-semibold text-slate-700">
                      标题
                    </label>
                    <input
                      id="knowledge-title"
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        clearFeedback();
                      }}
                      maxLength={TITLE_MAX_LENGTH}
                      placeholder="例如：我的职业定位"
                      disabled={isSubmitting || pendingAction !== null}
                      className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <p className="mt-1.5 text-right text-xs text-slate-400">
                      {title.length}/{TITLE_MAX_LENGTH}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="knowledge-category" className="text-sm font-semibold text-slate-700">
                      分类
                    </label>
                    <input
                      id="knowledge-category"
                      value={category}
                      onChange={(event) => {
                        setCategory(event.target.value);
                        clearFeedback();
                      }}
                      maxLength={CATEGORY_MAX_LENGTH}
                      placeholder="例如：经历、技能、项目"
                      disabled={isSubmitting || pendingAction !== null}
                      className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label htmlFor="knowledge-content" className="text-sm font-semibold text-slate-700">
                      详细内容
                    </label>
                    <textarea
                      id="knowledge-content"
                      value={content}
                      onChange={(event) => {
                        setContent(event.target.value);
                        clearFeedback();
                      }}
                      maxLength={CONTENT_MAX_LENGTH}
                      rows={8}
                      placeholder="填写准确、可公开、可以被 AI 直接引用的资料……"
                      disabled={isSubmitting || pendingAction !== null}
                      className="mt-2.5 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <p className="mt-1.5 text-right text-xs text-slate-400">
                      {content.length}/{CONTENT_MAX_LENGTH}
                    </p>
                  </div>
                </div>

                <div aria-live="polite" className="mt-5 min-h-6 text-sm">
                  {errorMessage ? <p className="text-rose-600">{errorMessage}</p> : null}
                  {successMessage ? <p className="text-emerald-600">{successMessage}</p> : null}
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting || pendingAction !== null}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.2)] transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting
                      ? "保存中…"
                      : editingId === null ? "新增资料" : "保存修改"}
                  </button>
                  {editingId !== null ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting || pendingAction !== null}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      取消编辑
                    </button>
                  ) : null}
                </div>
              </form>

              <section aria-labelledby="knowledge-list-title">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">
                      Read
                    </p>
                    <h2 id="knowledge-list-title" className="mt-2 text-2xl font-semibold text-slate-800">
                      已有资料
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      共 {isLoading ? "…" : records.length} 条，按创建时间倒序排列。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadKnowledge()}
                    disabled={isLoading || isSubmitting || pendingAction !== null || editingId !== null}
                    className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "加载中…" : "刷新列表"}
                  </button>
                </div>

                <div aria-live="polite" className="mt-4 min-h-6 text-sm">
                  {actionError ? <p className="text-rose-600">{actionError}</p> : null}
                  {actionSuccess ? <p className="text-emerald-600">{actionSuccess}</p> : null}
                </div>

                {isLoading ? (
                  <div className="mt-6 space-y-4" aria-label="正在加载知识资料">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100" />
                    ))}
                  </div>
                ) : records.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                    <p className="text-sm font-medium text-slate-600">知识库还是空的</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">从左侧表单添加第一条准确、公开的个人资料吧。</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {records.map((record) => (
                      <article key={record.id} className="rounded-3xl border border-slate-100 bg-slate-50/75 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
                            {record.category}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${record.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                            {record.is_active ? "已启用" : "已停用"}
                          </span>
                          <time dateTime={record.created_at} className="ml-auto text-xs text-slate-400">
                            {formatDate(record.created_at)}
                          </time>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">{record.title}</h3>
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                          {record.content}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-4">
                          <button
                            type="button"
                            onClick={() => startEditing(record)}
                            disabled={pendingAction !== null || isLoading || isSubmitting || editingId !== null}
                            className="rounded-full border border-sky-200 px-4 py-2 text-xs font-medium text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {editingId === record.id ? "编辑中" : "编辑"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggle(record)}
                            disabled={pendingAction !== null || isLoading || isSubmitting || editingId !== null}
                            className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pendingAction?.id === record.id && pendingAction.type === "toggle"
                              ? "更新中…"
                              : record.is_active ? "停用" : "启用"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(record)}
                            disabled={pendingAction !== null || isLoading || isSubmitting || editingId !== null}
                            className="rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pendingAction?.id === record.id && pendingAction.type === "delete"
                              ? "删除中…" : "删除"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
