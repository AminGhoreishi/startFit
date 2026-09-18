import type { IClientTicket } from "@/types/ticket";
import {
  getStatusBadge,
  getStatusLabel,
  getCategoryBadge,
  getCategoryLabel,
} from "./ticketHelpers";

interface TicketHeaderInfoProps {
  ticket: IClientTicket;
}

export default function TicketHeaderInfo({ ticket }: TicketHeaderInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold text-sm">
        {ticket.userId?.fullName
          ? ticket.userId.fullName[0]
          : ticket.userId?.username
          ? ticket.userId.username[0]
          : "ک"}
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm sm:text-base font-bold text-white font-morabbaReg">
            {ticket.userId?.fullName ||
              ticket.userId?.username ||
              "کاربر"}
          </h3>
          <span className="text-[11px] text-white/40">
            @{ticket.userId?.username || "user"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium ${getCategoryBadge(
              ticket.category
            )}`}
          >
            {getCategoryLabel(ticket.category)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${getStatusBadge(
              ticket.status
            )}`}
          >
            {getStatusLabel(ticket.status)}
          </span>
        </div>
        <p className="text-xs text-white/70 line-clamp-1 mt-1 font-semibold">
          {ticket.subject}
        </p>
      </div>
    </div>
  );
}
