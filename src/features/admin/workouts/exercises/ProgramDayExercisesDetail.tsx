"use client";

import { memo } from "react";
import { Edit } from "lucide-react";
import type { ProgramDayExercisesDetailProps } from "@/types/workout";
import ProgramExerciseCard from "./ProgramExerciseCard";

function ProgramDayExercisesDetail({
  activeProgramDay,
  onEditDay,
  videos,
  setWatchingVideo,
}: ProgramDayExercisesDetailProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold mb-1">
            حرکات ورزشی روز تمرینی
          </div>
          <h3 className="text-xl font-bold text-white font-morabbaReg flex items-center gap-2">
            <span>{activeProgramDay.day}</span>
            {activeProgramDay.muscleGroup && (
              <span className="text-sm text-white/50 font-normal">
                - عضله هدف: {activeProgramDay.muscleGroup}
              </span>
            )}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onEditDay(activeProgramDay)}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>ویرایش این روز</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-white/60 font-semibold flex items-center justify-between">
          <span>لیست حرکات ثبت‌شده</span>
          <span className="text-amber-400 ss02">
            {activeProgramDay.exercises?.length || 0} حرکت
          </span>
        </div>

        {!activeProgramDay.exercises || activeProgramDay.exercises.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
            هیچ ورزشی برای این روز ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProgramDay.exercises.map((exercise, idx) => (
              <ProgramExerciseCard
                key={`${exercise.name}-${idx}`}
                exercise={exercise}
                index={idx}
                videos={videos}
                setWatchingVideo={setWatchingVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProgramDayExercisesDetail);
