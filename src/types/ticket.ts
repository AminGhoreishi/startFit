import type mongoose from "mongoose";
import type { Document } from "mongoose";
import type { ReactNode, RefObject } from "react";
import type { KeyedMutator } from "swr";

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  coachId?: mongoose.Types.ObjectId | null;
  subject: string;
  description: string;
  status: "pending" | "answered" | "closed" | "coach_sent";
  category: "workout" | "nutrition" | "form_check" | "injury" | "technical";
  readNotifications?: boolean;
  videoUrl?: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISendTicketCoach extends Document {
  coachId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: "pending" | "answered" | "closed" | "coach_sent";
  category: "workout" | "nutrition" | "form_check" | "injury" | "technical";
  readNotifications?: boolean;
  videoUrl?: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientUser {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface IClientMessage {
  _id: string;
  senderId: IClientUser | string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface IClientTicket {
  _id: string;
  userId: IClientUser;
  coachId?: IClientUser | null;
  initiatedBy?: "user" | "coach";
  subject: string;
  description: string;
  status: "pending" | "answered" | "closed" | "coach_sent";
  category: "workout" | "nutrition" | "form_check" | "injury" | "technical";
  readNotifications?: boolean;
  videoUrl?: string;
  messages: IClientMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketReadApiResponse {
  success: boolean;
  message?: string;
  ticketId?: string;
}

export interface ITicketStats {
  totalCount: number;
  pendingCount: number;
  answeredCount: number;
  closedCount: number;
}

export interface TicketStatsProps {
  stats: ITicketStats;
  formatNumber: (num: number) => string;
}

export interface AdminTicketsContainerProps {
  stats: ITicketStats;
}

export interface TicketListProps {
  children?: ReactNode;
  selectedTicket: IClientTicket | null;
  setSelectedTicket: (ticket: IClientTicket | null) => void;
  tickets: IClientTicket[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
}

export interface TicketDetailsProps {
  selectedTicket: IClientTicket | null;
  setSelectedTicket: (ticket: IClientTicket | null) => void;
  onRefresh?: () => void;
}

export interface TicketFilterOption {
  key: "all" | "pending" | "answered" | "closed";
  label: string;
}

export interface TicketSidebarListProps {
  tickets: IClientTicket[];
  selectedTicket: IClientTicket | null;
  onSelectTicket: (ticket: IClientTicket) => void;
  filterStatus: "all" | "pending" | "answered" | "closed";
  setFilterStatus: (status: "all" | "pending" | "answered" | "closed") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface TicketChatPanelProps {
  ticket: IClientTicket | null;
  mutate: KeyedMutator<AdminTicketsApiResponse>;
  onTicketDeleted?: (ticketId?: string) => void;
  onCloseTicket?: (ticketId: string) => void;
  onReopenTicket?: (ticketId: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onSendMessage?: (ticketId: string, text: string) => void;
}

export interface TicketDetailsHeaderProps {
  ticketId: string;
  status: IClientTicket["status"];
  category: IClientTicket["category"];
  createdAt: string;
  subject: string;
  senderName: string;
  senderEmail?: string;
  setSelectedTicket: (ticket: IClientTicket | null) => void;
  onRefresh?: () => void;
}

export interface TicketFormValues {
  subject: string;
  category: "workout" | "nutrition" | "form_check" | "injury" | "technical";
  file?: FileList | null;
  description: string;
}

export interface UserTicketFormProps {
  setShowCreateForm: (show: boolean) => void;
  onTicketCreated?: (ticketId: string) => void;
}

export interface UserTicketChatProps {
  tickets: IClientTicket[];
  selectedTicket: IClientTicket | null;
  setSelectedTicket: (ticket: IClientTicket | null) => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onTicketUpdated?: () => void;
}

export interface UserTicketsApiResponse {
  tickets?: IClientTicket[];
  total?: number;
  totalPages?: number;
  message?: string;
}

export interface AdminTicketsApiResponse {
  tickets: IClientTicket[];
  total: number;
  totalPages: number;
  stats?: ITicketStats;
  message?: string;
}

export interface TicketMutateApiResponse {
  success?: boolean;
  ticket?: IClientTicket;
  message?: string;
}

export interface TicketItemProps {
  ticket: IClientTicket;
  isSelected: boolean;
  onSelect: (ticket: IClientTicket) => void;
}

export interface TicketChatMessagesProps {
  selectedTicket: IClientTicket;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

export interface TicketChatHeaderProps {
  selectedTicket: IClientTicket;
}

export interface TicketChatFooterProps {
  selectedTicketStatus: IClientTicket["status"];
  isCoachMessage?: boolean;
  replyText: string;
  setReplyText: (val: string) => void;
  sendingReply: boolean;
  onSendReply: (e: React.FormEvent) => void;
}

export interface AdminSendTicketFormValues {
  userId: string;
  subject: string;
  category: "workout" | "nutrition" | "form_check" | "injury" | "technical";
  description: string;
  status: "pending" | "answered" | "closed" | "coach_sent";
  file?: FileList | null;
}

export interface AdminSendTicketProps {
  initialUserId?: string;
}

export interface AdminSendTicketPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export interface AdminSearchUserResult {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface AdminSubscriberUser {
  _id: string;
  username: string;
  fullName?: string;
}

export interface AdminSubscriberUsersApiResponse {
  users: AdminSubscriberUser[];
  message?: string;
}

export interface UserTicketSidebarListProps {
  tickets: IClientTicket[];
  selectedTicket?: IClientTicket | null;
  onSelectTicket?: (ticket: IClientTicket) => void;
  filterStatus: "all" | "pending" | "answered" | "closed";
  setFilterStatus: (status: "all" | "pending" | "answered" | "closed") => void;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface UserTicketChatPanelProps {
  ticket: IClientTicket | null;
  onBackToList?: () => void;
  onTicketUpdated?: () => void;
  chatEndRef?: RefObject<HTMLDivElement | null>;
}

export interface TicketChatEmptyStateProps {
  title?: string;
  description?: string;
}


