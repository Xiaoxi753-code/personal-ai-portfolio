"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Navbar from "@/components/Navbar";
import {
  createLoveMoment,
  deleteLoveMoment,
  listLoveMoments,
  updateLoveMoment,
  updateLoveMomentStatus,
  type LoveMomentRecord,
} from "@/services/loveMoments";
import {
  MAX_LOVE_IMAGE_BYTES,
  MAX_LOVE_IMAGES,
  removeLoveImagesByPaths,
  removeLoveImagesByUrls,
  uploadLoveImages,
} from "@/services/loveImages";
import { getSupabaseBrowserClient } from "@/utils/supabase";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function createDefaultDate() {
  return toLocalDateTime(new Date().toISOString());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminLovePage() {
  const [moments, setMoments] = useState<LoveMomentRecord[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  const [momentDate, setMomentDate] = useState(createDefaultDate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    type: "toggle" | "delete";
  } | null>(null);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const loadMoments = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，请检查环境变量并重启开发服务器。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setListError("");
    try {
      setMoments(await listLoveMoments(client));
    } catch (error) {
      console.error("Failed to load love moments:", error);
      setListError("恋爱动态加载失败，请确认已执行建表 SQL 并检查登录状态。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMoments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMoments]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setExistingImageUrls([]);
    setOriginalImageUrls([]);
    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setSelectedImages([]);
    setMomentDate(createDefaultDate());
    setEditingId(null);
    setFormError("");
    setListError("");
    setFeedback("");
    setUploadProgress("");
  }

  function startEditing(moment: LoveMomentRecord) {
    if (isSaving || pendingAction || editingId !== null) return;
    setEditingId(moment.id);
    setTitle(moment.title);
    setContent(moment.content);
    setExistingImageUrls(moment.image_urls);
    setOriginalImageUrls(moment.image_urls);
    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setSelectedImages([]);
    setMomentDate(toLocalDateTime(moment.date));
    setFormError("");
    setListError("");
    setFeedback(`正在编辑「${moment.title}」。`);
  }

  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    const selectedFiles = Array.from(files);
    const totalCount = existingImageUrls.length + selectedFiles.length;

    if (totalCount > MAX_LOVE_IMAGES) {
      setFormError(`每条动态最多上传 ${MAX_LOVE_IMAGES} 张图片。`);
      return;
    }

    const invalidType = selectedFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidType) {
      setFormError(`「${invalidType.name}」不是可识别的图片文件。`);
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_LOVE_IMAGE_BYTES);
    if (oversized) {
      setFormError(`「${oversized.name}」超过 5 MB，请压缩后重试。`);
      return;
    }

    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setSelectedImages(
      selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    );
    setFormError("");
    setFeedback("");
  }

  function removeSelectedImage(index: number) {
    setSelectedImages((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || pendingAction) return;

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent || !momentDate) {
      setFormError("请填写标题、浪漫文案和发生时间。");
      return;
    }

    const parsedDate = new Date(momentDate);
    if (Number.isNaN(parsedDate.getTime())) {
      setFormError("发生时间格式不正确，请重新选择。");
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError("数据库服务尚未配置，暂时无法保存动态。");
      return;
    }

    setIsSaving(true);
    setFormError("");
    setFeedback("");
    setUploadProgress(
      selectedImages.length > 0
        ? `准备上传 ${selectedImages.length} 张图片…`
        : "正在保存动态…",
    );
    let uploadedImages: Array<{ path: string; url: string }> = [];

    try {
      uploadedImages = await uploadLoveImages(
        client,
        selectedImages.map((image) => image.file),
        (completed, total) => {
          setUploadProgress(`正在上传图片 ${completed}/${total}…`);
        },
      );
      const finalImageUrls = [
        ...existingImageUrls,
        ...uploadedImages.map((image) => image.url),
      ];
      const input = {
        title: cleanTitle,
        content: cleanContent,
        image_urls: finalImageUrls,
        date: parsedDate.toISOString(),
      };

      setUploadProgress("图片上传完成，正在保存动态…");
      if (editingId !== null) {
        const updated = await updateLoveMoment(client, editingId, input);
        setMoments((current) =>
          current
            .map((item) => item.id === editingId ? updated : item)
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
        );
        const removedImageUrls = originalImageUrls.filter(
          (url) => !finalImageUrls.includes(url),
        );
        let cleanupFailed = false;
        try {
          await removeLoveImagesByUrls(client, removedImageUrls);
        } catch (cleanupError) {
          cleanupFailed = true;
          console.error("Removed love image cleanup failed:", cleanupError);
        }
        resetForm();
        setFeedback(
          `「${updated.title}」已保存修改。${cleanupFailed ? "旧图片清理失败，请稍后检查 Storage。" : ""}`,
        );
        return;
      }

      const created = await createLoveMoment(client, input);
      setMoments((current) =>
        [created, ...current].sort(
          (a, b) => Date.parse(b.date) - Date.parse(a.date),
        ),
      );
      resetForm();
      setFeedback(`「${created.title}」已新增。`);
    } catch (error) {
      console.error("Failed to save love moment:", error);
      try {
        await removeLoveImagesByPaths(
          client,
          uploadedImages.map((image) => image.path),
        );
      } catch (cleanupError) {
        console.error("New love image rollback failed:", cleanupError);
      }
      setFormError(`${editingId === null ? "新增" : "修改"}失败，请检查登录状态或网络后重试。`);
    } finally {
      setUploadProgress("");
      setIsSaving(false);
    }
  }

  async function handleToggle(moment: LoveMomentRecord) {
    if (pendingAction || isSaving || isLoading || editingId !== null) return;
    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，暂时无法修改状态。");
      return;
    }

    setPendingAction({ id: moment.id, type: "toggle" });
    setListError("");
    setFeedback("");
    try {
      const updated = await updateLoveMomentStatus(
        client,
        moment.id,
        !moment.is_active,
      );
      setMoments((current) =>
        current.map((item) => item.id === moment.id ? updated : item),
      );
      setFeedback(`「${moment.title}」已${updated.is_active ? "启用" : "停用"}。`);
    } catch (error) {
      console.error("Failed to update love moment status:", error);
      setListError("状态更新失败，请检查登录状态或网络后重试。");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(moment: LoveMomentRecord) {
    if (pendingAction || isSaving || isLoading || editingId !== null) return;
    if (!window.confirm(`确定要永久删除「${moment.title}」吗？删除后无法恢复。`)) {
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setListError("数据库服务尚未配置，暂时无法删除动态。");
      return;
    }

    setPendingAction({ id: moment.id, type: "delete" });
    setListError("");
    setFeedback("");
    try {
      const deletedId = await deleteLoveMoment(client, moment.id);
      setMoments((current) => current.filter((item) => item.id !== deletedId));
      let cleanupFailed = false;
      try {
        await removeLoveImagesByUrls(client, moment.image_urls);
      } catch (cleanupError) {
        cleanupFailed = true;
        console.error("Deleted love image cleanup failed:", cleanupError);
      }
      setFeedback(
        `「${moment.title}」已删除。${cleanupFailed ? "关联图片清理失败，请稍后检查 Storage。" : ""}`,
      );
    } catch (error) {
      console.error("Failed to delete love moment:", error);
      setListError("删除失败，请检查登录状态或网络后重试。");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fff1f5] via-[#faf5ff] to-[#fff7ed] text-slate-700 selection:bg-rose-200 selection:text-rose-950">
      <Navbar />
      <section className="px-5 pb-20 pt-40 sm:px-8 sm:pt-48">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(126,83,112,0.13)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-rose-500 uppercase">Love content manager</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-800 sm:text-5xl">恋爱空间</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">维护愿意公开的温柔时刻。支持一次上传多张本地图片；停用后前台不再展示。</p>
          <AdminNav />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form onSubmit={handleSubmit} className="h-fit rounded-3xl border border-rose-100 bg-rose-50/45 p-5 sm:p-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-rose-500 uppercase">{editingId === null ? "Create" : "Edit"}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">{editingId === null ? "新增恋爱动态" : "编辑恋爱动态"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{editingId === null ? "只录入双方都同意公开的内容。" : "修改后保存，或取消编辑返回新增模式。"}</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="love-title" className="text-sm font-semibold text-slate-700">动态标题</label>
                  <input id="love-title" value={title} onChange={(event) => { setTitle(event.target.value); setFormError(""); }} maxLength={100} disabled={isSaving || pendingAction !== null} placeholder="例如：一起看过的第一场日落" className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:opacity-60" />
                </div>
                <div>
                  <label htmlFor="love-content" className="text-sm font-semibold text-slate-700">浪漫文案</label>
                  <textarea id="love-content" value={content} onChange={(event) => { setContent(event.target.value); setFormError(""); }} maxLength={3000} rows={7} disabled={isSaving || pendingAction !== null} placeholder="记录这个时刻，以及愿意公开的故事……" className="mt-2.5 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:opacity-60" />
                  <p className="mt-1.5 text-right text-xs text-slate-400">{content.length}/3000</p>
                </div>
                <div>
                  <label htmlFor="love-date" className="text-sm font-semibold text-slate-700">发生时间</label>
                  <input id="love-date" type="datetime-local" value={momentDate} onChange={(event) => { setMomentDate(event.target.value); setFormError(""); }} disabled={isSaving || pendingAction !== null} className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:opacity-60" />
                </div>
                <div>
                  <label htmlFor="love-images" className="text-sm font-semibold text-slate-700">照片（选填，最多 {MAX_LOVE_IMAGES} 张）</label>
                  <input
                    id="love-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      handleFileSelection(event.target.files);
                      event.target.value = "";
                    }}
                    disabled={isSaving || pendingAction !== null}
                    className="mt-2.5 block w-full rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-4 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-rose-600 hover:border-rose-300 disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-400">支持多选；每张不超过 5 MB。重新选择会替换尚未上传的新图片，不影响编辑时保留的旧图片。</p>

                  {existingImageUrls.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500">已保存图片</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {existingImageUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }}>
                            <button type="button" onClick={() => setExistingImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={isSaving} aria-label={`移除第 ${index + 1} 张已保存图片`} className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/70 px-2 py-1 text-xs text-white opacity-90 transition hover:bg-rose-600 disabled:opacity-50">移除</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedImages.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500">待上传图片</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {selectedImages.map((image, index) => (
                          <div key={image.previewUrl} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url(${image.previewUrl})` }}>
                            <button type="button" onClick={() => removeSelectedImage(index)} disabled={isSaving} aria-label={`移除第 ${index + 1} 张待上传图片`} className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/70 px-2 py-1 text-xs text-white transition hover:bg-rose-600 disabled:opacity-50">移除</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div aria-live="polite" className="mt-5 min-h-6 text-sm">
                {formError ? <p className="text-rose-600">{formError}</p> : null}
                {uploadProgress ? <p className="text-violet-600">{uploadProgress}</p> : null}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={isSaving || pendingAction !== null} className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(244,63,94,0.18)] transition hover:-translate-y-0.5 hover:from-rose-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? uploadProgress || "保存中…" : editingId === null ? "新增动态" : "保存修改"}</button>
                {editingId !== null ? <button type="button" onClick={resetForm} disabled={isSaving || pendingAction !== null} className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60">取消编辑</button> : null}
              </div>
            </form>

            <section aria-labelledby="love-list-title">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-rose-500 uppercase">Timeline CMS</p>
                  <h2 id="love-list-title" className="mt-2 text-2xl font-semibold text-slate-800">已有动态</h2>
                  <p className="mt-2 text-sm text-slate-500">共 {isLoading ? "…" : moments.length} 条，按发生时间倒序排列。</p>
                </div>
                <button type="button" onClick={() => void loadMoments()} disabled={isLoading || isSaving || pendingAction !== null || editingId !== null} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? "加载中…" : "刷新列表"}</button>
              </div>
              <div aria-live="polite" className="mt-4 min-h-6 text-sm">
                {listError ? <p className="text-rose-600">{listError}</p> : null}
                {feedback ? <p className="text-emerald-600">{feedback}</p> : null}
              </div>

              {isLoading ? (
                <div aria-label="正在加载恋爱动态" className="mt-5 space-y-4">{[0, 1].map((item) => <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-100" />)}</div>
              ) : listError && moments.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">动态暂时无法加载，请检查上方提示并重试。</div>
              ) : moments.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">故事还没有开始记录，先在左侧写下第一条吧。</div>
              ) : (
                <div className="mt-5 space-y-4">
                  {moments.map((moment) => (
                    <article key={moment.id} className="rounded-3xl border border-slate-100 bg-slate-50/75 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${moment.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{moment.is_active ? "已展示" : "已停用"}</span>
                        <time dateTime={moment.date} className="ml-auto text-xs text-slate-400">{formatDate(moment.date)}</time>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-800">{moment.title}</h3>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{moment.content}</p>
                      {moment.image_urls.length > 0 ? (
                        <div className="mt-4">
                          <p className="text-xs text-slate-400">共 {moment.image_urls.length} 张图片</p>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {moment.image_urls.map((url, index) => (
                              <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer" aria-label={`查看「${moment.title}」第 ${index + 1} 张图片`} className="aspect-square rounded-xl bg-slate-100 bg-cover bg-center no-underline transition hover:opacity-80" style={{ backgroundImage: `url(${url})` }} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-4">
                        <button type="button" onClick={() => startEditing(moment)} disabled={pendingAction !== null || isSaving || isLoading || editingId !== null} className="rounded-full border border-sky-200 px-4 py-2 text-xs font-medium text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50">{editingId === moment.id ? "编辑中" : "编辑"}</button>
                        <button type="button" onClick={() => void handleToggle(moment)} disabled={pendingAction !== null || isSaving || isLoading || editingId !== null} className="rounded-full border border-violet-200 px-4 py-2 text-xs font-medium text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50">{pendingAction?.id === moment.id && pendingAction.type === "toggle" ? "更新中…" : moment.is_active ? "停用" : "启用"}</button>
                        <button type="button" onClick={() => void handleDelete(moment)} disabled={pendingAction !== null || isSaving || isLoading || editingId !== null} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">{pendingAction?.id === moment.id && pendingAction.type === "delete" ? "删除中…" : "删除"}</button>
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
