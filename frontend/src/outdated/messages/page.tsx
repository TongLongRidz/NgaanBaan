"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCheck,
  Phone,
  Video,
  Info
} from "lucide-react";

interface DirectMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  is_me: boolean;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar_url: string;
    is_online: boolean;
  };
  last_message: string;
  unread_count: number;
  updated_at: string;
  messages: DirectMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c-1",
    user: {
      name: "Sarah Chen",
      avatar_url: "https://placehold.co/400x400?text=SC",
      is_online: true
    },
    last_message: "Can you check the new dark mode tokens?",
    unread_count: 2,
    updated_at: "10m ago",
    messages: [
      { id: "m-1", sender: "Sarah Chen", text: "Hey Somying Singjad! How is the kanban board layout coming along?", timestamp: "10:15 AM", is_me: false },
      { id: "m-2", sender: "You", text: "Going great! Just polishing the SideNavbar collapse animations and project sub-navbar.", timestamp: "10:18 AM", is_me: true },
      { id: "m-3", sender: "Sarah Chen", text: "Awesome! Can you check the new dark mode tokens when you get a chance?", timestamp: "10:20 AM", is_me: false }
    ]
  },
  {
    id: "c-2",
    user: {
      name: "Mike Ross",
      avatar_url: "https://placehold.co/400x400?text=MR",
      is_online: false
    },
    last_message: "PostgreSQL migration script is ready.",
    unread_count: 0,
    updated_at: "1h ago",
    messages: [
      { id: "m-4", sender: "Mike Ross", text: "PostgreSQL migration script and tb_user_session table are ready for review.", timestamp: "9:00 AM", is_me: false }
    ]
  },
  {
    id: "c-3",
    user: {
      name: "Alex Turner",
      avatar_url: "https://placehold.co/400x400?text=AT",
      is_online: true
    },
    last_message: "Sprint planning meeting scheduled for 3 PM",
    unread_count: 0,
    updated_at: "Yesterday",
    messages: [
      { id: "m-5", sender: "Alex Turner", text: "Sprint planning meeting scheduled for 3 PM tomorrow.", timestamp: "Yesterday", is_me: false }
    ]
  }
];

export default function MessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("c-1");
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      sender: "You",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_me: true
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              last_message: inputMessage.trim(),
              unread_count: 0,
              updated_at: "Just now",
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    setInputMessage("");
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TopNavbar title={t("nav.messages") || "Messages"} />

      <main className="flex-1 p-4 md:p-6 flex gap-4 h-[calc(100vh-65px)] overflow-hidden max-w-7xl w-full mx-auto animate-fade-in">
        {/* Left Sidebar: Conversations List */}
        <div className="w-80 md:w-88 shrink-0 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col overflow-hidden shadow-sm">
          {/* Header & Search */}
          <div className="p-4 border-b border-[var(--card-border)] space-y-3 bg-[var(--card-bg)]">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span>{t("nav.messages") || "Direct Messages"}</span>
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tabular-nums">
                {conversations.length}
              </span>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder={t("common.search_placeholder") || "Search team chat..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveId(conv.id);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
                    );
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 group relative ${
                    isActive
                      ? "bg-indigo-500/10 border border-indigo-500/30 text-[var(--foreground)] shadow-xs"
                      : "hover:bg-[var(--input-bg)] border border-transparent text-[var(--muted-foreground)]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.user.avatar_url}
                      alt={conv.user.name}
                      className="h-10 w-10 rounded-full object-cover border border-[var(--card-border)]"
                    />
                    {conv.user.is_online ? (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[var(--card-bg)] rounded-full ring-1 ring-emerald-500/30" />
                    ) : (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-slate-400 border-2 border-[var(--card-bg)] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`font-bold text-xs truncate ${isActive ? "text-indigo-400" : "text-[var(--foreground)]"}`}>
                        {conv.user.name}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 tabular-nums">
                        {conv.updated_at}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--muted-foreground)] truncate leading-tight">
                      {conv.last_message}
                    </p>
                  </div>

                  {conv.unread_count > 0 && !isActive && (
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Window */}
        {activeConversation && (
          <div className="flex-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col overflow-hidden shadow-sm">
            {/* Active Conversation Header */}
            <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--card-bg)]">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={activeConversation.user.avatar_url}
                    alt={activeConversation.user.name}
                    className="h-10 w-10 rounded-full object-cover border border-[var(--card-border)]"
                  />
                  {activeConversation.user.is_online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[var(--card-bg)] rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                    <span>{activeConversation.user.name}</span>
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <span className={activeConversation.user.is_online ? "text-emerald-400 font-semibold" : "text-[var(--muted-foreground)]"}>
                      {activeConversation.user.is_online ? "Online" : "Offline"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <button className="p-2 rounded-xl hover:bg-[var(--input-bg)] hover:text-[var(--foreground)] transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl hover:bg-[var(--input-bg)] hover:text-[var(--foreground)] transition-colors">
                  <Video className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl hover:bg-[var(--input-bg)] hover:text-[var(--foreground)] transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Timeline */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[var(--background)]/30">
              <div className="text-center my-2">
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[var(--input-bg)] text-[var(--muted-foreground)] border border-[var(--card-border)]">
                  Today
                </span>
              </div>

              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] animate-fade-in ${
                    msg.is_me ? "ml-auto items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.is_me
                        ? "bg-indigo-600 text-white rounded-br-xs"
                        : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[var(--muted-foreground)]">
                    <span>{msg.timestamp}</span>
                    {msg.is_me && <CheckCheck className="h-3 w-3 text-indigo-400" />}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Action Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-[var(--card-border)] flex items-center gap-2 bg-[var(--card-bg)]">
              <button
                type="button"
                className="p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                placeholder="Write a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
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
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-md font-semibold text-xs flex items-center gap-2 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}

