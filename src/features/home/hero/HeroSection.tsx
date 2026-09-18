import Image from "next/image";
import Link from "next/link";
import { BsArrowLeft, BsFire, BsShieldCheck, BsLightningChargeFill, BsCheck2Circle } from "react-icons/bs";

export default function HeroSection() {
  return (
    <div className="container mx-auto relative overflow-hidden">
      <div className="absolute -top-24 right-1/4 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-10 w-[350px] h-[350px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

      <section className="relative z-10 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-10 sm:pb-12 md:pb-14 lg:pb-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-right">
            <div className="flex sm:inline-flex items-center justify-center max-sm:mx-auto w-fit gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-danaMed backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span>باشگاه آنلاین و تخصصی استارفیت</span>
            </div>

            <h1 className="text-3xl max-sm:text-center sm:text-5xl lg:text-6xl font-morabbaReg font-extrabold leading-[1.25] text-white tracking-tight">
              تمرین کن. پیشرفتت را ببین.{" "}
              <span className="block mt-2 bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                بهتر و قوی‌تر شو.
              </span>
            </h1>

            <p className="text-sm sm:text-xl max-sm:text-center text-neutral-300 font-danaMed leading-relaxed max-w-2xl">
              برنامه‌های تخصصی تمرین و تغذیه متناسب با اهداف شما، همراه با پشتیبانی مستقیم و پایش پیشرفت.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-danaMed pt-2">
              <Link
                href="/packages"
                prefetch={false}
                className="bg-gradient-to-r max-sm:text-sm from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.35)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-base"
              >
                <span>مشاهده پکیج‌ها</span>
                <BsArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                prefetch={false}
                className="bg-neutral-900/80 max-sm:text-sm hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/40 text-neutral-200 hover:text-white font-semibold px-7 py-4 rounded-2xl transition-all backdrop-blur-md flex items-center justify-center gap-2 text-base"
              >
                <span>درباره استارفیت</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-neutral-800/80 text-xs sm:text-sm font-danaMed text-neutral-300">
              <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800/60 p-3 rounded-xl backdrop-blur-sm">
                <BsCheck2Circle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>برنامه ۱۰۰٪ اختصاصی</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800/60 p-3 rounded-xl backdrop-blur-sm">
                <BsLightningChargeFill className="w-5 h-5 text-amber-400 shrink-0" />
                <span>تمرین در خانه یا باشگاه</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800/60 p-3 rounded-xl backdrop-blur-sm">
                <BsShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>پشتیبانی و آنالیز مداوم</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative w-full max-w-md lg:max-w-none mx-auto aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              <Image
                src="/images/hero/IMG_20260817_194425_183.webp"
                alt="تمرینات اختصاصی استارفیت"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 450px, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90 pointer-events-none" />

              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-neutral-950/80 backdrop-blur-xl border border-amber-500/30 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-neutral-950 shrink-0 shadow-md">
                  <BsFire className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 font-danaMed">هدف تمرینی</p>
                  <p className="text-sm font-bold text-white font-danaMed">بر اساس شرایط و اهداف بلند مدت شما</p>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-neutral-950/80 backdrop-blur-xl border border-neutral-700/60 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <BsShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 font-danaMed">رضایت ورزشکاران</p>
                  <p className="text-sm font-bold text-amber-400 font-danaMed">+۱,۰۰۰ عضو فعال</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
