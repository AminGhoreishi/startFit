import { Activity, User } from "lucide-react";
import type { PhysicalTabProps } from "@/types/fitness-profile";

export default function PhysicalTab({
  register,
  errors,
  watchedAge,
  watchedHeight,
  watchedWeight,
  watchedGender,
  setValue,
  bmi,
  bmiCategory,
}: PhysicalTabProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <input type="hidden" {...register("gender")} />

      <div>
        <label className="block text-neutral-300 text-xs mb-2 font-medium">
          جنسیت
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setValue("gender", "male")}
            className={`py-2.5 px-4 rounded-xl border text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm ${
              watchedGender === "male"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10"
                : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>آقا</span>
          </button>
          <button
            type="button"
            onClick={() => setValue("gender", "female")}
            className={`py-2.5 px-4 rounded-xl border text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm ${
              watchedGender === "female"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10"
                : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>خانم</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-neutral-300 text-xs mb-2 font-medium">
            سن (سال)
          </label>
          <input
            type="text"
            {...register("ageYears", {
              required: "وارد کردن سن الزامی است",
              pattern: {
                value: /^([1-9][0-9]?|100)$/,
                message: "سن باید عدد و حداکثر ۱۰۰ سال باشد",
              },
            })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-left ss02"
          />
          {errors.ageYears && (
            <p className="text-amber-400 text-[10px] mt-1 font-semibold">
              {errors.ageYears.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-neutral-300 text-xs mb-2 font-medium">
            قد (سانتی‌متر)
          </label>
          <input
            type="text"
            {...register("heightCm", {
              required: "وارد کردن قد الزامی است",
              pattern: {
                value: /^([1-9][0-9]?|[1-2][0-9]{2})$/,
                message: "قد باید عدد و زیر ۳۰۰ سانتی‌متر باشد",
              },
            })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-left ss02"
          />
          {errors.heightCm && (
            <p className="text-amber-400 text-[10px] mt-1 font-semibold">
              {errors.heightCm.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-neutral-300 text-xs mb-2 font-medium">
            وزن (کیلوگرم)
          </label>
          <input
            type="text"
            {...register("weightKg", {
              required: "وارد کردن وزن الزامی است",
              pattern: {
                value: /^([1-9][0-9]?|[1-2][0-9]{2})$/,
                message: "وزن باید عدد و زیر ۳۰۰ کیلوگرم باشد",
              },
            })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-left ss02"
          />
          {errors.weightKg && (
            <p className="text-amber-400 text-[10px] mt-1 font-semibold">
              {errors.weightKg.message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-center">
        <Activity className="w-8 h-8 text-amber-400 flex-shrink-0" />
        <div className="text-xs leading-relaxed text-neutral-300 ss02">
          <span className="font-bold text-amber-300 block mb-0.5">
            محاسبه دقیق BMI
          </span>
          {bmi > 0 ? (
            <>
              شاخص توده بدنی شما بر اساس وزن {watchedWeight} کیلوگرم و قد{" "}
              {watchedHeight} سانتی‌متر برابر با{" "}
              <strong className="text-white ss02">{bmi}</strong> است که در
              محدوده{" "}
              <strong className={bmiCategory.color}>
                {bmiCategory.label}
              </strong>{" "}
              قرار دارد.
            </>
          ) : (
            <>
              لطفاً قد (بالای ۱۰۰ سانتی‌متر) و وزن (بالای ۳۰ کیلوگرم) خود را به
              درستی وارد کنید تا شاخص BMI محاسبه شود.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
