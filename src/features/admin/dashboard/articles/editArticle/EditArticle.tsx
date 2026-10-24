"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import {
  ArrowRight,
  Save,
  Eye,
  X,
  Image as ImageIcon,
  Loader2,
  Link2,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { showAlert } from "@/utils/alert";
import { useRouter } from "next/navigation";
import { validateArticleImage } from "@/utils/article";
import type {
  EditArticleFormInputs,
  EditArticleProps,
  ArticleAuthorInfo,
  ArticleSubmitStatus,
} from "@/types/blog";

const CKEditorWrapper = dynamic(
  () => import("../createArticle/CKEditorWrapper"),
  {
    ssr: false,
  },
);

const CATEGORIES = ["بدنسازی", "تغذیه", "کاهش وزن", "سلامت", "مکمل", "تکنیک"];

export default function EditArticle({ articleId }: EditArticleProps) {
  const router = useRouter();
  const id = articleId || "";
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [author, setAuthor] = useState<ArticleAuthorInfo | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditArticleFormInputs>({
    defaultValues: {
      title: "",
      slug: "",
      category: "بدنسازی",
      content: "",
      excerpt: "",
      status: "draft",
      publishDate: "",
      seoTitle: "",
      seoDescription: "",
    },
  });

  const watchedStatus = watch("status");
  const watchedExcerpt = watch("excerpt") || "";
  const watchedContent = watch("content") || "";
  const watchedSeoTitle = watch("seoTitle") || "";
  const watchedSeoDescription = watch("seoDescription") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        try {
          const profileRes = await fetch("/api/user/profile");
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              setAuthor(profileData.user);
            }
          }
        } catch (err) {
          console.error("Failed to load author profile:", err);
        }

        const res = await fetch(`/api/admin/blog?id=${id}`);
        if (!res.ok) {
          throw new Error("مقاله مورد نظر یافت نشد.");
        }
        const data = await res.json();
        if (data.blog) {
          const blog = data.blog;
          reset({
            title: blog.title || "",
            slug: blog.slug || "",
            category: blog.category || "بدنسازی",
            content: blog.content || "",
            excerpt: blog.excerpt || "",
            status: blog.status || "draft",
            publishDate: blog.publishDate
              ? new Date(blog.publishDate).toISOString().slice(0, 16)
              : "",
            seoTitle: blog.seoTitle || "",
            seoDescription: blog.seoDescription || "",
          });
          setTags(blog.tags || []);
          if (blog.image) {
            setFeaturedImage(blog.image);
          }
        } else {
          throw new Error("ساختار داده مقاله نامعتبر است.");
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "خطا در بارگذاری اطلاعات مقاله رخ داده است.";
        showAlert({
          title: "خطا",
          text: errorMsg,
          icon: "error",
          confirmButtonText: "بازگشت به لیست",
        }).then(() => {
          router.push("/admin/articles");
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id, reset, router]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateArticleImage(file)) {
        e.target.value = "";
        return;
      }
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeaturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (
    data: EditArticleFormInputs,
    submitStatus: ArticleSubmitStatus,
  ) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", data.title);
      if (data.slug) {
        formData.append("slug", data.slug);
      }
      formData.append("category", data.category);
      formData.append("content", data.content);
      formData.append("excerpt", data.excerpt || "");
      formData.append("status", submitStatus);
      if (data.publishDate) {
        formData.append("publishDate", data.publishDate);
      }
      formData.append("seoTitle", data.seoTitle || "");
      formData.append("seoDescription", data.seoDescription || "");
      formData.append("tags", JSON.stringify(tags));
      if (featuredImageFile) {
        formData.append("image", featuredImageFile);
      } else if (!featuredImage) {
        formData.append("image", "deleted");
      }

      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        body: formData,
      });

      const resData = await res.json();

      if (res.ok) {
        showAlert({
          title: "موفقیت‌آمیز",
          text: "مقاله با موفقیت ویرایش شد!",
          icon: "success",
        }).then(() => {
          router.push("/admin/articles");
          router.refresh();
        });
      } else {
        showAlert({
          title: "خطا",
          text: resData.message || "خطا در ویرایش مقاله رخ داده است.",
          icon: "error",
        });
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در ارتباط با سرور رخ داده است.",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white px-4"
        dir="rtl"
      >
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-white/60 text-xs sm:text-sm">در حال بارگذاری اطلاعات مقاله...</p>
      </div>
    );
  }

  const wordCount = watchedContent
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-5 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin/articles"
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl shrink-0"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                ویرایش مقاله
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                اطلاعات مقاله خود را ویرایش و بروزرسانی کنید
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              disabled={saving}
              className="flex-1 sm:flex-initial justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span>ذخیره پیش‌نویس</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "published"))}
              disabled={saving}
              className="flex-1 sm:flex-initial justify-center bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 sm:gap-2 hover:shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-neutral-950" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950" />
              )}
              <span>بروزرسانی و انتشار</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-white mb-2 sm:mb-3 font-semibold">
                  عنوان مقاله
                </label>
                <input
                  {...register("title", { required: "عنوان مقاله الزامی است" })}
                  placeholder="عنوان جذاب مقاله خود را وارد کنید..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-base sm:text-xl placeholder:text-white/40 focus:outline-none focus:border-amber-500/30 font-morabbaReg"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label className="text-xs sm:text-sm text-white/90 font-medium flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>پیوند یکتا (Slug انگلیسی)</span>
                  </label>
                  <span className="text-[11px] text-amber-400/80">
                    برای کوتاه و تمیز شدن لینک مقاله
                  </span>
                </div>
                <div className="relative flex items-center" dir="ltr">
                  <span className="absolute left-3 text-white/40 text-xs font-mono select-none">
                    /article/
                  </span>
                  <input
                    {...register("slug")}
                    placeholder="workout-split-guide"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-18 pr-3.5 py-2 sm:py-2.5 text-white text-xs sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 text-left font-mono"
                  />
                </div>
                <p className="text-white/40 text-[11px] mt-1.5 text-right" dir="rtl">
                  فقط از حروف انگلیسی، اعداد و خط تیره (-) استفاده کنید.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <label className="block text-xs sm:text-sm text-white mb-2 sm:mb-3 font-semibold">
                تصویر شاخص
              </label>
              {featuredImage ? (
                <div className="relative rounded-xl overflow-hidden aspect-video max-h-72 w-full bg-neutral-900">
                  <Image
                    src={featuredImage}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage("");
                      setFeaturedImageFile(null);
                    }}
                    className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-lg"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/20 rounded-xl p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/30 transition-colors text-center">
                  <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white/40 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-white/60 mb-1 sm:mb-2">
                    کلیک کنید یا تصویر را بکشید
                  </p>
                  <p className="text-[11px] sm:text-xs text-white/40">
                    JPG, PNG یا WEBP (حداکثر ۲MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <label className="block text-xs sm:text-sm text-white mb-2 sm:mb-3 font-semibold">
                خلاصه مقاله
              </label>
              <textarea
                {...register("excerpt")}
                placeholder="خلاصه‌ای کوتاه از محتوای مقاله..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-500/30 resize-none"
              />
              <div className="text-white/40 text-[11px] sm:text-xs mt-2 ss02">
                {watchedExcerpt.length} / ۲۵۰ کاراکتر
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden">
              <label className="block text-xs sm:text-sm text-white mb-2 sm:mb-3 font-semibold">
                محتوای مقاله
              </label>
              <div className="ckeditor-wrapper w-full overflow-x-auto min-w-0">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: "محتوای مقاله الزامی است" }}
                  render={({ field }) => (
                    <CKEditorWrapper
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              {errors.content && (
                <p className="text-red-400 text-xs sm:text-sm mt-2">
                  {errors.content.message}
                </p>
              )}
              <div className="text-white/40 text-[11px] sm:text-xs mt-2 ss02">
                {wordCount} کلمه
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-white text-base sm:text-lg mb-3 sm:mb-4 font-morabbaReg">
                تنظیمات سئو
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2 font-medium">
                    عنوان سئو
                  </label>
                  <input
                    {...register("seoTitle")}
                    placeholder="عنوان برای موتورهای جستجو..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-500/30"
                  />
                  <div className="text-white/40 text-[11px] sm:text-xs mt-1 ss02">
                    {watchedSeoTitle.length} / ۶۰ کاراکتر
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2 font-medium">
                    توضیحات سئو
                  </label>
                  <textarea
                    {...register("seoDescription")}
                    placeholder="توضیحات برای موتورهای جستجو..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-500/30 resize-none"
                  />
                  <div className="text-white/40 text-[11px] sm:text-xs mt-1 ss02">
                    {watchedSeoDescription.length} / ۱۶۰ کاراکتر
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-white text-base sm:text-lg mb-3 sm:mb-4 font-morabbaReg">
                تنظیمات انتشار
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2 font-medium">
                    وضعیت
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/30 appearance-none cursor-pointer"
                      >
                        <option value="draft" className="bg-neutral-900">
                          پیش‌نویس
                        </option>
                        <option value="published" className="bg-neutral-900">
                          منتشر شده
                        </option>
                        <option value="scheduled" className="bg-neutral-900">
                          زمان‌بندی شده
                        </option>
                      </select>
                    )}
                  />
                </div>

                {watchedStatus === "scheduled" && (
                  <div>
                    <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2 font-medium">
                      تاریخ انتشار
                    </label>
                    <input
                      {...register("publishDate")}
                      type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/30"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-white text-base sm:text-lg mb-3 sm:mb-4 font-morabbaReg">
                دسته‌بندی
              </h3>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/30 appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-white text-base sm:text-lg mb-3 sm:mb-4 font-morabbaReg">
                برچسب‌ها
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="برچسب جدید..."
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-500/30"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-bold hover:from-amber-400 hover:to-yellow-400 px-3.5 sm:px-4 py-2 rounded-xl transition-colors text-xs sm:text-sm shrink-0 cursor-pointer"
                >
                  افزودن
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-white/40 text-xs mt-1">برچسبی اضافه نشده است</p>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-white text-base sm:text-lg mb-3 sm:mb-4 font-morabbaReg">
                اطلاعات نویسنده
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold flex items-center justify-center text-lg sm:text-xl shrink-0">
                  {author
                    ? author.fullName
                      ? author.fullName.charAt(0)
                      : author.username?.charAt(0) || "U"
                    : "..."}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">
                    {author
                      ? author.fullName || author.username
                      : "در حال بارگذاری..."}
                  </div>
                  <div className="text-white/60 text-[11px] sm:text-xs truncate mt-0.5">
                    {author
                      ? author.role === "admin"
                        ? "مدیر سایت"
                        : author.role === "coach"
                          ? "مربی مجرب"
                          : "کاربر"
                      : "..."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, "draft"))}
                disabled={saving}
                className="flex-1 justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>ذخیره پیش‌نویس</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
                disabled={saving}
                className="flex-1 justify-center bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:shadow-lg transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                ) : (
                  <Eye className="w-4 h-4 text-neutral-950" />
                )}
                <span>بروزرسانی و انتشار</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
