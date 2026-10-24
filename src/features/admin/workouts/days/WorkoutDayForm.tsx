"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { WorkoutDayFormProps, WorkoutDayFormInputs, WorkoutDay } from "@/types/workout";
import { showAlert } from "@/utils/alert";

export default function WorkoutDayForm({
  editingDay,
  workoutPlanId,
  userId,
  onSuccess,
  onCancel,
  defaultSortOrder,
}: WorkoutDayFormProps) {
  const { register, handleSubmit, reset } = useForm<WorkoutDayFormInputs>();

  useEffect(() => {
    if (editingDay) {
      reset({
        dayName: editingDay.dayName,
        muscleGroup: editingDay.muscleGroup,
        sortOrder: editingDay.sortOrder,
      });
    } else {
      reset({
        dayName: "",
        muscleGroup: "",
        sortOrder: defaultSortOrder,
      });
    }
  }, [editingDay, defaultSortOrder, reset]);

  const onSubmit = async (data: WorkoutDayFormInputs) => {
    if (!data.dayName?.trim() || !data.muscleGroup?.trim()) {
      showAlert({
        title: "خطا",
        text: "پر کردن نام روز و گروه عضلانی الزامی است.",
        icon: "error",
      });
      return;
    }
    try {
      if (editingDay) {
        const res = await fetch("/api/admin/subscription/workout-days", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingDay._id,
            dayName: data.dayName,
            muscleGroup: data.muscleGroup,
            sortOrder: Number(data.sortOrder),
            userId: userId || null,
          }),
        });
        if (res.ok) {
          const updatedDay: WorkoutDay = {
            ...editingDay,
            dayName: data.dayName,
            muscleGroup: data.muscleGroup,
            sortOrder: Number(data.sortOrder),
          };
          onSuccess(updatedDay);
        } else {
          const err = await res.json().catch(() => ({}));
          showAlert({
            title: "خطا",
            text: err.message || "خطا در ویرایش روز",
            icon: "error",
          });
        }
      } else {
        const res = await fetch("/api/admin/subscription/workout-days", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: workoutPlanId,
            userId: userId || null,
            dayName: data.dayName,
            muscleGroup: data.muscleGroup,
            sortOrder: Number(data.sortOrder),
          }),
        });
        if (res.ok) {
          onSuccess();
        } else {
          const err = await res.json().catch(() => ({}));
          showAlert({
            title: "خطا",
            text: err.message || "خطا در ایجاد روز",
            icon: "error",
          });
        }
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در برقراری ارتباط با سرور",
        icon: "error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-right font-danaMed animate-in fade-in slide-in-from-top-4 duration-200"
      dir="rtl"
    >
      <div className="text-white font-bold text-xs">
        {editingDay ? "ویرایش روز تمرین" : "ثبت روز جدید"}
      </div>
      <div>
        <input
          type="text"
          placeholder="نام روز (مثال: شنبه - سینه)"
          {...register("dayName", { required: true })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-amber-400"
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="عضله هدف (مثال: سینه و جلو بازو)"
          {...register("muscleGroup", { required: true })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-amber-400"
          required
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="ترتیب نمایش"
          {...register("sortOrder", { required: true })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-amber-400 ss02"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          {editingDay ? "بروزرسانی" : "افزودن"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 hover:bg-white/15 text-white py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
