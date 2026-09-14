"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShoppingBag,
  Ticket,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import AgentAuthGuard from "../../../../components/AgentAuthGuard";
import { CustomerDetail, getCustomer } from "../../../../lib/api";

export default function AgentCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = Number(params.customerId);
  const isValidCustomerId = Number.isFinite(customerId);

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isValidCustomerId) {
      return;
    }

    let cancelled = false;

    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomer(customerId);

        if (cancelled) return;

        setCustomer(data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load customer:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load customer",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [customerId, isValidCustomerId]);

  const handleRefresh = async () => {
    if (!isValidCustomerId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getCustomer(customerId);

      setCustomer(data);
    } catch (err) {
      console.error("Failed to refresh customer:", err);

      setError(
        err instanceof Error ? err.message : "Failed to refresh customer",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentAuthGuard>
      <main className="min-h-screen bg-[#08090b] text-white">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0c0d10] lg:flex lg:flex-col">
            <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                AI
              </div>

              <div>
                <p className="text-sm font-semibold">Support AI</p>
                <p className="text-xs text-white/40">Agent Console</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/agent";
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <span className="text-base">▣</span>
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/agent/customers";
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white"
              >
                <UserRound className="h-4 w-4" />
                Customers
              </button>
            </nav>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  SA
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Support Agent</p>

                  <p className="text-xs text-white/40">Online</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="min-w-0 flex-1">
            {/* Header */}
            <header className="border-b border-white/10 px-6 py-6 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/agent/customers")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div>
                    <h1 className="text-2xl font-semibold">Customer Details</h1>

                    <p className="mt-1 text-sm text-white/40">
                      View customer activity and support history
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading || !isValidCustomerId}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </header>

            <div className="p-6 lg:p-8">
              {/* Invalid ID */}
              {!isValidCustomerId && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  Invalid customer ID.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && !customer && isValidCustomerId ? (
                <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-12 text-center">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-white/40" />

                  <p className="mt-3 text-sm text-white/40">
                    Loading customer...
                  </p>
                </div>
              ) : customer ? (
                <>
                  {/* Customer Header */}
                  <div className="mb-6 rounded-xl border border-white/10 bg-[#0c0d10] p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <UserRound className="h-7 w-7 text-white/50" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold">
                          {customer.name}
                        </h2>

                        <div className="mt-2 flex flex-col gap-2 text-sm text-white/40 sm:flex-row sm:items-center sm:gap-5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>

                          <span className="hidden text-white/20 sm:inline">
                            •
                          </span>

                          <span>Customer ID #{customer.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Orders"
                      value={customer.orders.length}
                      icon={<ShoppingBag className="h-5 w-5" />}
                    />

                    <StatCard
                      label="Tickets"
                      value={customer.tickets.length}
                      icon={<Ticket className="h-5 w-5" />}
                    />

                    <StatCard
                      label="Conversations"
                      value={customer.conversations.length}
                      icon={<MessageSquare className="h-5 w-5" />}
                    />

                    <StatCard
                      label="Escalations"
                      value={
                        customer.tickets.filter(
                          (ticket) => ticket.escalation_required,
                        ).length
                      }
                      icon={<AlertTriangle className="h-5 w-5" />}
                    />
                  </div>

                  {/* Orders */}
                  <section className="mb-8">
                    <SectionHeader
                      icon={<ShoppingBag className="h-4 w-4" />}
                      title="Orders"
                      count={customer.orders.length}
                    />

                    {customer.orders.length === 0 ? (
                      <EmptyState text="No orders found for this customer." />
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0d10]">
                        <div className="divide-y divide-white/10">
                          {customer.orders.map((order) => (
                            <div
                              key={order.id}
                              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  Order #{order.id}
                                </p>

                                <p className="mt-1 text-xs text-white/40">
                                  Total: ${Number(order.total_price).toFixed(2)}
                                </p>
                              </div>

                              <StatusBadge status={order.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Tickets */}
                  <section className="mb-8">
                    <SectionHeader
                      icon={<Ticket className="h-4 w-4" />}
                      title="Support Tickets"
                      count={customer.tickets.length}
                    />

                    {customer.tickets.length === 0 ? (
                      <EmptyState text="No support tickets found." />
                    ) : (
                      <div className="space-y-3">
                        {customer.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="rounded-xl border border-white/10 bg-[#0c0d10] p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-medium">
                                    {ticket.subject}
                                  </h3>

                                  {ticket.escalation_required && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-[11px] text-red-400">
                                      <AlertTriangle className="h-3 w-3" />
                                      Escalated
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-sm leading-6 text-white/50">
                                  {ticket.message}
                                </p>
                              </div>

                              <div className="flex shrink-0 gap-2">
                                <StatusBadge status={ticket.status} />

                                <StatusBadge status={ticket.priority} />
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/30">
                              <span>Ticket #{ticket.id}</span>

                              <span>•</span>

                              <span>Category: {ticket.category}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Conversations */}
                  <section>
                    <SectionHeader
                      icon={<MessageSquare className="h-4 w-4" />}
                      title="Conversations"
                      count={customer.conversations.length}
                    />

                    {customer.conversations.length === 0 ? (
                      <EmptyState text="No conversations found." />
                    ) : (
                      <div className="space-y-4">
                        {customer.conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0d10]"
                          >
                            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                              <div>
                                <p className="text-sm font-medium">
                                  Conversation #{conversation.id}
                                </p>

                                <p className="mt-1 text-xs text-white/30">
                                  {conversation.messages.length} messages
                                </p>
                              </div>

                              <StatusBadge status={conversation.status} />
                            </div>

                            {conversation.messages.length === 0 ? (
                              <div className="px-5 py-8 text-center text-sm text-white/30">
                                No messages in this conversation.
                              </div>
                            ) : (
                              <div className="divide-y divide-white/10">
                                {conversation.messages.map((message) => (
                                  <div key={message.id} className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium uppercase tracking-wide text-white/40">
                                        {message.role}
                                      </span>
                                    </div>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">
                                      {message.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </AgentAuthGuard>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">{label}</p>

          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/60">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="text-white/50">{icon}</div>

      <h2 className="text-sm font-semibold">{title}</h2>

      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40">
        {count}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  let className = "border-white/10 bg-white/5 text-white/50";

  if (
    normalizedStatus === "open" ||
    normalizedStatus === "active" ||
    normalizedStatus === "ai_active"
  ) {
    className = "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  if (normalizedStatus === "pending" || normalizedStatus === "waiting") {
    className = "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  }

  if (normalizedStatus === "closed" || normalizedStatus === "resolved") {
    className = "border-green-500/20 bg-green-500/10 text-green-400";
  }

  if (normalizedStatus === "high" || normalizedStatus === "urgent") {
    className = "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${className}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-8 text-center">
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
