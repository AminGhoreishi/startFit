"use client";

import { memo } from "react";
import type { PackageCardProps } from "@/types/workout";

function PackageCard({ pkg, isSelected, onSelect }: PackageCardProps) {
  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
        isSelected
          ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm">{pkg.name}</span>
        <span className="text-[10px] text-white/50 opacity-80 ss02">
          {pkg.slug}
        </span>
      </div>
      <div className="text-xs text-white/60 line-clamp-1">
        برای ویرایش برنامه‌های تمرینی کلیک کنید.
      </div>
    </div>
  );
}

function arePackageCardPropsEqual(
  prevProps: PackageCardProps,
  nextProps: PackageCardProps
) {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.pkg._id === nextProps.pkg._id &&
    prevProps.pkg.name === nextProps.pkg.name &&
    prevProps.pkg.slug === nextProps.pkg.slug
  );
}

export default memo(PackageCard, arePackageCardPropsEqual);
