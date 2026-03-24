'use client';

import ChatWindow from '@/components/whatsapp/ChatWindow';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111B21]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 bg-[#202C33] px-3 py-2.5 sm:px-5 shadow-md">
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </Link>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold text-sm">
            क
          </div>
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#202C33]" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-100 truncate">
            Kala-Kendra
          </h1>
          <p className="text-xs text-emerald-400">online</p>
        </div>

        {/* Icon */}
        <MessageCircle className="h-5 w-5 text-gray-400" />
      </header>

      {/* ── Chat ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
