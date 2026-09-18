"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import type {
  IClientTicket,
  AdminTicketsApiResponse,
  AdminTicketsContainerProps,
} from "@/types/ticket";
import TicketStatsCards from "./TicketStatsCards";
import TicketSidebarList from "./TicketSidebarList";

const fetcher = async (url: string): Promise<AdminTicketsApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "خطا در دریافت لیست تیکت‌ها");
  }
  return res.json();
};

export default function AdminTicketsContainer({
  stats,
}: AdminTicketsContainerProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "answered" | "closed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const PAGE_SIZE = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterStatusChange = (
    status: "all" | "pending" | "answered" | "closed"
  ) => {
    setFilterStatus(status);
    setCurrentPage(1);
    setSelectedTicketId(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedTicketId(null);
  };

  const searchParam = debouncedSearch.trim()
    ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
    : "";
  const statusParam =
    filterStatus !== "all" ? `&status=${filterStatus}` : "";
  const apiUrl = `/api/admin/ticket?page=${currentPage}&limit=${PAGE_SIZE}${statusParam}${searchParam}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AdminTicketsApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    });

  const selectedTicket =
    data?.tickets?.find((t) => t._id === selectedTicketId) || null;

  const handleSelectTicket = (ticket: IClientTicket) => {
    setSelectedTicketId(ticket._id);
  };

  return (
    <div className="overflow-hidden font-danaMed" dir="rtl">
      <div className="container mx-auto pt-8 pb-16 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl max-sm:text-xl font-bold text-white mb-2 font-morabbaReg">
              مدیریت تیکت‌های پشتیبانی
            </h1>
            <p className="text-white/60 max-sm:text-xs text-sm">
              بررسی و پاسخگویی به تیکت‌های پشتیبانی، ورزشی و تغذیه‌ای کاربران استار فیت
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

            <Link
              href="/admin/sendTicket"
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer text-sm shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>ارسال تیکت جدید</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error.message || "خطا در دریافت لیست تیکت‌ها از سرور"}</span>
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

        <TicketStatsCards
          stats={stats}
          formatNumber={(num) => new Intl.NumberFormat("fa-IR").format(num || 0)}
        />

        <div className="w-full">
          <TicketSidebarList
            tickets={data?.tickets || []}
            selectedTicket={selectedTicket}
            onSelectTicket={handleSelectTicket}
            filterStatus={filterStatus}
            setFilterStatus={handleFilterStatusChange}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total || 0}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
