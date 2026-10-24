"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { EditPlanInfoFormProps } from "@/types/workout";
import { showAlert } from "@/utils/alert";

export default function EditPlanInfoForm({
  workoutPlan,
  onSuccess,
  onCancel,
}: EditPlanInfoFormProps) {
  const [planForm, setPlanForm] = useState({
    title: workoutPlan.title,
    description: workoutPlan.description || "",
    weeklyAdviceTitle: workoutPlan.weeklyAdvice?.title || "توصیه عمومی هفته",
    weeklyAdviceDescription: workoutPlan.weeklyAdvice?.description || "",
    weeklyAdviceTips: workoutPlan.weeklyAdvice?.tips?.join("\n") || "",
  });

  const handleUpdatePlan = async () => {
    const tips = planForm.weeklyAdviceTips
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/subscription/workout-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workoutPlan._id,
          title: planForm.title,
          description: planForm.description,
          weeklyAdvice: {
            title: planForm.weeklyAdviceTitle.trim() || "توصیه عمومی هفته",
            description: planForm.weeklyAdviceDescription.trim(),
            tips,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        onSuccess(data.plan);
        showAlert({
          title: "موفقیت",
          text: "برنامه تمرینی با موفقیت بروزرسانی شد",
          icon: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({
          title: "خطا",
          text: err.message || "خطا در بروزرسانی برنامه",
          icon: "error",
        });
      }
    } catch {
      showAlert({
        title: "خطا",
        text: "خطا در بروزرسانی برنامه تمرینی",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-4 font-danaMed" dir="rtl">
      <div>
        <label className="block text-white/70 text-xs mb-2">
          عنوان برنامه
        </label>
        <input
          type="text"
          value={planForm.title}
          onChange={(e) =>
            setPlanForm({
              ...planForm,
              title: e.target.value,
            })
          }
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
          required
        />
      </div>

      <div>
        <label className="block text-white/70 text-xs mb-2">
          توضیحات کلی برنامه
        </label>
        <textarea
          value={planForm.description}
          onChange={(e) =>
            setPlanForm({
              ...planForm,
              description: e.target.value,
            })
          }
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 resize-none h-20"
        />
      </div>

      <div className="pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <Zap className="w-4 h-4" />
          <span>تنظیمات توصیه عمومی هفته</span>
        </div>

        <div>
          <label className="block text-white/70 text-xs mb-2">
            عنوان توصیه
          </label>
          <input
            type="text"
            value={planForm.weeklyAdviceTitle}
            onChange={(e) =>
              setPlanForm({
                ...planForm,
                weeklyAdviceTitle: e.target.value,
              })
            }
            placeholder="توصیه عمومی هفته"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-white/70 text-xs mb-2">
            متن و شرح توصیه هفته
          </label>
          <textarea
            value={planForm.weeklyAdviceDescription}
            onChange={(e) =>
              setPlanForm({
                ...planForm,
                weeklyAdviceDescription: e.target.value,
              })
            }
            placeholder="مثال: تلاش کنید تا به اصل اضافه بار تدریجی پایبند باشید..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 resize-none h-24"
          />
        </div>

        <div>
          <label className="block text-white/70 text-xs mb-2">
            نکات کلیدی توصیه (هر نکته در یک سطر جدید)
          </label>
          <textarea
            value={planForm.weeklyAdviceTips}
            onChange={(e) =>
              setPlanForm({
                ...planForm,
                weeklyAdviceTips: e.target.value,
              })
            }
            placeholder="آب مصرفی حین تمرین: حداقل ۱ لیتر&#10;تایم استراحت بین ست‌ها رعایت شود&#10;تغذیه و پروتئین کافی بلافاصله بعد از تمرین"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 resize-none h-24"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={handleUpdatePlan}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs transition-colors cursor-pointer"
        >
          ذخیره تغییرات
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white/10 hover:bg-white/15 text-white px-5 py-2 rounded-lg text-xs transition-colors cursor-pointer"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
