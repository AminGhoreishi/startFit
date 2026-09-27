"use client";

import useSWR from "swr";
import FAQ from "@/features/home/faq/FAQ";
import Breadcrumb from "./Breadcrumb";
import PackageFeatures from "./PackageFeatures";
import PriceCard from "./PriceCard";
import TrustBadges from "./TrustBadges";
import { Check, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { iconMap } from "@/utils/icons";
import PackageDetailsSkeleton from "./PackageDetailsSkeleton";
import type { PackageDetailsProps } from "@/types/package";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در دریافت اطلاعات پکیج");
  }
  return res.json();
};

export default function PackageDetails({
  package: initialPackage,
  features,
}: PackageDetailsProps) {
  const { data: fetchedPackage } = useSWR(
    `/api/packages/${initialPackage.slug}`,
    fetcher,
    {
      fallbackData: initialPackage,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const packageData = fetchedPackage || initialPackage;
  if (!packageData) {
    return <PackageDetailsSkeleton />;
  }
  const PackageIcon = iconMap[packageData.icon] || Sparkles;

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-hidden font-danaMed"
      dir="rtl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      <Breadcrumb packageName={packageData.name} />

      <section className="py-8 sm:py-12 lg:py-20 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-6 sm:space-y-10">
              {packageData.isPopular && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{packageData.tagline}</span>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6 ss02">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  <div
                    className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 rounded-2xl flex items-center justify-center border border-amber-500/30 transform hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(234,179,8,0.1)] shrink-0"
                  >
                    <PackageIcon className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-2 sm:mb-3 font-morabbaReg leading-tight">
                      {packageData.name}
                    </h1>
                    <div className="flex  items-center gap-2 bg-neutral-900/80 py-1 px-3 rounded-full border border-amber-500/20 w-fit">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(packageData.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-amber-400 text-xs font-bold mr-1">
                        {packageData.rating || 5}
                      </span>
                      <span className="text-neutral-600 text-xs">•</span>
                      <span className="text-neutral-400 text-xs font-medium">
                        {(packageData.reviewCount || 0).toLocaleString("fa-IR")}{" "}
                        نظر
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed max-w-3xl">
                  {packageData.description}
                </p>
              </div>

              {packageData.highlights && packageData.highlights.length > 0 && (
                <div className="bg-neutral-900/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-5 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl" />
                  <h3 className="text-sm sm:text-xl font-bold text-white mb-4 sm:mb-6 font-morabbaReg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span>نکات کلیدی پکیج</span>
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    {packageData.highlights.map(
                      (highlight: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2.5 sm:gap-3 text-neutral-300 group"
                        >
                          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium">
                            {highlight}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-neutral-900/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-5 sm:p-8 shadow-[0_0_30px_rgba(234,179,8,0.1)] space-y-4 sm:space-y-6 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

                <PriceCard
                  price={packageData.price}
                  originalPrice={packageData.originalPrice}
                  discountPercent={packageData.discountPercent}
                  hasDiscount={packageData.hasDiscount}
                />

                <div className="relative z-10 pt-2">
                  <Link
                    href={`/order/${packageData.slug}`}
                    className="block w-full text-center bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 py-3.5 sm:py-4 rounded-2xl transition-all duration-300 font-bold text-sm sm:text-lg shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] hover:scale-[1.02] transform active:scale-[0.98]"
                  >
                    خرید پکیج
                  </Link>
                </div>

                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PackageFeatures features={features} />

      <FAQ />
    </div>
  );
}
