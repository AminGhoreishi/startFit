import dbConnect from "@/lib/dbConnect";
import FitnessProfile from "@/models/Fitnessprofile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { uploadBase64ToS3 } from "@/lib/arvan";
import {
  VALID_GOALS,
  VALID_EQUIPMENT,
  VALID_EXPERIENCE,
  VALID_GENDERS,
  sanitizeProfile,
} from "@/utils/fitnessProfile";



export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "شما وارد سیستم نشده‌اید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const targetUserId =
      (session.user.role === "admin" || session.user.role === "coach") && queryUserId
        ? queryUserId
        : session.user.id;

    const profile = await FitnessProfile.findOne({ userId: targetUserId }).lean();
    return NextResponse.json({ profile: sanitizeProfile(profile) });
  } catch (error: any) {
    return NextResponse.json(
      { message: "خطایی در دریافت اطلاعات رخ داد" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "شما وارد سیستم نشده‌اید" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      gender,
      goal,
      sessionsPerWeek,
      equipment,
      trainingExperience,
      ageYears,
      heightCm,
      weightKg,
      bodyPhotos,
      notes,
    } = body;

    const sanitizedGender = VALID_GENDERS.includes(gender) ? gender : "male";
    const parsedSessions = Number(sessionsPerWeek);
    const parsedAge = Number(ageYears);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (
      !VALID_GOALS.includes(goal) ||
      !VALID_EQUIPMENT.includes(equipment) ||
      !VALID_EXPERIENCE.includes(trainingExperience)
    ) {
      return NextResponse.json(
        { message: "اطلاعات ورزشی ارسال‌شده نامعتبر است" },
        { status: 400 }
      );
    }

    if (
      isNaN(parsedSessions) ||
      parsedSessions < 1 ||
      parsedSessions > 7 ||
      isNaN(parsedAge) ||
      parsedAge < 10 ||
      parsedAge > 100 ||
      isNaN(parsedHeight) ||
      parsedHeight < 100 ||
      parsedHeight > 250 ||
      isNaN(parsedWeight) ||
      parsedWeight < 30 ||
      parsedWeight > 250
    ) {
      return NextResponse.json(
        { message: "مقادیر عددی وارد شده در محدوده مجاز نیستند" },
        { status: 400 }
      );
    }

    const uploadedPhotos: string[] = [];
    if (bodyPhotos && Array.isArray(bodyPhotos)) {
      if (bodyPhotos.length > 4) {
        return NextResponse.json(
          { message: "حداکثر ۴ تصویر می‌توانید بارگذاری کنید" },
          { status: 400 }
        );
      }

      for (const photo of bodyPhotos) {
        if (typeof photo !== "string") continue;
        if (photo.startsWith("http://") || photo.startsWith("https://")) {
          uploadedPhotos.push(photo);
        } else if (photo.startsWith("data:")) {
          const s3Url = await uploadBase64ToS3(photo, "fitness-profiles");
          uploadedPhotos.push(s3Url);
        }
      }
    }

    const sanitizedNotes = typeof notes === "string" ? notes.slice(0, 1000) : "";

    const profile = await FitnessProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          gender: sanitizedGender,
          goal,
          sessionsPerWeek: parsedSessions,
          equipment,
          trainingExperience,
          ageYears: parsedAge,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          bodyPhotos: uploadedPhotos,
          notes: sanitizedNotes,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      message: "پروفایل ورزشی با موفقیت ثبت شد",
      profile: sanitizeProfile(profile),
    });
  } catch (error: any) {
    const isUserError =
      error.message === "فرمت تصویر نامعتبر است" ||
      error.message === "حجم تصویر بیش از حد مجاز است" ||
      error.message === "فرمت تصویر پشتیبانی نمی‌شود";
    return NextResponse.json(
      { message: isUserError ? error.message : "خطایی در پردازش اطلاعات رخ داد" },
      { status: isUserError ? 400 : 500 }
    );
  }
}
