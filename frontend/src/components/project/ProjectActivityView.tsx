"use client";

import React, { useState, useRef, useEffect } from "react";
import { ActivityLog } from "@/types/project";
import { useLanguage } from "@/hooks/useLanguage";
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Search,
  Bell,
  ChevronRight,
  Filter,
  ArrowRightLeft,
  CheckCircle2,
  PlusCircle,
  Activity
} from "lucide-react";

interface ProjectActivityViewProps {
  activities: ActivityLog[];
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar_initial: string;
  text: string;
  timestamp: string;
  is_me: boolean;
  type?: "chat" | "system_activity";
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "act-1",
    sender: "Somchai Jaidee (You)",
    avatar_initial: "S",
    text: "created this task",
    timestamp: "Sep 8 at 3:30 pm",
    is_me: false,
    type: "system_activity"
  },
  {
    id: "msg-1",
    sender: "Somying Singjad",
    avatar_initial: "S",
    text: "สวัสดีค่ะทีมงาน อัปเดตงานออกแบบระบบบอร์ดของสปรินต์นี้เรียบร้อยแล้วนะคะ",
    timestamp: "10:15 AM",
    is_me: false,
    type: "chat"
  },
  {
    id: "msg-2",
    sender: "Sarah Chen",
    avatar_initial: "S",
    text: "ยอดเยี่ยมมากครับ! เดี๋ยวผมช่วยตรวจสอบและรันเทสบน staging ให้นะครับ",
    timestamp: "10:18 AM",
    is_me: false,
    type: "chat"
  },
  {
    id: "msg-3",
    sender: "You",
    avatar_initial: "Y",
    text: "ขอบคุณมากครับ หากมีคำถามหรือติดขัดตรงไหนบอกได้เลยนะครับ",
    timestamp: "10:20 AM",
    is_me: true,
    type: "chat"
  }
];

export function ProjectActivityView({ activities }: ProjectActivityViewProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showMoreActivities, setShowMoreActivities] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "You",
      avatar_initial: "Y",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      is_me: true,
      type: "chat"
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <main className="flex-1 p-4 md:p-6 flex flex-col h-[calc(100vh-140px)] overflow-hidden w-full animate-fade-in">
      <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col flex-1 overflow-hidden shadow-sm">
        {/* Top Activity Header Bar (Match user image with title, search, bell notification & filter) */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-end bg-[var(--card-bg)]">
          <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
            <button className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1.5 p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
              <Bell className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 tabular-nums">3</span>
            </button>
            <button className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Audit Log Timeline Section (Matching user reference image style) */}
        <div className="px-6 py-3 border-b border-[var(--card-border)] bg-[var(--background)]/50 space-y-2 text-xs text-[var(--muted-foreground)]">
          {/* Show More Expandable Button */}
          <button
            onClick={() => setShowMoreActivities(!showMoreActivities)}
            className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors py-0.5"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showMoreActivities ? "rotate-90" : ""
              }`}
            />
            <span>{showMoreActivities ? "Hide activity log" : "Show more"}</span>
          </button>

          {/* Expandable Activity Content */}
          {showMoreActivities && (
            <div className="pt-1 pl-2 space-y-2.5 animate-fade-in">
              {/* Primary Activity Item */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)] shrink-0" />
                  <p className="text-xs text-[var(--foreground)] font-medium">
                    <span className="font-semibold text-[var(--foreground)]">Somchai Jaidee (You)</span> created this task
                  </p>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] tabular-nums shrink-0">
                  Sep 8 at 3:30 pm
                </span>
              </div>

              {/* Additional Activity Logs */}
              <div className="pl-4 border-l-2 border-[var(--card-border)] space-y-2 py-1">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between text-[11px]">
                    <p className="text-[var(--foreground)]">
                      <span className="font-semibold">{act.user}</span> {act.action}{" "}
                      <span className="font-medium text-[var(--muted-foreground)]">{act.target}</span>
                    </p>
                    <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages Log Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[var(--background)]/30">
          {messages.map((msg) => {
            if (msg.type === "system_activity") return null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] animate-fade-in ${
                  msg.is_me ? "ml-auto flex-row-reverse" : "items-start"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                  {msg.avatar_initial}
                </div>

                <div className={`flex flex-col ${msg.is_me ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--foreground)]">{msg.sender}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.is_me
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Action Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 md:p-4 border-t border-[var(--card-border)] flex items-center gap-2 bg-[var(--card-bg)]"
        >
          <button
            type="button"
            className="p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            placeholder="Write a message or activity update..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />

          <button
            type="button"
            className="p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-md font-semibold text-xs flex items-center gap-2 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </main>
  );
}
