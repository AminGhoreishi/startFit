"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X, Dumbbell, Video as VideoIcon, Trash2, Edit } from "lucide-react";
import type {
  WorkoutProgramFormProps,
  WorkoutProgramFormInputs,
  ProgramExerciseItem,
} from "@/types/workout";
import { showAlert } from "@/utils/alert";

interface ExerciseFormInputs {
  name: string;
  description?: string;
  videoId?: string;
  videoId2?: string;
  sets: number;
  reps: string;
  weight?: string;
  restSec: number;
}

const defaultExerciseValues: ExerciseFormInputs = {
  name: "",
  description: "",
  videoId: "",
  videoId2: "",
  sets: 3,
  reps: "10-12",
  weight: "",
  restSec: 60,
};

export default function WorkoutProgramForm({
  workoutPlanId,
  editingProgramDay,
  videos = [],
  onSuccess,
  onCancel,
}: WorkoutProgramFormProps) {
  const {
    register: registerDay,
    handleSubmit: handleSubmitDay,
    reset: resetDay,
  } = useForm<WorkoutProgramFormInputs>();

  const {
    register: registerExercise,
    handleSubmit: handleSubmitExercise,
    reset: resetExercise,
  } = useForm<ExerciseFormInputs>({
    defaultValues: defaultExerciseValues,
  });

  const [exercisesList, setExercisesList] = useState<ProgramExerciseItem[]>([]);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editingProgramDay) {
      resetDay({
        day: editingProgramDay.day,
        muscleGroup: editingProgramDay.muscleGroup,
      });
      setExercisesList(editingProgramDay.exercises || []);
    } else {
      resetDay({
        day: "",
        muscleGroup: "",
      });
      setExercisesList([]);
    }
    setEditingExerciseIndex(null);
    resetExercise(defaultExerciseValues);
  }, [editingProgramDay, resetDay, resetExercise]);

  const handleSaveExercise = (data: ExerciseFormInputs) => {
    const trimmed = data.name.trim();
    if (!trimmed) {
      showAlert({
        title: "خطا",
        text: "نام حرکت ورزشی را وارد کنید.",
        icon: "error",
      });
      return;
    }

    const trimmedWeight = data.weight ? String(data.weight).trim() : "";
    const parsedWeight = trimmedWeight
      ? !isNaN(Number(trimmedWeight))
        ? Number(trimmedWeight)
        : trimmedWeight
      : undefined;

    const exerciseItem: ProgramExerciseItem = {
      name: trimmed,
      description: data.description?.trim() || undefined,
      videoId: data.videoId || null,
      videoId2: data.videoId2 || null,
      sets: Number(data.sets) || 1,
      reps: data.reps?.trim() || "10",
      weight: parsedWeight,
      restSec: Number(data.restSec) || 60,
    };

    if (editingExerciseIndex !== null) {
      setExercisesList((prev) =>
        prev.map((item, idx) => (idx === editingExerciseIndex ? exerciseItem : item))
      );
      setEditingExerciseIndex(null);
    } else {
      setExercisesList((prev) => [...prev, exerciseItem]);
    }

    resetExercise(defaultExerciseValues);
  };

  const handleEditExercise = (exercise: ProgramExerciseItem, index: number) => {
    setEditingExerciseIndex(index);
    resetExercise({
      name: exercise.name,
      description: exercise.description || "",
      videoId: exercise.videoId || "",
      videoId2: exercise.videoId2 || "",
      sets: exercise.sets,
      reps: exercise.reps,
      weight:
        exercise.weight !== undefined && exercise.weight !== null
          ? String(exercise.weight)
          : "",
      restSec: exercise.restSec,
    });
  };

  const handleCancelEditExercise = () => {
    setEditingExerciseIndex(null);
    resetExercise(defaultExerciseValues);
  };

  const handleRemoveExercise = (indexToRemove: number) => {
    if (editingExerciseIndex === indexToRemove) {
      setEditingExerciseIndex(null);
      resetExercise(defaultExerciseValues);
    } else if (editingExerciseIndex !== null && indexToRemove < editingExerciseIndex) {
      setEditingExerciseIndex(editingExerciseIndex - 1);
    }
    setExercisesList((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const onSubmit = async (data: WorkoutProgramFormInputs) => {
    if (!data.day?.trim()) {
      showAlert({
        title: "خطا",
        text: "وارد کردن نام روز الزامی است.",
        icon: "error",
      });
      return;
    }

    if (exercisesList.length === 0) {
      showAlert({
        title: "خطا",
        text: "حداقل باید یک ورزش برای این روز ثبت کنید.",
        icon: "error",
      });
      return;
    }

    try {
      if (editingProgramDay && editingProgramDay._id) {
        const res = await fetch("/api/admin/subscription/workout-programs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: workoutPlanId,
            programDayId: editingProgramDay._id,
            day: data.day.trim(),
            muscleGroup: data.muscleGroup?.trim() || "",
            exercises: exercisesList,
          }),
        });

        if (res.ok) {
          showAlert({
            title: "موفقیت",
            text: "برنامه روز با موفقیت بروزرسانی شد",
            icon: "success",
          });
          onSuccess();
        } else {
          const err = await res.json().catch(() => ({}));
          showAlert({
            title: "خطا",
            text: err.message || "خطا در بروزرسانی روز",
            icon: "error",
          });
        }
      } else {
        const res = await fetch("/api/admin/subscription/workout-programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: workoutPlanId,
            day: data.day.trim(),
            muscleGroup: data.muscleGroup?.trim() || "",
            exercises: exercisesList,
          }),
        });

        if (res.ok) {
          showAlert({
            title: "موفقیت",
            text: "برنامه روز جدید با موفقیت ثبت شد",
            icon: "success",
          });
          onSuccess();
        } else {
          const err = await res.json().catch(() => ({}));
          showAlert({
            title: "خطا",
            text: err.message || "خطا در ثبت روز",
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
      onSubmit={handleSubmitDay(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 text-right font-danaMed animate-in fade-in slide-in-from-top-4 duration-200"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-white font-bold text-sm flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-amber-400" />
          {editingProgramDay ? "ویرایش روز تمرین" : "ثبت روز و حرکات تمرینی"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/70 mb-1 font-semibold">
              روز تمرینی
            </label>
            <input
              type="text"
              placeholder="مثال: شنبه یا روز اول"
              {...registerDay("day", { required: true })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1 font-semibold">
              عضله هدف
            </label>
            <input
              type="text"
              placeholder="مثال: سینه و پشت بازو"
              {...registerDay("muscleGroup")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              {editingExerciseIndex !== null ? (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  <span>ویرایش حرکت تمرینی</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن حرکت تمرینی به این روز</span>
                </>
              )}
            </div>
            {editingExerciseIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEditExercise}
                className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                نام حرکت ورزشی
              </label>
              <input
                type="text"
                {...registerExercise("name")}
                placeholder="مثال: پرس بالاسینه هالتر"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                توضیحات حرکت (اختیاری)
              </label>
              <input
                type="text"
                {...registerExercise("description")}
                placeholder="مثال: مکث در اوج انقباض، سوپرست با حرکت بعد"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                ویدیو آموزشی اول
              </label>
              <select
                {...registerExercise("videoId")}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">بدون ویدیو</option>
                {videos.map((vid) => (
                  <option key={vid._id} value={vid._id}>
                    {vid.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                ویدیو آموزشی دوم (اختیاری)
              </label>
              <select
                {...registerExercise("videoId2")}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">بدون ویدیو</option>
                {videos.map((vid) => (
                  <option key={vid._id} value={vid._id}>
                    {vid.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                تعداد ست
              </label>
              <input
                type="number"
                min={1}
                {...registerExercise("sets", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 ss02"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                تکرار
              </label>
              <input
                type="text"
                {...registerExercise("reps")}
                placeholder="10-12"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 ss02"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                وزنه
              </label>
              <input
                type="text"
                {...registerExercise("weight")}
                placeholder="مثلاً: 15"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 ss02"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                استراحت (ثانیه)
              </label>
              <input
                type="number"
                min={0}
                {...registerExercise("restSec", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 ss02"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitExercise(handleSaveExercise)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                editingExerciseIndex !== null
                  ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30"
              }`}
            >
              {editingExerciseIndex !== null ? (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  <span>بروزرسانی حرکت در لیست</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت و اضافه کردن این حرکت به لیست</span>
                </>
              )}
            </button>
            {editingExerciseIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEditExercise}
                className="bg-white/10 hover:bg-white/15 text-white py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                انصراف
              </button>
            )}
          </div>
        </div>

        {exercisesList.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-[11px] text-white/50 font-semibold">
              حرکات ثبت‌شده برای این روز ({exercisesList.length}):
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {exercisesList.map((exercise, idx) => (
                <div
                  key={`${exercise.name}-${idx}`}
                  className={`rounded-xl p-3 flex items-center justify-between gap-2 group transition-all border ${
                    editingExerciseIndex === idx
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-white/5 border border-white/10 hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 ss02">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {exercise.name}
                      </div>
                      {exercise.description && (
                        <div className="text-[10px] text-amber-300/80 mt-0.5 line-clamp-1">
                          {exercise.description}
                        </div>
                      )}
                      <div className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5 ss02">
                        <span>{exercise.sets} ست</span>
                        <span>•</span>
                        <span>{exercise.reps} تکرار</span>
                        {exercise.weight ? (
                          <>
                            <span>•</span>
                            <span>
                              {typeof exercise.weight === "number" ||
                              !isNaN(Number(exercise.weight))
                                ? `${exercise.weight} کیلو`
                                : exercise.weight}
                            </span>
                          </>
                        ) : null}
                        <span>•</span>
                        <span>{exercise.restSec} ثانیه استراحت</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditExercise(exercise, idx)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        editingExerciseIndex === idx
                          ? "text-amber-400"
                          : "text-white/30 hover:text-amber-400"
                      }`}
                      title="ویرایش حرکت"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-white/30 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                      title="حذف حرکت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
        >
          {editingProgramDay ? "بروزرسانی روز تمرینی" : "ذخیره روز و حرکات"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white/10 hover:bg-white/15 text-white py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
