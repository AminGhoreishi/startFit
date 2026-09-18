"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Video,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { TicketMutateApiResponse } from "@/types/ticket";
import { showAlert, showConfirm } from "@/utils/alert";
import TicketHeaderInfo from "./TicketHeaderInfo";
import TicketActionButtons from "./TicketActionButtons";
import { formatPersianDateTime, formatPersianTime } from "./ticketHelpers";

interface AdminTicketDetailProps {
  ticketId: string;
}

const fetcher = async (url: string): Promise<TicketMutateApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "خطا در دریافت اطلاعات تیکت");
  }
  return res.json();
};

export default function AdminTicketDetail({ ticketId }: AdminTicketDetailProps) {
  const router = useRouter();

  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TicketMutateApiResponse>(
      ticketId ? `/api/admin/ticket/${ticketId}` : null,
      fetcher,
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 3000,
        refreshInterval: 8000,
      }
    );

  const ticket = data?.ticket;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket || isSending || isActionLoading) return;

    try {
      setIsSending(true);
      const res = await fetch(`/api/admin/ticket/${ticket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageText: replyText.trim() }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "خطا در ارسال پیام");
      }

      setReplyText("");
      await mutate();
    } catch (err: any) {
      showAlert("خطا", err.message || "ارسال پیام با مشکل مواجه شد.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = useCallback(async () => {
    if (!ticket || isActionLoading) return;

    const confirmed = await showConfirm(
      "بستن تیکت",
      "آیا از بستن این تیکت اطمینان دارید؟",
      "بله، بسته شود"
    );
    if (!confirmed) return;

    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/admin/ticket/${ticket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "closed" }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "خطا در بستن تیکت");
      }

      await mutate();
      showAlert("موفقیت", "تیکت با موفقیت بسته شد.", "success");
    } catch (err: any) {
      showAlert("خطا", err.message || "عملیات با خطا مواجه شد.", "error");
    } finally {
      setIsActionLoading(false);
    }
  }, [ticket, isActionLoading, mutate]);

  const handleReopen = useCallback(async () => {
    if (!ticket || isActionLoading) return;

    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/admin/ticket/${ticket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "pending" }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "خطا در بازگشایی تیکت");
      }

      await mutate();
      showAlert("موفقیت", "تیکت مجدداً بازگشایی شد.", "success");
    } catch (err: any) {
      showAlert("خطا", err.message || "عملیات با خطا مواجه شد.", "error");
    } finally {
      setIsActionLoading(false);
    }
  }, [ticket, isActionLoading, mutate]);

  const handleDelete = useCallback(async () => {
    if (!ticket || isActionLoading) return;

    const confirmed = await showConfirm(
      "حذف تیکت",
      "آیا از حذف این تیکت اطمینان دارید؟ این عمل غیرقابل بازگشت است.",
      "بله، حذف شود",
      "warning",
      "#ef4444"
    );
    if (!confirmed) return;

    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/admin/ticket/${ticket._id}`, {
        method: "DELETE",
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "خطا در حذف تیکت");
      }

      await showAlert("موفقیت", "تیکت با موفقیت حذف شد.", "success");
      router.push("/admin/tickets");
    } catch (err: any) {
      showAlert("خطا", err.message || "حذف تیکت با خطا مواجه شد.", "error");
    } finally {
      setIsActionLoading(false);
    }
  }, [ticket, isActionLoading, router]);

  const isClosed = ticket?.status === "closed";

  return (
    <div className="overflow-hidden font-danaMed" dir="rtl">
      <div className="container mx-auto pt-8 pb-16 px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Link
              href="/admin/tickets"
              className="text-xs text-white/50 hover:text-amber-400 flex items-center gap-1.5 transition-colors mb-2 inline-flex"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به لیست تیکت‌ها</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-morabbaReg">
              گفتگوی تیکت پشتیبانی
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isValidating || isActionLoading}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="بروزرسانی تیکت"
            >
              <RefreshCw
                className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {ticket && (
          <>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TicketHeaderInfo ticket={ticket} />

              <TicketActionButtons
                isClosed={isClosed}
                isLoading={isActionLoading}
                onReopen={handleReopen}
                onClose={handleClose}
                onDelete={handleDelete}
              />
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs text-white/50 pb-2 border-b border-white/5">
                <span className="font-semibold text-amber-400">
                  موضوع و شرح درخواست:
                </span>
                <span className="ss02 text-[11px]">
                  {formatPersianDateTime(ticket.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
                {ticket.description}
              </p>

              {ticket.videoUrl && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>فایل ویدیویی ارسالی کاربر</span>
                  </div>
                  <a
                    href={ticket.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:underline"
                  >
                    مشاهده ویدیو
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error.message || "خطا در دریافت اطلاعات تیکت از سرور"}</span>
            </div>
            <button
              type="button"
              onClick={() => mutate()}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-semibold cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {isLoading && !ticket ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 min-h-[500px] flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
              <MessageSquare className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/50">در حال دریافت اطلاعات تیکت...</p>
          </div>
        ) : !ticket ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1 font-morabbaReg">
                تیکت یافت نشد
              </h3>
              <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-4">
                تیکت مورد نظر پیدا نشد یا ممکن است حذف شده باشد.
              </p>
              <Link
                href="/admin/tickets"
                className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به لیست تیکت‌ها</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl flex flex-col min-h-[480px] max-h-[75dvh] sm:max-h-[640px] overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar min-h-0">
              {ticket.messages && ticket.messages.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {ticket.messages.map((msg) => {
                    const isCoach =
                      typeof msg.senderId === "string"
                        ? msg.senderId.includes("coach") ||
                          msg.senderId.includes("admin")
                        : msg.senderId?.role === "admin" ||
                          msg.senderId?.role === "coach";

                    return (
                      <div
                        key={msg._id}
                        className={`flex gap-3 max-w-[85%] sm:max-w-[75%] break-words ${
                          isCoach ? "mr-auto flex-row-reverse" : "ml-auto"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isCoach
                              ? "bg-amber-400 text-neutral-950 shadow-md"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {isCoach ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 overflow-hidden ${
                            isCoach
                              ? "bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-transparent border border-amber-400/30 text-white rounded-tr-none"
                              : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] text-white/40 pb-1">
                            <span className="font-semibold text-white/70">
                              {msg.senderName}
                            </span>
                            <span className="ss02">
                              {formatPersianTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words [word-break:break-word]">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-white/40 flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="w-6 h-6 opacity-30 text-amber-400" />
                  <span>هنوز پاسخی در این گفتگو ثبت نشده است.</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/30">
              {isClosed ? (
                <div className="text-center py-3 text-xs text-white/40 bg-white/5 rounded-xl border border-white/10">
                  این تیکت بسته شده است. برای ارسال پیام، ابتدا آن را بازگشایی کنید.
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="پاسخ مربی / پشتیبان را بنویسید..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 resize-none transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending || isActionLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSending ? "در حال ارسال..." : "ارسال پاسخ"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
