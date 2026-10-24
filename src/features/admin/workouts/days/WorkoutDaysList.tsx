"use client";

import { memo } from "react";
import { Edit, Trash2 } from "lucide-react";
import { showAlert, showConfirm } from "@/utils/alert";
import type { WorkoutDaysListProps } from "@/types/workout";

function WorkoutDaysList({
  workoutDays,
  selectedDay,
  onSelectDay,
  onEditDay,
  onDayDeleted,
  onDeleteDay,
}: WorkoutDaysListProps) {
  const handleDeleteDay = async (id: string) => {
    if (onDeleteDay) {
      onDeleteDay(id);
      return;
    }

    const confirmed = await showConfirm({
      title: "حذف روز تمرینی",
      text: "آیا از حذف این روز و تمامی حرکات ورزشی آن اطمینان دارید؟",
      confirmButtonText: "بله، حذف شود",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/subscription/workout-days?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedDay?._id === id) {
          onSelectDay(null);
        }
        if (onDayDeleted) {
          onDayDeleted();
        }
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در حذف روز",
        icon: "error",
      });
    }
  };

  if (workoutDays.length === 0) {
    return (
      <div className="text-white/40 text-center text-xs p-8 border border-dashed border-white/10 rounded-xl font-danaMed" dir="rtl">
        هیچ روز تمرینی تعریف نشده است
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[400px] font-danaMed" dir="rtl">
      {workoutDays.map((day) => {
        const isSelected = selectedDay?._id === day._id;
        return (
          <div
            key={day._id}
            onClick={() => onSelectDay(day)}
            className={`p-4 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between ${
              isSelected
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-bold border-amber-400 text-white shadow-lg shadow-amber-500/20"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            <div>
              <div className="font-bold text-xs">{day.dayName}</div>
              <div
                className={`text-[10px] mt-1 ${
                  isSelected ? "text-neutral-900 font-semibold" : "text-white/50"
                }`}
              >
                عضله هدف: {day.muscleGroup}
              </div>
            </div>
            <div
              className="flex gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEditDay(day)}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  isSelected
                    ? "hover:bg-black/10 text-neutral-900"
                    : "hover:bg-white/5 text-blue-400"
                }`}
                title="ویرایش روز"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDay(day._id)}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  isSelected
                    ? "hover:bg-black/10 text-neutral-900"
                    : "hover:bg-white/5 text-red-400"
                }`}
                title="حذف روز"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function areWorkoutDaysPropsEqual(
  prevProps: WorkoutDaysListProps,
  nextProps: WorkoutDaysListProps
) {
  if (prevProps.selectedDay?._id !== nextProps.selectedDay?._id) {
    return false;
  }
  if (prevProps.workoutDays.length !== nextProps.workoutDays.length) {
    return false;
  }
  for (let i = 0; i < prevProps.workoutDays.length; i++) {
    if (
      prevProps.workoutDays[i]._id !== nextProps.workoutDays[i]._id ||
      prevProps.workoutDays[i].dayName !== nextProps.workoutDays[i].dayName ||
      prevProps.workoutDays[i].muscleGroup !== nextProps.workoutDays[i].muscleGroup
    ) {
      return false;
    }
  }
  return true;
}

export default memo(WorkoutDaysList, areWorkoutDaysPropsEqual);
