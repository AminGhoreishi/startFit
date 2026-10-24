"use client";

import { Info } from "lucide-react";
import { showAlert } from "@/utils/alert";
import type { CreatePlanFormProps } from "@/types/workout";

export default function CreatePlanForm({
  selectedPackage,
  selectedUser,
  onSuccess,
}: CreatePlanFormProps) {
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/subscription/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage._id,
          userId: selectedUser?._id || null,
          title: selectedUser
            ? `برنامه تمرینی ${selectedPackage.name} - ${selectedUser.fullName || selectedUser.username}`
            : `برنامه تمرینی ${selectedPackage.name}`,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        onSuccess(data.plan);
        showAlert({
          title: "موفقیت",
          text: "برنامه تمرینی با موفقیت ایجاد شد",
          icon: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({
          title: "خطا",
          text: err.message || "خطا در ایجاد برنامه",
          icon: "error",
        });
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در ایجاد برنامه تمرینی",
        icon: "error",
      });
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center font-danaMed" dir="rtl">
      <Info className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
      <h4 className="text-white font-bold text-lg mb-2 font-morabbaReg">
        برنامه تمرینی یافت نشد
      </h4>
      {
        !selectedUser ?  <p className="text-white/60 text-sm mb-6">
    کاربر گرامی لطفا ابتدا کاربر مورد نظر را از سرچ بار پیدا کنید
      </p> : <p className="text-white/60 text-sm mb-6">
         برنامه تمرینی برای پکیج {selectedPackage.name} و کاربر {selectedUser.fullName} تعریف نشده است.
      </p>
      }
     
      <form onSubmit={handleCreatePlan} className="max-w-xl mx-auto text-right">
        {
           !selectedUser ? null :    <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-neutral-950 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all text-sm cursor-pointer"
        >
          ایجاد برنامه تمرینی جدید
        </button>
        }
     
      </form>
    </div>
  );
}
