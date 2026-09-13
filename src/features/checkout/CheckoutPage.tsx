"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import type {
  CheckoutPageClientProps,
  VerifyPaymentClientResponse,
} from "@/types/checkout";
import CheckoutPendingVerification from "./CheckoutPendingVerification";
import CheckoutCardSection from "./CheckoutCardSection";
import { formatNumber } from "@/utils/numbers";

export default function CheckoutPage({ order }: CheckoutPageClientProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentRefInput, setPaymentRefInput] = useState<string>(
    order.paymentRef || ""
  );
  const [submittedRef, setSubmittedRef] = useState<string | null>(
    order.paymentRef || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cardNumber = "6219861843440891";
  const formattedCardNumber = "6219  8618  4344  0891";

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const ref = paymentRefInput.trim();
    if (!ref) {
      setErrorMessage("لطفاً کد پیگیری یا شماره ارجاع واریز را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          paymentRef: ref,
        }),
      });

      const result: VerifyPaymentClientResponse = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(result.message || "خطا در ثبت و تایید کد پیگیری");
        setIsSubmitting(false);
        return;
      }

      setSubmittedRef(ref);
      setIsSubmitting(false);
    } catch {
      setErrorMessage("خطای غیرمنتظره در ثبت واریزی. لطفاً دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  const isPendingVerification = Boolean(submittedRef);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-950 text-amber-50 py-8 sm:py-12 px-3 sm:px-4 relative overflow-hidden font-danaMed"
      dir="rtl"
    >
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-amber-500/20">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به پکیج‌ها</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>پرداخت امن استار فیت</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent font-morabbaReg">
            {isPendingVerification
              ? "در انتظار تایید پرداخت"
              : "صفحه پرداخت کارت به کارت"}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {isPendingVerification
              ? "شناسه واریز شما ثبت شده و توسط پشتیبانی در حال بررسی است."
              : "جهت فعال‌سازی اشتراک، مبلغ مورد نظر را واریز کرده و کد پیگیری را ثبت کنید."}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-xs sm:text-sm text-center">
            {errorMessage}
          </div>
        )}

        {isPendingVerification ? (
          <CheckoutPendingVerification
            order={order}
            submittedRef={submittedRef || ""}
            formatNumber={formatNumber}
          />
        ) : (
          <CheckoutCardSection
            order={order}
            formattedCardNumber={formattedCardNumber}
            copied={copied}
            onCopyCard={handleCopyCard}
            paymentRefInput={paymentRefInput}
            onPaymentRefChange={setPaymentRefInput}
            onSubmit={handleConfirmPayment}
            isSubmitting={isSubmitting}
            formatNumber={formatNumber}
          />
        )}
      </div>
    </div>
  );
}
