"use client";

import { memo, useCallback } from "react";
import { Video as VideoIcon } from "lucide-react";
import type { ProgramExerciseCardProps, VideoInfo } from "@/types/workout";

function ProgramExerciseCard({
  exercise,
  index,
  videos,
  setWatchingVideo,
}: ProgramExerciseCardProps) {
  const handleWatchVideoById = useCallback(
    (vidRef: unknown) => {
      if (!vidRef) return;
      if (typeof vidRef === "object" && vidRef !== null && "_id" in vidRef) {
        setWatchingVideo(vidRef as VideoInfo);
      } else if (typeof vidRef === "string") {
        const found = videos.find((v) => v._id === vidRef);
        if (found) setWatchingVideo(found);
      }
    },
    [videos, setWatchingVideo]
  );

  return (
    <div className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-xl flex flex-col justify-between gap-3 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 ss02">
            {index + 1}
          </div>
          <div className="text-sm font-bold text-white">{exercise.name}</div>
        </div>

        <div className="flex items-center gap-1.5">
          {exercise.videoId && (
            <button
              type="button"
              onClick={() => handleWatchVideoById(exercise.videoId)}
              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer"
              title="مشاهده ویدیو ۱"
            >
              <VideoIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {exercise.videoId2 && (
            <button
              type="button"
              onClick={() => handleWatchVideoById(exercise.videoId2)}
              className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors cursor-pointer"
              title="مشاهده ویدیو ۲"
            >
              <VideoIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {exercise.description && (
        <p className="text-xs text-white/60 leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg px-2.5 py-1.5 line-clamp-2">
          {exercise.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-[11px] text-white/70 ss02">
        <div className="bg-white/5 rounded-lg py-1 px-1.5">
          <span className="text-white/40 block text-[9px]">ست / تکرار</span>
          <span className="font-semibold text-white">
            {exercise.sets} × {exercise.reps || "10"}
          </span>
        </div>
        <div className="bg-white/5 rounded-lg py-1 px-1.5">
          <span className="text-white/40 block text-[9px]">وزنه</span>
          <span className="font-semibold text-amber-400">
            {exercise.weight
              ? typeof exercise.weight === "number" || !isNaN(Number(exercise.weight))
                ? `${exercise.weight} kg`
                : exercise.weight
              : "آزاد"}
          </span>
        </div>
        <div className="bg-white/5 rounded-lg py-1 px-1.5">
          <span className="text-white/40 block text-[9px]">استراحت</span>
          <span className="font-semibold text-white">
            {exercise.restSec || 60} ثانیه
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProgramExerciseCard);
