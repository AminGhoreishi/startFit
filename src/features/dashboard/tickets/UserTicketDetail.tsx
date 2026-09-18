"use client";

import { useState, useEffect, useRef } from "react";
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
  MessageSquareOff,
  Lock,
} from "lucide-react";
import Image from "next/image";
import type { TicketMutateApiResponse } from "@/types/ticket";
import { showAlert } from "@/utils/alert";
import {
  getStatusBadge,
  getStatusLabel,
  getCategoryBadge,
  getCategoryLabel,
  formatDate,
  formatTime,
  isVideo,
  isValidObjectId,
} from "./ticketHelpers";

interface UserTicketDetailProps {
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

export default function UserTicketDetail({ ticketId }: UserTicketDetailProps) {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isValidId = isValidObjectId(ticketId);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TicketMutateApiResponse>(
      isValidId ? `/api/user/ticket/${ticketId}` : null,
      fetcher,
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 3000,
        refreshInterval: 8000,
      },
    );

  const ticket = data?.ticket;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  const isCoachMessage = ticket?.initiatedBy === "coach";
  const isClosed = ticket?.status === "closed";

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !ticket || isSending || isCoachMessage || isClosed) return;

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: "me",
      senderName: "شما",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const optimisticTicket = {
      ...ticket,
      messages: [...(ticket.messages || []), optimisticMessage],
    };

    setReplyText("");

    try {
      setIsSending(true);
      await mutate(
        async () => {
          const res = await fetch(`/api/user/ticket/${ticket._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messageText: trimmed }),
          });

          const resData = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(resData.message || "خطا در ارسال پیام");
          }
          return resData;
        },
        {
          optimisticData: { success: true, ticket: optimisticTicket },
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        },
      );
    } catch (err: any) {
      setReplyText(trimmed);
      showAlert("خطا", err.message || "ارسال پیام با مشکل مواجه شد.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  return (
    <div className="overflow-hidden font-danaMed" dir="rtl">
      <div className="container mx-auto pt-4 sm:pt-8 pb-16 px-3 sm:px-4 max-w-5xl">
        <div className="mb-6 space-y-2">
          <Link
            href="/dashboard/tickets"
            className="text-xs text-white/50 hover:text-amber-400 flex items-center gap-1.5 transition-colors inline-flex"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به لیست تیکت‌ها</span>
          </Link>

          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-morabbaReg">
              گفتگوی تیکت پشتیبانی
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => mutate()}
                disabled={isValidating || !isValidId}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="بروزرسانی تیکت"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {ticket && (
          <>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {isCoachMessage ? (
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                  ) : (
                    <User className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white font-morabbaReg">
                      {isCoachMessage
                        ? ticket.coachId?.fullName || "مربی استار فیت"
                        : "درخواست من"}
                    </h3>
                    {isCoachMessage && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        پیام ارسالی مربی
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium ${getCategoryBadge(
                        ticket.category,
                      )}`}
                    >
                      {getCategoryLabel(ticket.category)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${getStatusBadge(
                        ticket.status,
                      )}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-1 mt-1 font-semibold">
                    {ticket.subject}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs text-white/50 pb-2 border-b border-white/5">
                <span className="font-semibold text-amber-400">
                  {isCoachMessage
                    ? "پیام ارسال شده از مربی:"
                    : "موضوع و شرح درخواست شما:"}
                </span>
                <span className="ss02 text-[11px]">
                  {formatDate(ticket.createdAt)} {formatTime(ticket.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
                {ticket.description}
              </p>

              {ticket.videoUrl && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>فایل ویدیویی یا تصویر پیوست</span>
                  </div>
                  {isVideo(ticket.videoUrl) ? (
                    <video
                      src={ticket.videoUrl}
                      controls
                      className="w-full max-h-72 rounded-lg bg-black object-contain"
                    />
                  ) : (
                    <a
                      href={ticket.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block relative rounded-lg overflow-hidden group max-w-sm"
                    >
                      <Image
                        src={ticket.videoUrl}
                        alt="پیوست تیکت"
                        width={400}
                        height={260}
                        className="w-full h-auto max-h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">
                        مشاهده اندازه کامل
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {(error || !isValidId) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                {!isValidId
                  ? "شناسه تیکت نامعتبر است."
                  : error?.message || "خطا در دریافت اطلاعات تیکت از سرور"}
              </span>
            </div>
            {isValidId && (
              <button
                type="button"
                onClick={() => mutate()}
                className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-semibold cursor-pointer"
              >
                تلاش مجدد
              </button>
            )}
          </div>
        )}

        {isLoading && !ticket && isValidId ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
              <MessageSquare className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/50">
              در حال دریافت اطلاعات تیکت...
            </p>
          </div>
        ) : !ticket ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 min-h-[350px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1 font-morabbaReg">
                تیکت یافت نشد
              </h3>
              <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-4">
                تیکت مورد نظر پیدا نشد یا ممکن است به آن دسترسی نداشته باشید.
              </p>
              <Link
                href="/dashboard/tickets"
                className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به لیست تیکت‌ها</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl flex flex-col min-h-[420px] max-h-[calc(100dvh-10rem)] sm:max-h-[640px] overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar min-h-0">
              {ticket.messages && ticket.messages.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {ticket.messages.map((msg) => {
                    const sender = msg.senderId as { role?: string } | null;
                    const isSupport =
                      typeof msg.senderId === "object" && msg.senderId !== null
                        ? sender?.role === "admin" || sender?.role === "coach"
                        : msg.senderId !== "me";

                    return (
                      <div
                        key={msg._id}
                        className={`flex gap-3 max-w-[88%] sm:max-w-[75%] break-words ${
                          isSupport ? "mr-auto flex-row-reverse" : "ml-auto"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSupport
                              ? "bg-amber-400 text-neutral-950 shadow-md"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {isSupport ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 overflow-hidden ${
                            isSupport
                              ? "bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-transparent border border-amber-400/30 text-white rounded-tr-none"
                              : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] text-white/40 pb-1">
                            <span className="font-semibold text-white/70">
                              {isSupport
                                ? isCoachMessage
                                  ? "مربی استار فیت"
                                  : "پشتیبان استار فیت"
                                : "شما"}
                            </span>
                            <span className="ss02">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words [word-break:break-word]">
                            {msg.text}
                          </p>
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

            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/30">
              {isCoachMessage ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-amber-400 text-xs flex items-center justify-center gap-2">
                  <MessageSquareOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    این پیام از طرف مربی ارسال شده است و امکان ارسال پاسخ برای
                    آن وجود ندارد.
                  </span>
                </div>
              ) : isClosed ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center text-white/40 text-xs flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    این تیکت پشتیبانی بسته شده است. در صورت نیاز تیکت جدیدی
                    ایجاد کنید.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      setTimeout(() => {
                        textareaRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        });
                      }, 250);
                    }}
                    rows={3}
                    placeholder="پاسخ خود را بنویسید..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 resize-none transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isSending ? "در حال ارسال..." : "ارسال پاسخ"}
                      </span>
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
