import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "دسترسی غیرمجاز. لطفا وارد شوید." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه تیکت نامعتبر است." },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findOne({
      _id: id,
      $or: [{ userId: session.user.id }, { coachId: session.user.id }],
    })
      .populate("userId", "username fullName email avatar role")
      .populate("coachId", "username fullName email avatar role")
      .populate("messages.senderId", "username fullName email avatar role")
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { message: "تیکت یافت نشد." },
        { status: 404 }
      );
    }

    if (!ticket.readNotifications && String(ticket.userId?._id) === session.user.id) {
      await Ticket.updateOne({ _id: id }, { readNotifications: true });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "دسترسی غیرمجاز. لطفا وارد شوید." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه تیکت نامعتبر است." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { messageText } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json(
        { message: "متن پیام الزامی است." },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findOne({ _id: id, userId: session.user.id });
    if (!ticket) {
      return NextResponse.json(
        { message: "تیکت یافت نشد یا دسترسی غیرمجاز است." },
        { status: 404 }
      );
    }

    if (ticket.initiatedBy === "coach") {
      return NextResponse.json(
        { message: "امکان ارسال پاسخ برای پیام‌های ارسالی از طرف مربی وجود ندارد." },
        { status: 400 }
      );
    }

    if (ticket.status === "closed") {
      return NextResponse.json(
        { message: "این تیکت بسته شده است و امکان ارسال پیام وجود ندارد." },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(session.user.id);
    const senderName =
      dbUser?.fullName ||
      dbUser?.username ||
      session.user.username ||
      "کاربر استار فیت";

    ticket.messages.push({
      senderId: session.user.id,
      senderName,
      text: messageText.trim(),
      createdAt: new Date(),
    });

    ticket.status = "pending";
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("userId", "username fullName email avatar role")
      .populate("coachId", "username fullName email avatar role")
      .populate("messages.senderId", "username fullName email avatar role")
      .lean();

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
