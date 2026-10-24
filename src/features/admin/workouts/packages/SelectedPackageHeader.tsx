"use client";

import { memo } from "react";
import type { SelectedPackageHeaderProps } from "@/types/workout";
import UserSearchInput from "./UserSearchInput";
import DeletePlanButton from "./DeletePlanButton";

function SelectedPackageHeader({
  selectedPackage,
  subscriptionCount,
  setSelectedUser,
  workoutPlan,
  setSelectedProgramDay,
  mutatePlan,
  mutateProgram,
}: SelectedPackageHeaderProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-500/10 to-yellow-600/5">
      <div>
        <div className="text-xs text-amber-400 font-bold mb-1 flex items-center gap-2">
          <span>پکیج انتخاب شده</span>
          <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-semibold ss02">
            {subscriptionCount} کاربر دارای اشتراک
          </span>
        </div>
        <h3 className="text-xl font-bold text-white font-morabbaReg">
          {selectedPackage.name}
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <UserSearchInput setSelectedUser={setSelectedUser} />
        {workoutPlan && (
          <DeletePlanButton
            planId={workoutPlan._id}
            setSelectedProgramDay={setSelectedProgramDay}
            mutatePlan={mutatePlan}
            mutateProgram={mutateProgram}
          />
        )}
      </div>
    </div>
  );
}

export default memo(SelectedPackageHeader);
