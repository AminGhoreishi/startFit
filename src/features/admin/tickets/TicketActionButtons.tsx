import { RotateCcw, CheckCircle2, Trash2 } from "lucide-react";

interface TicketActionButtonsProps {
  isClosed: boolean;
  isLoading?: boolean;
  onReopen: () => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function TicketActionButtons({
  isClosed,
  isLoading = false,
  onReopen,
  onClose,
  onDelete,
}: TicketActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
      {isClosed ? (
        <button
          type="button"
          onClick={onReopen}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>بازگشایی تیکت</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>بستن تیکت</span>
        </button>
      )}

      <button
        type="button"
        onClick={onDelete}
        disabled={isLoading}
        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="حذف تیکت"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
