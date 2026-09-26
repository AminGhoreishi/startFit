import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Ban from "@/models/Ban";
import { toEnglishDigits } from "@/utils/numbers";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { username, phone, password, confirmPassword, captchaToken } = body;

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const isCaptchaValid = await verifyTurnstileToken(captchaToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { message: "تأیید امنیتی کپچا ناموفق بود. لطفاً دوباره امتحان کنید" },
        { status: 400 },
      );
    }

    if (!username || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "همه فیلدها الزامی هستند" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "رمز عبور و تکرار آن یکسان نیستند" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "رمز عبور حداقل باید ۶ کاراکتر باشد" },
        { status: 400 },
      );
    }

    const cleanPhone = toEnglishDigits(String(phone));

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { message: "فرمت شماره تلفن معتبر نیست (مثال: 09123456789)" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: cleanPhone.replace(/^0/, "") },
        { phone: `0${cleanPhone}` },
      ],
    });

    if (existingUser) {
      const isBanned =
        existingUser.status === "blocked" ||
        (await Ban.findOne({ userId: existingUser._id, status: "active" }));

      if (isBanned) {
        return NextResponse.json(
          { message: "حساب کاربری شما مسدود شده است و امکان ثبت‌نام وجود ندارد" },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { message: "این شماره تلفن قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      username: username.trim(),
      phone: cleanPhone,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "ثبت نام با موفقیت انجام شد",
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "این شماره تلفن قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "خطای سرور، لطفاً دوباره تلاش کنید" },
      { status: 500 },
    );
  }
}
