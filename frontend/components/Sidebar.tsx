"use client";

import {
  Bot,
  MessageSquare,
  ShoppingBag,
  Ticket,
  LayoutDashboard,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import type { Conversation } from "@/lib/api";

type SidebarProps = {
  role?: "customer" | "support_agent";
  customerName?: string;
  conversations?: Conversation[];
  activeConversationId?: number | null;
  onConversationSelect?: (id: number) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: number) => void;
  onLogout?: () => void;
};

export default function Sidebar({
  role = "customer",
  customerName = "Customer",
  conversations = [],
  activeConversationId = null,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onLogout,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const customerNavigation = [
    {
      label: "AI Support",
      icon: Bot,
      path: "/",
    },
    {
      label: "Orders",
      icon: ShoppingBag,
      path: "/orders",
    },
    {
      label: "Tickets",
      icon: Ticket,
      path: "/tickets",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const agentNavigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/agent",
    },
    {
      label: "Conversations",
      icon: MessageSquare,
      path: "/conversations",
    },
    {
      label: "Tickets",
      icon: Ticket,
      path: "/tickets",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const navigation =
    role === "support_agent" ? agentNavigation : customerNavigation;

  return (
    <aside className="hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
          <Bot size={21} />
        </div>

        <div>
          <h1 className="text-sm font-semibold">SupportAI</h1>
          <p className="text-[11px] text-zinc-500">Intelligent support</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Conversations */}
      {role === "customer" && (
        <div className="flex min-h-0 flex-1 flex-col px-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-zinc-500">Conversations</p>

            <button
              onClick={onNewConversation}
              className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
              title="New conversation"
              aria-label="New conversation"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-2 py-3 text-xs text-zinc-600">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex w-full items-center rounded-xl transition ${
                    activeConversationId === conversation.id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-900"
                  }`}
                >
                  <button
                    onClick={() => onConversationSelect?.(conversation.id)}
                    className={`min-w-0 flex-1 px-3 py-2.5 text-left ${
                      activeConversationId === conversation.id
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">
                      Conversation #{conversation.id}
                    </p>

                    <p className="mt-1 text-[11px] text-zinc-600">
                      Customer conversation
                    </p>
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteConversation?.(conversation.id);
                    }}
                    className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    title="Delete conversation"
                    aria-label={`Delete conversation ${conversation.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User */}
      {role === "customer" && (
        <div className="border-t border-zinc-800 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium">
              {getInitials(customerName)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{customerName}</p>

              <p className="truncate text-xs text-zinc-500">Customer</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
