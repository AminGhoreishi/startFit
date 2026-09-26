import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Otp from "@/models/Otp";
import Ban from "@/models/Ban";
import { toEnglishDigits } from "@/utils/numbers";
import type { IranPayamakPatternPayload } from "@/types/sms";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { phone, type, captchaToken } = body;

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const isCaptchaValid = await verifyTurnstileToken(captchaToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { message: "تأیید امنیتی کپچا ناموفق بود. لطفاً دوباره امتحان کنید" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { message: "شماره تلفن الزامی است" },
        { status: 400 }
      );
    }

    const cleanPhone = toEnglishDigits(String(phone));

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { message: "فرمت شماره تلفن معتبر نیست (مثال: 09123456789)" },
        { status: 400 }
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
          { message: "حساب کاربری شما مسدود شده است و امکان دریافت کد وجود ندارد" },
          { status: 403 }
        );
      }
    }

    if (type === "login" && !existingUser) {
      return NextResponse.json(
        { message: "حساب کاربری با این شماره یافت نشد" },
        { status: 404 }
      );
    }

    if (type === "register" && existingUser) {
      return NextResponse.json(
        { message: "این شماره تلفن قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const otpCode = Math.floor(10000 + Math.random() * 90000).toString();

    await Otp.deleteMany({
      $or: [{ phone: cleanPhone }, { phone: cleanPhone.replace(/^0/, "") }],
    });

    await Otp.create({
      phone: cleanPhone,
      code: otpCode,
    });

    const apiKey = process.env.IRANPAYAMAK_API_KEY || "";
    const lineNumber = process.env.IRANPAYAMAK_LINE_NUMBER || "";
    const patternCode = process.env.IRANPAYAMAK_PATTERN_CODE || "";

    const patternPayload: IranPayamakPatternPayload = {
      code: patternCode,
      attributes: {
        code: otpCode,
        var1: otpCode,
      },
      recipient: cleanPhone,
      line_number: lineNumber,
      number_format: "english",
    };

    await fetch("https://api.iranpayamak.com/ws/v1/sms/pattern", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify(patternPayload),
    });

    return NextResponse.json(
      { message: "کد تایید با موفقیت ارسال شد" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "خطای سرور، لطفاً دوباره تلاش کنید" },
      { status: 500 }
    );
  }
}
