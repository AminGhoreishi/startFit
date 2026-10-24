"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import type { AddWorkoutDropdownProps } from "@/types/workout";

function AddWorkoutDropdown({ onAddNewDay }: AddWorkoutDropdownProps) {
  return (
    <button
      type="button"
      onClick={onAddNewDay}
      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>برنامه جدید</span>
    </button>
  );
}

export default memo(AddWorkoutDropdown);
