"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import type { UserTicketsApiResponse } from "@/types/ticket";
import UserTicketSidebarList from "./UserTicketSidebarList";
import UserTicketForm from "./UserTicketForm";

const fetcher = async (url: string): Promise<UserTicketsApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "خطا در دریافت لیست تیکت‌ها"
    );
  }
  return res.json();
};

export default function UserTickets() {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "answered" | "closed"
  >("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PAGE_SIZE = 8;

  const statusParam =
    filterStatus !== "all" ? `&status=${filterStatus}` : "";
  const apiUrl = `/api/user/ticket?page=${currentPage}&limit=${PAGE_SIZE}${statusParam}`;

  const {
    data,
    error: swrError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<UserTicketsApiResponse>(apiUrl, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const handleFilterStatusChange = (
    status: "all" | "pending" | "answered" | "closed"
  ) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    mutate();
  };

  return (
    <div
      className="min-h-screen bg-neutral-950 p-4 md:p-8 font-danaMed text-white"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-morabbaReg">
              تیکت‌های پشتیبانی و مشاوره
            </h1>
            <p className="text-neutral-400 text-sm">
              سوالات بدنسازی، برنامه‌های ورزشی یا مشکلات فنی خود را با مربیان و
              کارشناسان در میان بگذارید.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isValidating}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="بروزرسانی تیکت‌ها"
            >
              <RefreshCw
                className={`w-5 h-5 ${isValidating ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r cursor-pointer from-amber-500 via-amber-400 to-yellow-500 hover:opacity-95 text-neutral-950 px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-md shrink-0"
            >
              {showCreateForm ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  بازگشت به گفتگوها
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  ثبت تیکت جدید
                </>
              )}
            </button>
          </div>
        </div>

        {swrError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{swrError.message || "بارگذاری تیکت‌ها با خطا مواجه شد."}</span>
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

        {showCreateForm ? (
          <UserTicketForm
            setShowCreateForm={setShowCreateForm}
            onTicketCreated={handleTicketCreated}
          />
        ) : (
          <div className="w-full">
            <UserTicketSidebarList
              tickets={data?.tickets || []}
              filterStatus={filterStatus}
              setFilterStatus={handleFilterStatusChange}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={data?.totalPages || 1}
              totalItems={data?.total || 0}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
