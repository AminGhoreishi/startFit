"use client";

import { useState } from "react";
import useSWR from "swr";
import Pagination from "@/components/common/Pagination";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Package,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  MoreVertical,
  PlusCircle,
} from "lucide-react";
import type { IAdminUser, AdminUsersApiResponse } from "@/types/user";
import { showAlert, showConfirm } from "@/utils/alert";
import { getStatusBadge, getRoleBadge, getRoleLabel } from "@/utils/user";
import { formatNumber } from "@/utils/numbers";
import UserEditModal from "./UserEditModal";
import CreateSubscriptionModal from "../subscription/CreateSubscriptionModal";

const fetcher = async (url: string): Promise<AdminUsersApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "خطا در دریافت لیست کاربران");
  }
  return res.json();
};

export default function UserTableList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [subscriptionUser, setSubscriptionUser] = useState<IAdminUser | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const cleanSearch = searchQuery.trim();
  let apiUrl = `/api/admin/user?page=${currentPage}`;
  if (filterStatus !== "all") {
    apiUrl += `&status=${filterStatus}`;
  }
  if (cleanSearch) {
    apiUrl += `&search=${encodeURIComponent(cleanSearch)}`;
  }

  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<AdminUsersApiResponse>(apiUrl, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const rawUsers = data?.users || data?.userFind || [];
  const totalPages = data?.totalPage || 1;
  const totalUsers = data?.totalUsers || rawUsers.length;

  const users: IAdminUser[] = rawUsers.map((u) => {
    let persianStatus = u.status;
    if (u.status === "active") persianStatus = "فعال";
    else if (u.status === "blocked") persianStatus = "مسدود";
    else if (u.status === "expired") persianStatus = "منقضی";
    return {
      ...u,
      status: persianStatus,
    };
  });

  const handleToggleBlock = async (user: IAdminUser) => {
    const isBlocked = user.status === "مسدود" || user.status === "blocked";
    const title = isBlocked ? "رفع مسدودیت کاربر" : "مسدود کردن کاربر";
    const text = isBlocked
      ? `آیا مطمئن هستید که می‌خواهید دسترسی کاربر «${user.username}» را فعال کنید؟`
      : `آیا مطمئن هستید که می‌خواهید دسترسی کاربر «${user.username}» را مسدود کنید؟`;
    const confirmButtonText = isBlocked ? "بله، فعال شود" : "بله، مسدود شود";
    const confirmButtonColor = isBlocked ? "#10b981" : "#ef4444";

    const confirmed = await showConfirm({
      title,
      text,
      confirmButtonText,
      confirmButtonColor,
      icon: "warning",
    });

    if (confirmed) {
      try {
        const newStatus = isBlocked ? "active" : "blocked";
        const res = await fetch(`/api/admin/user/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        const resData = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(resData.error || resData.message || "خطا در انجام عملیات");
        }

        showAlert({
          title: "موفقیت",
          text: isBlocked
            ? "کاربر با موفقیت فعال شد."
            : "کاربر با موفقیت مسدود شد.",
          icon: "success",
        });

        mutate();
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "انجام عملیات با خطا مواجه شد";
        showAlert({
          title: "خطا",
          text: errMessage,
          icon: "error",
        });
      }
    }
  };

  const handleDeleteUser = async (user: IAdminUser) => {
    const confirmed = await showConfirm({
      title: "حذف کاربر",
      text: `آیا مطمئن هستید که می‌خواهید کاربر «${user.username}» را به طور کامل حذف کنید؟`,
      confirmButtonText: "بله، حذف شود",
      confirmButtonColor: "#ef4444",
      icon: "warning",
    });

    if (confirmed) {
      try {
        const res = await fetch(`/api/admin/user/${user._id}`, {
          method: "DELETE",
        });

        const resData = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(resData.message || resData.error || "خطا در حذف کاربر");
        }

        showAlert({
          title: "موفقیت",
          text: "کاربر با موفقیت حذف شد.",
          icon: "success",
        });

        mutate();
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "انجام عملیات با خطا مواجه شد";
        showAlert({
          title: "خطا",
          text: errMessage,
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="font-danaMed">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="جستجو براساس نام کاربری، ایمیل یا شماره تلفن..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg pr-12 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 text-sm cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="expired">منقضی</option>
              <option value="blocked">مسدود</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/5  backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl font-danaMed">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  کاربر
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  تماس
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  پکیج فعال
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  وضعیت
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  نقش
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  تاریخ عضویت
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  کل پرداخت
                </th>
                <th className="p-4 text-right text-white/80 text-sm font-medium">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-white/50 text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      در حال بارگذاری اطلاعات کاربران...
                    </div>
                  </td>
                </tr>
              ) : swrError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-red-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <p>{swrError.message || "خطا در دریافت لیست کاربران"}</p>
                      <button
                        type="button"
                        onClick={() => mutate()}
                        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg text-xs hover:bg-white/20 transition-all cursor-pointer font-bold"
                      >
                        <RefreshCw className="w-4 h-4" />
                        تلاش مجدد
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-white/50">
                      <Users className="w-12 h-12 opacity-30" />
                      <p className="text-lg">کاربری پیدا نشد</p>
                      {searchQuery && (
                        <p className="text-sm">
                          نتیجه‌ای برای جستجوی «{searchQuery}» یافت نشد
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/5 transition-colors text-white"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-xl font-bold text-amber-400 overflow-hidden shrink-0">
                          {user.avatar &&
                            (user.avatar.startsWith("http://") ||
                              user.avatar.startsWith("https://") ||
                              user.avatar.startsWith("/") ||
                              user.avatar.startsWith("data:image")) ? (
                            <img
                              src={user.avatar}
                              alt={user.username || "کاربر"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.avatar ||
                            user.username[0]?.toUpperCase() ||
                            "👤"
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {user.username}
                          </div>
                          <div className="text-white/60 text-xs mt-0.5">
                            {user.email || "بدون ایمیل"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>{user.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-xs ss02">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{user.phone || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Package className="w-4 h-4 text-amber-400" />
                        {user.package || "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center  gap-1 px-3 py-1 rounded-full text-[10px] font-semibold border ${getStatusBadge(user.status)}`}
                      >
                        {user.status === "فعال" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {user.status === "منقضی" && (
                          <Calendar className="w-3 h-3" />
                        )}
                        {user.status === "مسدود" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadge(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4 text-white/70 text-sm ss02">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium font-danaMed">
                        {user.totalPayments
                          ? formatNumber(user.totalPayments)
                          : "۰"}
                      </span>
                      <span className="text-white/60 text-xs mr-1">تومان</span>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === user._id ? null : user._id
                            )
                          }
                          className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-white/70"
                          title="عملیات"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === user._id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute left-0 top-full mt-1 w-44 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 text-xs font-danaMed">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setEditingUser(user);
                                }}
                                className="w-full text-right px-3.5 py-2 hover:bg-white/5 text-white/90 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit className="w-4 h-4 text-amber-400" />
                                <span>ویرایش</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSubscriptionUser(user);
                                }}
                                className="w-full text-right px-3.5 py-2 hover:bg-white/5 text-white/90 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <PlusCircle className="w-4 h-4 text-amber-400" />
                                <span>افزودن اشتراک</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleToggleBlock(user);
                                }}
                                className="w-full text-right px-3.5 py-2 hover:bg-white/5 text-white/90 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Ban
                                  className={`w-4 h-4 ${
                                    user.status === "مسدود" ||
                                    user.status === "blocked"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                />
                                <span>
                                  {user.status === "مسدود" ||
                                  user.status === "blocked"
                                    ? "رفع مسدودیت"
                                    : "مسدود کردن"}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleDeleteUser(user);
                                }}
                                className="w-full text-right px-3.5 py-2 hover:bg-white/5 text-red-400 flex items-center gap-2 cursor-pointer transition-colors border-t border-white/5"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                                <span>حذف کاربر</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaveSuccess={() => {
            setEditingUser(null);
            mutate();
          }}
        />
      )}

      {subscriptionUser && (
        <CreateSubscriptionModal
          initialUser={subscriptionUser}
          onClose={() => setSubscriptionUser(null)}
          onSuccess={() => {
            setSubscriptionUser(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
