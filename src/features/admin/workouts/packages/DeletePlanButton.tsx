"use client";

import { memo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { showAlert, showConfirm } from "@/utils/alert";
import type { DeletePlanButtonProps } from "@/types/workout";

function DeletePlanButton({
  planId,
  setSelectedProgramDay,
  mutatePlan,
  mutateProgram,
}: DeletePlanButtonProps) {
  const handleDeletePlan = useCallback(async () => {
    if (!planId) return;
    const confirmed = await showConfirm({
      title: "حذف برنامه تمرینی",
      text: "آیا از حذف کامل این برنامه تمرینی به همراه تمام روزها و حرکات آن اطمینان دارید؟",
      confirmButtonText: "بله، حذف شود",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/subscription/workout-plans?id=${planId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setSelectedProgramDay(null);
        mutatePlan();
        mutateProgram();
        showAlert({
          title: "موفقیت",
          text: "برنامه تمرینی با موفقیت حذف شد",
          icon: "success",
        });
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در حذف برنامه",
        icon: "error",
      });
    }
  }, [planId, setSelectedProgramDay, mutatePlan, mutateProgram]);

  return (
    <button
      type="button"
      onClick={handleDeletePlan}
      className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0"
    >
      <Trash2 className="w-4 h-4" />
      <span>حذف کل برنامه تمرینی</span>
    </button>
  );
}

export default memo(DeletePlanButton);
