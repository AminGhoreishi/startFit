"use client";

import { useEffect, useState, useRef, memo } from "react";
import { Search, X, User as UserIcon } from "lucide-react";
import type { UserSearchInputProps, SubscriptionItem } from "@/types/workout";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("خطا در دریافت اطلاعات");
  }
  return res.json();
};

function UserSearchInput({
  setSelectedUser,
  placeholder = "جستجوی کاربر یا شماره...",
}: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useSWR<{ subscriptions: SubscriptionItem[] }>(
    debouncedSearchQuery.trim()
      ? `/api/admin/subscription/find-user?search=${encodeURIComponent(debouncedSearchQuery)}`
      : null,
    fetcher
  );

  const subscriptions = data?.subscriptions || [];

  useEffect(() => {
    if (debouncedSearchQuery.trim() && (subscriptions.length > 0 || isLoading)) {
      setIsOpen(true);
    }
  }, [debouncedSearchQuery, subscriptions.length, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchQuery(newVal);
    if (!isOpen && newVal.trim()) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleSelect = (sub: SubscriptionItem) => {
    if (sub.userId) {
      setSearchQuery(sub.userId.fullName || sub.userId.username);
    }
    setIsOpen(false);
    setSelectedUser(sub.userId);
  };


  return (
    <div ref={containerRef} className="relative flex-1 md:w-64">
      <Search className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => {
          if (debouncedSearchQuery.trim()) setIsOpen(true);
        }}
        className="w-full bg-neutral-900/80 border border-white/15 rounded-xl pr-9 pl-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 transition-all"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {isOpen && debouncedSearchQuery.trim() && (
        <div className="absolute top-full right-0 left-0 mt-2 z-50 bg-neutral-900/95 border border-white/15 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-80 overflow-y-auto divide-y divide-white/5">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-white/50">
              در حال جستجو...
            </div>
          ) : subscriptions.length > 0 ? (
            subscriptions.map((sub) => {
              const user = sub.userId;
              if (!user) return null;
              return (
                <div
                  key={sub._id}
                  onClick={() => handleSelect(sub)}
                  className="p-3 hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs shrink-0 font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.fullName?.charAt(0) || user.username?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-[10px] text-white/50 truncate dir-ltr text-right">
                        {user.phone || user.email || `@${user.username}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-white/40">
              کاربری با این مشخصات یافت نشد
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(UserSearchInput);
