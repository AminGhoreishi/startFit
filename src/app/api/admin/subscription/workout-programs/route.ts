import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import WorkoutProgram from "@/models/WorkoutProgram";
import "@/models/Video";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json({ message: "شناسه برنامه تمرینی الزامی است" }, { status: 400 });
    }

    const program = await WorkoutProgram.findOne({ planId })
      .populate("programs.exercises.videoId")
      .populate("programs.exercises.videoId2");

    return NextResponse.json({ program });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در سرور";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { planId, day, muscleGroup, exercises } = await req.json();

    if (!planId || !day) {
      return NextResponse.json({ message: "شناسه برنامه و نام روز الزامی است" }, { status: 400 });
    }

    const newDay = {
      day,
      muscleGroup: muscleGroup || "",
      exercises: Array.isArray(exercises) ? exercises : [],
    };

    let program = await WorkoutProgram.findOne({ planId });

    if (!program) {
      program = await WorkoutProgram.create({
        planId,
        programs: [newDay],
      });
    } else {
      program.programs.push(newDay);
      await program.save();
    }

    return NextResponse.json({ program }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در سرور";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { planId, programDayId, day, muscleGroup, exercises } = await req.json();

    if (!planId || !programDayId) {
      return NextResponse.json({ message: "شناسه برنامه و روز الزامی است" }, { status: 400 });
    }

    const program = await WorkoutProgram.findOne({ planId });
    if (!program) {
      return NextResponse.json({ message: "برنامه پیدا نشد" }, { status: 404 });
    }

    const targetDay = program.programs.id(programDayId);
    if (!targetDay) {
      return NextResponse.json({ message: "روز تمرینی پیدا نشد" }, { status: 404 });
    }

    if (day !== undefined) targetDay.day = day;
    if (muscleGroup !== undefined) targetDay.muscleGroup = muscleGroup;
    if (exercises !== undefined) targetDay.exercises = exercises;

    await program.save();
    return NextResponse.json({ program });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در سرور";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const programDayId = searchParams.get("programDayId");

    if (!planId || !programDayId) {
      return NextResponse.json({ message: "شناسه الزامی است" }, { status: 400 });
    }

    const program = await WorkoutProgram.findOne({ planId });
    if (!program) {
      return NextResponse.json({ message: "برنامه پیدا نشد" }, { status: 404 });
    }

    program.programs.pull({ _id: programDayId });
    await program.save();

    return NextResponse.json({ message: "با موفقیت حذف شد", program });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در سرور";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { exerciseId, isComplete, weight, description } = await req.json();

    if (!exerciseId) {
      return NextResponse.json({ message: "شناسه حرکت الزامی است" }, { status: 400 });
    }

    const targetObjectId = mongoose.Types.ObjectId.isValid(exerciseId)
      ? new mongoose.Types.ObjectId(exerciseId)
      : exerciseId;

    const updateFields: Record<string, unknown> = {};
    if (isComplete !== undefined) {
      updateFields["programs.$[].exercises.$[ex].isComplete"] = Boolean(isComplete);
    }
    if (weight !== undefined) {
      updateFields["programs.$[].exercises.$[ex].weight"] = weight;
    }
    if (description !== undefined) {
      updateFields["programs.$[].exercises.$[ex].description"] = description;
    }

    const program = await WorkoutProgram.findOneAndUpdate(
      { "programs.exercises._id": targetObjectId },
      { $set: updateFields },
      {
        arrayFilters: [{ "ex._id": targetObjectId }],
        new: true,
      }
    );

    if (!program) {
      return NextResponse.json({ message: "حرکت پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "با موفقیت بروزرسانی شد", program });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در سرور";
    return NextResponse.json({ message }, { status: 500 });
  }
}
