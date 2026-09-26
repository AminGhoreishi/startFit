"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { BiDumbbell, BiUser, BiPhone } from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { mutate } from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import TurnstileWidget, {
  TurnstileWidgetHandle,
} from "@/components/common/TurnstileWidget";
import type {
  LoginFormData,
  RegisterFormData,
  AuthApiResponse,
} from "@/types/auth";
import { toEnglishDigits } from "@/utils/numbers";

function LoginFormContent() {
  const [isRegister, setIsRegister] = useState(false);
  const [serverError, setServerError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorParam = searchParams.get("error");
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";

  useEffect(() => {
    if (errorParam) {
      setServerError("خطایی در احراز هویت رخ داده است. لطفاً مجدداً تلاش کنید.");
    }
  }, [errorParam]);

  const loginForm = useForm<LoginFormData>({
    mode: "onTouched",
  });
  const registerForm = useForm<RegisterFormData>({
    mode: "onTouched",
  });

  const handleTabChange = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setServerError("");
    setCaptchaToken("");
    turnstileRef.current?.reset();
    loginForm.reset();
    registerForm.reset();
  };

  const onLogin = async (data: LoginFormData) => {
    if (!captchaToken) {
      setServerError("لطفاً تست اعتبارسنجی امنیتی را تیک بزنید");
      return;
    }

    setServerError("");
    const cleanPhone = toEnglishDigits(data.phone);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          type: "login",
          captchaToken,
        }),
      });

      const resData: AuthApiResponse = await res.json().catch(() => ({
        message: "خطا در دریافت پاسخ از سرور",
      }));

      if (!res.ok) {
        setServerError(resData.message || "خطایی رخ داده است");
        turnstileRef.current?.reset();
        setCaptchaToken("");
        return;
      }

      router.push(
        `/otp?phone=${encodeURIComponent(cleanPhone)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    } catch {
      setServerError("خطا در ارتباط با سرور، لطفاً اتصال اینترنت خود را بررسی کنید");
      turnstileRef.current?.reset();
      setCaptchaToken("");
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    if (!captchaToken) {
      setServerError("لطفاً تست اعتبارسنجی امنیتی را تیک بزنید");
      return;
    }

    setServerError("");
    const cleanPhone = toEnglishDigits(data.phone);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          phone: cleanPhone,
          password: data.password,
          confirmPassword: data.confirmPassword,
          captchaToken,
        }),
      });

      const resData: AuthApiResponse = await res.json().catch(() => ({
        message: "خطا در دریافت پاسخ از سرور",
      }));

      if (!res.ok) {
        setServerError(resData.message || "خطایی رخ داده است");
        turnstileRef.current?.reset();
        setCaptchaToken("");
        return;
      }

      const signInRes = await signIn("credentials", {
        phone: cleanPhone,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setServerError("ثبت‌نام انجام شد، لطفاً از بخش ورود وارد شوید");
        setIsRegister(false);
        turnstileRef.current?.reset();
        setCaptchaToken("");
        return;
      }

      await mutate("user-session");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError("خطا در ارتباط با سرور، لطفاً دوباره تلاش کنید");
      turnstileRef.current?.reset();
      setCaptchaToken("");
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full bg-zinc-900/60 border ${
      hasError
        ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
        : "border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
    } rounded-xl pl-12 pr-4 py-3 text-xs sm:text-sm text-amber-100 placeholder:text-zinc-500 placeholder:text-xs sm:placeholder:text-sm focus:outline-none transition-all`;

  return (
    <div
      className="min-h-screen bg-black font-danaMed flex items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <BiDumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-110" />
            <span className="font-bold text-2xl sm:text-3xl font-morabbaReg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              استارفیت
            </span>
          </Link>
          <p className="text-amber-100/60 text-xs sm:text-sm">
            به جامعه فیتنس ما بپیوندید
          </p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.05)] rounded-2xl p-6 sm:p-8">
          <div className="flex gap-2 mb-8 bg-zinc-900/90 p-1.5 rounded-xl border border-amber-500/10">
            <button
              type="button"
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                !isRegister
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              ورود
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isRegister
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              ثبت نام
            </button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm text-center">
              {serverError}
            </div>
          )}

          {!isRegister && (
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-5"
            >
              <div>
                <label className="block text-amber-100/90 mb-2 text-xs sm:text-sm font-medium">
                  شماره تلفن
                </label>
                <div className="relative">
                  <BiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                  <input
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className={inputClass(!!loginForm.formState.errors.phone)}
                    {...loginForm.register("phone", {
                      required: "شماره تلفن الزامی است",
                      validate: (val) => {
                        const clean = toEnglishDigits(val);
                        return (
                          /^09\d{9}$/.test(clean) ||
                          "شماره تلفن معتبر نیست (مثال: 09123456789)"
                        );
                      },
                    })}
                  />
                </div>
                {loginForm.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {loginForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <TurnstileWidget
                key="login-turnstile"
                ref={turnstileRef}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken("")}
                theme="dark"
              />

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 cursor-pointer"
              >
                {loginForm.formState.isSubmitting
                  ? "در حال ارسال کد..."
                  : "ورود به حساب"}
              </button>
            </form>
          )}

          {isRegister && (
            <form
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="space-y-5"
            >
              <div>
                <label className="block text-amber-100/90 mb-2 text-xs sm:text-sm font-medium">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                  <input
                    type="text"
                    placeholder="نام خانوادگی خود را وارد کنید"
                    className={inputClass(
                      !!registerForm.formState.errors.username,
                    )}
                    {...registerForm.register("username", {
                      required: "نام خانوادگی الزامی است",
                      minLength: {
                        value: 2,
                        message: "نام خانوادگی حداقل ۲ کاراکتر باشد",
                      },
                    })}
                  />
                </div>
                {registerForm.formState.errors.username && (
                  <p className="text-red-400 text-xs mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-amber-100/90 mb-2 text-xs sm:text-sm font-medium">
                  شماره تلفن
                </label>
                <div className="relative">
                  <BiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                  <input
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className={inputClass(
                      !!registerForm.formState.errors.phone,
                    )}
                    {...registerForm.register("phone", {
                      required: "شماره تلفن الزامی است",
                      validate: (val) => {
                        const clean = toEnglishDigits(val);
                        return (
                          /^09\d{9}$/.test(clean) ||
                          "شماره تلفن معتبر نیست (مثال: 09123456789)"
                        );
                      },
                    })}
                  />
                </div>
                {registerForm.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-amber-100/90 mb-2 text-xs sm:text-sm font-medium">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="رمز عبور خود را وارد کنید"
                    className={inputClass(
                      !!registerForm.formState.errors.password,
                    )}
                    {...registerForm.register("password", {
                      required: "رمز عبور الزامی است",
                      minLength: {
                        value: 6,
                        message: "رمز عبور حداقل ۶ کاراکتر باشد",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {showRegisterPassword ? (
                      <AiOutlineEyeInvisible className="w-5 h-5" />
                    ) : (
                      <AiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-amber-100/90 mb-2 text-xs sm:text-sm font-medium">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    className={inputClass(
                      !!registerForm.formState.errors.confirmPassword,
                    )}
                    {...registerForm.register("confirmPassword", {
                      required: "تکرار رمز عبور الزامی است",
                      validate: (val) =>
                        val === registerForm.getValues("password") ||
                        "رمز عبور و تکرار آن یکسان نیستند",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterConfirmPassword(
                        !showRegisterConfirmPassword,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {showRegisterConfirmPassword ? (
                      <AiOutlineEyeInvisible className="w-5 h-5" />
                    ) : (
                      <AiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <TurnstileWidget
                key="register-turnstile"
                ref={turnstileRef}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken("")}
                theme="dark"
              />

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 cursor-pointer"
              >
                {registerForm.formState.isSubmitting
                  ? "در حال ثبت نام..."
                  : "ایجاد حساب کاربری"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-zinc-400 text-xs sm:text-sm">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-amber-400 font-danaMed text-xs sm:text-sm">
          بارگذاری...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
