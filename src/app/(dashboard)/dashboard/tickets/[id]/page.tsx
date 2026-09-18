import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import UserTicketDetail from "@/features/dashboard/tickets/UserTicketDetail";
import { isValidObjectId } from "@/features/dashboard/tickets/ticketHelpers";

export const metadata: Metadata = {
  title: "گفتگوی تیکت پشتیبانی",
  description: "مشاهده و گفتگو در تیکت پشتیبانی استار فیت",
};

interface UserTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserTicketDetailPage({
  params,
}: UserTicketDetailPageProps) {
  await connection();
  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  return <UserTicketDetail ticketId={id} />;
}
