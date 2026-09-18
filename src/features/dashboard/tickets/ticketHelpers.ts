import type { TicketFilterOption } from "@/types/ticket";

export const FILTER_OPTIONS: TicketFilterOption[] = [
  { key: "all", label: "همه" },
  { key: "pending", label: "در انتظار" },
  { key: "answered", label: "پاسخ‌داده" },
  { key: "closed", label: "بسته" },
];

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "answered":
    case "coach_sent":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "closed":
      return "bg-white/10 text-white/50 border-white/20";
    default:
      return "bg-white/10 text-white/50 border-white/20";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "در انتظار پاسخ";
    case "answered":
      return "پاسخ داده شده";
    case "coach_sent":
      return "ارسال از مربی";
    case "closed":
      return "بسته شده";
    default:
      return status;
  }
};

export const getCategoryBadge = (category: string) => {
  switch (category) {
    case "workout":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "nutrition":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "form_check":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "injury":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "technical":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
};

export const getCategoryLabel = (category: string) => {
  switch (category) {
    case "workout":
      return "تمرین";
    case "nutrition":
      return "تغذیه";
    case "form_check":
      return "فرم حرکت";
    case "injury":
      return "آسیب / درد";
    case "technical":
      return "پشتیبانی فنی";
    default:
      return category;
  }
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fa-IR");
  } catch {
    return dateStr;
  }
};

export const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export const isVideo = (url?: string) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".mov", ".webm", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase().split("?")[0];
  return videoExtensions.some((ext) => lowerUrl.endsWith(ext));
};

export const isValidObjectId = (id?: string): boolean => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};
