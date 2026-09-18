import type { Metadata } from "next";
import { connection } from "next/server";
import AdminTicketDetail from "@/features/admin/tickets/AdminTicketDetail";

export const metadata: Metadata = {
  title: "گفتگوی تیکت پشتیبانی",
  description: "بررسی و پاسخگویی به تیکت پشتیبانی کاربران استار فیت",
};

interface AdminTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({
  params,
}: AdminTicketDetailPageProps) {
  await connection();
  const { id } = await params;

  return <AdminTicketDetail ticketId={id} />;
}
