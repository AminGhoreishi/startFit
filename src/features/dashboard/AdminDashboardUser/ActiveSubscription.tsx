import Link from "next/link";
import { ChevronLeft, Award, AlertCircle, Zap } from "lucide-react";
import type { ActiveSubscriptionProps } from "@/types/user-dashboard";

export default function ActiveSubscription({
  subscription,
}: ActiveSubscriptionProps) {
  const progressPercent = subscription
    ? Math.round(
        ((subscription.totalDays - subscription.daysRemaining) /
          subscription.totalDays) *
          100,
      )
    : 0;

  return (
    <div className="lg:col-span-1 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-lg border border-amber-500/15 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white font-morabbaReg">اشتراک فعال</h3>
        {subscription && (
          <Link
            href="/dashboard/subscription"
            className="text-amber-400 text-xs hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            جزئیات <ChevronLeft size={14} />
          </Link>
        )}
      </div>

      {subscription ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 shadow-md">
              <Award size={22} className="text-neutral-950" />
            </div>
            <div>
              <p className="font-semibold text-white">
                {subscription.packageName}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                فعال
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
              <span>پیشرفت اشتراک</span>
              <span>{subscription.daysRemaining} روز مانده</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all bg-gradient-to-r from-amber-500 to-yellow-500"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">تاریخ پایان</span>
              <span className="text-white">{subscription.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">پرداخت بعدی</span>
              <span className="text-white">
                {subscription.nextPayment} تومان
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-white/40 text-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-white/20" />
          <p>اشتراک فعالی برای شما ثبت نشده است</p>
        </div>
      )}

      <Link
        href="/packages"
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-all"
      >
        <Zap size={14} />
        ارتقا یا خرید پکیج
      </Link>
    </div>
  );
}
