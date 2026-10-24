"use client";

import { memo, useCallback } from "react";
import { Edit, Trash2, Dumbbell } from "lucide-react";
import { showAlert, showConfirm } from "@/utils/alert";
import type { ProgramDaysListProps } from "@/types/workout";

function ProgramDaysList({
  planId,
  programDays,
  selectedProgramDay,
  onSelectProgramDay,
  onEditProgramDay,
  mutateProgram,
}: ProgramDaysListProps) {
  const handleDelete = useCallback(
    async (programDayId?: string) => {
      if (!programDayId || !planId) return;

      const confirmed = await showConfirm({
        title: "حذف روز تمرینی",
        text: "آیا از حذف این روز و ورزش‌های آن اطمینان دارید؟",
        confirmButtonText: "بله، حذف شود",
        icon: "warning",
      });

      if (!confirmed) return;

      try {
        const res = await fetch(
          `/api/admin/subscription/workout-programs?planId=${planId}&programDayId=${programDayId}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          if (selectedProgramDay?._id === programDayId) {
            onSelectProgramDay(null);
          }
          mutateProgram();
          showAlert({
            title: "موفقیت",
            text: "روز تمرینی با موفقیت حذف شد",
            icon: "success",
          });
        }
      } catch {
        showAlert({
          title: "خطا",
          text: "خطا در حذف روز تمرینی",
          icon: "error",
        });
      }
    },
    [planId, selectedProgramDay, onSelectProgramDay, mutateProgram]
  );

  if (programDays.length === 0) {
    return (
      <div className="text-white/40 text-center text-xs p-8 border border-dashed border-white/10 rounded-2xl font-danaMed bg-white/5" dir="rtl">
        هنوز هیچ روز تمرینی به این برنامه اضافه نشده است. با کلیک بر روی «برنامه جدید» روز و حرکات تمرینی را اضافه کنید.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-danaMed" dir="rtl">
      {programDays.map((dayItem, idx) => {
        const isSelected = selectedProgramDay?._id === dayItem._id || selectedProgramDay?.day === dayItem.day;
        const exercisesCount = dayItem.exercises?.length || 0;

        return (
          <div
            key={dayItem._id || `${dayItem.day}-${idx}`}
            onClick={() => onSelectProgramDay(dayItem)}
            className={`p-4 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between gap-3 ${
              isSelected
                ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                : "bg-white/5 border-white/10 text-white hover:bg-white/[0.08]"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate flex items-center gap-2">
                <span className={isSelected ? "text-amber-400" : "text-white"}>
                  {dayItem.day}
                </span>
              </div>
              {dayItem.muscleGroup && (
                <div className="text-xs text-white/50 truncate mt-0.5">
                  عضله هدف: {dayItem.muscleGroup}
                </div>
              )}
              <div className="text-[11px] mt-1.5 text-amber-400/80 flex items-center gap-1.5 ss02 font-semibold">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{exercisesCount} حرکت ورزشی</span>
              </div>
            </div>

            <div
              className="flex items-center gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEditProgramDay(dayItem)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors cursor-pointer"
                title="ویرایش روز"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(dayItem._id)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors cursor-pointer"
                title="حذف روز"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ProgramDaysList);
