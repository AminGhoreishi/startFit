"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Dumbbell,
  TrendingUp,
  Weight,
  Timer,
  Info,
  ChevronDown,
  Play,
  HelpCircle,
  SlidersHorizontal,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { ExercisesListProps } from "@/types/workout";
import ExerciseFeedbackForm from "./ExerciseFeedbackForm";
import { showToast } from "@/utils/alert";

export default function ExercisesList({
  exercises,
  muscleGroup,
  userId,
  dayId,
}: ExercisesListProps) {
  const [completedExercises, setCompletedExercises] = useState<
    Record<string, boolean>
  >({});
  const [activeTipsId, setActiveTipsId] = useState<string | null>(null);
  const [activeQuestionsId, setActiveQuestionsId] = useState<string | null>(
    null
  );
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<string>("");
  const [savingWeightId, setSavingWeightId] = useState<string | null>(null);

  useEffect(() => {
    const progressMap: Record<string, boolean> = {};
    exercises.forEach((item) => {
      if (item._id) {
        progressMap[item._id] = !!item.isComplete;
      }
    });
    setCompletedExercises(progressMap);
  }, [exercises]);

  const toggleExercise = async (exerciseId: string) => {
    const isSelect = !completedExercises[exerciseId];

    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: isSelect,
    }));

    try {
      const res = await fetch(`/api/admin/subscription/workout-programs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exerciseId, isComplete: isSelect }),
      });

      if (!res.ok) {
        throw new Error("خطا در ثبت وضعیت");
      }
    } catch {
      setCompletedExercises((prev) => ({
        ...prev,
        [exerciseId]: !isSelect,
      }));
    }
  };

  const handleStartEditWeight = (exerciseId: string, currentWeight: number) => {
    setEditingWeightId(exerciseId);
    setTempWeight(String(currentWeight ?? 0));
  };

  const handleSaveWeight = async (exerciseId: string) => {
    const parsedWeight = parseFloat(tempWeight);
    if (isNaN(parsedWeight) || parsedWeight < 0) {
      showToast({ title: "لطفاً یک عدد معتبر وارد کنید", icon: "error" });
      return;
    }

    const previousWeight = weights[exerciseId];
    setWeights((prev) => ({ ...prev, [exerciseId]: parsedWeight }));
    setSavingWeightId(exerciseId);

    try {
      const res = await fetch("/api/admin/subscription/workout-programs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, weight: parsedWeight }),
      });

      if (!res.ok) {
        throw new Error("خطا در بروزرسانی وزنه");
      }

      setEditingWeightId(null);
      showToast({ title: "وزنه بروزرسانی شد", icon: "success" });
    } catch {
      if (previousWeight !== undefined) {
        setWeights((prev) => ({ ...prev, [exerciseId]: previousWeight }));
      }
      showToast({ title: "خطا در ثبت وزنه", icon: "error" });
    } finally {
      setSavingWeightId(null);
    }
  };

  return (
    <div className="space-y-4 font-danaMed" dir="rtl">
      {exercises.map((exercise, idx) => {
        const isCompleted = !!completedExercises[exercise._id];
        const isExpanded = activeTipsId === exercise._id;
        const videoDescription =
          exercise.videoId?.description || exercise.videoId2?.description;
        const coachTips =
          exercise.description ||
          videoDescription ||
          "لطفاً تمرکز روی بخش منفی و انقباض کامل عضله را در این حرکت حفظ کنید.";

        return (
          <div
            key={exercise._id}
            className={`
              relative overflow-visible rounded-2xl ss02 border transition-all duration-300 bg-white/[0.03]
              ${isCompleted
                ? "border-amber-500/40 bg-amber-500/10 shadow-inner"
                : "border-white/10 hover:border-amber-500/30 hover:bg-white/5"
              }
            `}
          >
            <div className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => toggleExercise(exercise._id)}
                  className={`
                    w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-1 cursor-pointer
                    ${isCompleted
                      ? "bg-amber-400 border-amber-400 text-neutral-950"
                      : "border-white/20 hover:border-amber-500/40 bg-white/5 text-transparent"
                    }
                  `}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
                      {muscleGroup}
                    </span>
                    <span className="text-xs sm:text-xs bg-white/5 text-neutral-400 px-2 py-0.5 rounded-md">
                      حرکت {idx + 1}
                    </span>
                  </div>
                  <h4
                    className={`text-base font-bold transition-all ${isCompleted ? "text-neutral-400 line-through" : "text-white"}`}
                  >
                    {exercise.name}
                  </h4>

                  {exercise.description && (
                    <p
                      className={`text-xs sm:text-sm leading-relaxed transition-all pt-0.5 ${
                        isCompleted ? "text-neutral-500 line-through" : "text-neutral-300"
                      }`}
                    >
                      {exercise.description}
                    </p>
                  )}

                  <div className="flex flex-wrap max-sm:text-[12px]! items-center gap-x-4 gap-y-1 text-sm max-sm:text-xs text-neutral-400 pt-2 font-semibold font-mono">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 font-danaMed ss02 h-3.5 text-amber-400" />
                      <span className="font-danaMed">{exercise.sets} ست</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 font-danaMed ss02 h-3.5 text-amber-400" />
                      <span className="font-danaMed">{exercise.reps} تکرار</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Weight className="w-3.5 font-danaMed ss02 h-3.5 text-amber-400" />
                      {editingWeightId === exercise._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={tempWeight}
                            onChange={(e) => setTempWeight(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveWeight(exercise._id);
                              if (e.key === "Escape") setEditingWeightId(null);
                            }}
                            className="w-14 px-1 py-0.5 bg-neutral-900 border border-amber-500/50 rounded text-xs text-amber-400 focus:outline-none focus:border-amber-400 font-danaMed"
                            autoFocus
                          />
                          <span className="text-xs font-danaMed text-neutral-400">کیلوگرم</span>
                          <button
                            type="button"
                            disabled={savingWeightId === exercise._id}
                            onClick={() => handleSaveWeight(exercise._id)}
                            className="p-0.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                            title="ذخیره"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingWeightId(null)}
                            className="p-0.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="انصراف"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-danaMed">
                            {exercise.weight
                              ? typeof exercise.weight === "number" || !isNaN(Number(exercise.weight))
                                ? `وزنه: ${weights[exercise._id] ?? exercise.weight} کیلوگرم`
                                : `وزنه: ${weights[exercise._id] ?? exercise.weight}`
                              : "وزنه: آزاد"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEditWeight(
                                exercise._id,
                                weights[exercise._id] ?? exercise.weight ?? 0
                              )
                            }
                            className="p-0.5 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="ویرایش وزنه"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-danaMed">
                        استراحت: {exercise.restSec} ثانیه
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-end border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTipsId(
                      activeTipsId === exercise._id ? null : exercise._id
                    )
                  }
                  className={`
                    flex items-center gap-1 px-3 py-2 text-sm sm:text-xs rounded-xl transition-all cursor-pointer
                    ${isExpanded
                      ? "bg-white/10 text-white"
                      : "text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10"
                    }
                  `}
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>نکات مربی</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveQuestionsId(
                        activeQuestionsId === exercise._id
                          ? null
                          : exercise._id
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-sm sm:text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>سوالات</span>
                  </button>
                )}

                {(exercise.videoId?.url || exercise.videoId2?.url) && (
                  <button
                    type="button"
                    onClick={() =>
                      setPlayingVideo(
                        playingVideo === exercise._id ? null : exercise._id
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-sm sm:text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>
                      {exercise.videoId?.url && exercise.videoId2?.url
                        ? "ویدیوهای آموزش"
                        : "ویدیو آموزش"}
                    </span>
                  </button>
                )}
              </div>

              <div className="relative sm:hidden w-full pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === exercise._id ? null : exercise._id
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-amber-500/20 text-amber-400 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex max-sm:text-xs! items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>گزینه‌های حرکت</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${openDropdownId === exercise._id ? "rotate-180" : ""}`}
                  />
                </button>

                {openDropdownId === exercise._id && (
                  <div className="absolute right-0 left-0 mt-2 bg-neutral-900 border border-amber-500/20 rounded-xl p-1.5 shadow-2xl z-30 space-y-1 font-danaMed">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTipsId(
                          activeTipsId === exercise._id ? null : exercise._id
                        );
                        setOpenDropdownId(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${isExpanded
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-neutral-300 hover:bg-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 max-sm:text-xs! text-amber-400" />
                        <span>نکات مربی</span>
                      </div>
                      {isExpanded && (
                        <span className="text-xs max-sm:text-xs! text-amber-400 font-bold">
                          نمایش داده شد
                        </span>
                      )}
                    </button>

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuestionsId(
                            activeQuestionsId === exercise._id
                              ? null
                              : exercise._id
                          );
                          setOpenDropdownId(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${activeQuestionsId === exercise._id
                            ? "bg-amber-500/20 text-amber-300 font-bold"
                            : "text-neutral-300 hover:bg-white/5"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          <span>ثبت سوالات و ارزیابی</span>
                        </div>
                        {activeQuestionsId === exercise._id && (
                          <span className="text-xs text-amber-400 font-bold">
                            نمایش داده شد
                          </span>
                        )}
                      </button>
                    )}

                    {(exercise.videoId?.url || exercise.videoId2?.url) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlayingVideo(
                            playingVideo === exercise._id ? null : exercise._id
                          );
                          setOpenDropdownId(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
                          playingVideo === exercise._id
                            ? "bg-amber-500/20 text-amber-300 font-bold"
                            : "text-neutral-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-amber-400 fill-current" />
                          <span>
                            {exercise.videoId?.url && exercise.videoId2?.url
                              ? "مشاهده ویدیوهای آموزش"
                              : "مشاهده ویدیو آموزش"}
                          </span>
                        </div>
                        {playingVideo === exercise._id && (
                          <span className="text-xs text-amber-400 font-bold">
                            نمایش داده شد
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {playingVideo === exercise._id &&
              (exercise.videoId?.url || exercise.videoId2?.url) && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  <div
                    className={
                      exercise.videoId?.url && exercise.videoId2?.url
                        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                        : "w-full"
                    }
                  >
                    {exercise.videoId?.url && (
                      <div className="space-y-2">
                        {exercise.videoId2?.url && (
                          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-danaMed">
                            <Play className="w-3 h-3 fill-current" />
                            <span>
                              {exercise.videoId.title || "زاویه اول"}
                            </span>
                          </div>
                        )}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-amber-500/20 shadow-lg">
                          <video
                            src={exercise.videoId.url}
                            controls
                            poster={exercise.videoId.thumbnailUrl || ""}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {exercise.videoId2?.url && (
                      <div className="space-y-2">
                        {exercise.videoId?.url && (
                          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-danaMed">
                            <Play className="w-3 h-3 fill-current" />
                            <span>
                              {exercise.videoId2.title || "زاویه دوم"}
                            </span>
                          </div>
                        )}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-amber-500/20 shadow-lg">
                          <video
                            src={exercise.videoId2.url}
                            controls
                            poster={exercise.videoId2.thumbnailUrl || ""}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4 text-xs md:text-sm text-neutral-300 bg-white/[0.01]">
                <div className="flex gap-2.5 items-start p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-neutral-200 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-300 mb-1">
                      توصیه مربی برای اجرای صحیح:
                    </span>
                    {coachTips}
                  </div>
                </div>
              </div>
            )}

            {isCompleted && activeQuestionsId === exercise._id && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4">
                <ExerciseFeedbackForm
                  userId={userId || ""}
                  dayId={dayId || ""}
                  exerciseId={exercise._id}
                  onClose={() => setActiveQuestionsId(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
