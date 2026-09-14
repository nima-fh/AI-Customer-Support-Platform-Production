"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Ticket as TicketIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { createTicket, getTickets, Ticket } from "@/lib/api";

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");

  const [createError, setCreateError] = useState("");

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      setError("Unable to load your tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialTickets() {
      try {
        const data = await getTickets();

        if (cancelled) return;

        setTickets(data);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load tickets:", error);
        setError("Unable to load your tickets.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialTickets();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateTicket(event: React.FormEvent) {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setCreateError("Subject and message are required.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });

      setSubject("");
      setMessage("");
      setCategory("other");
      setPriority("normal");

      setShowCreateModal(false);

      await loadTickets();
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setCreateError("Unable to create the ticket. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function openCreateModal() {
    setCreateError("");
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    if (creating) return;

    setCreateError("");
    setShowCreateModal(false);
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold">Tickets</h1>

                <p className="mt-1 text-sm text-zinc-400">
                  View and manage your support requests.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadTickets}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  New Ticket
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl bg-zinc-900"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
                <p className="text-sm text-red-400">{error}</p>

                <button
                  onClick={loadTickets}
                  className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && tickets.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
                  <TicketIcon className="h-7 w-7 text-zinc-500" />
                </div>

                <h2 className="text-lg font-semibold">No support tickets</h2>

                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  You don&apos;t have any support tickets yet.
                </p>

                <button
                  onClick={openCreateModal}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Ticket
                </button>
              </div>
            )}

            {/* Tickets */}
            {!loading && !error && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCreateModal();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold">Create Ticket</h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Tell us what you need help with.
                  </p>
                </div>

                <button
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateTicket} className="space-y-5 p-6">
                {/* Subject */}
                <div>
                  <label
                    htmlFor="ticket-subject"
                    className="mb-2 block text-sm text-zinc-400"
                  >
                    Subject
                  </label>

                  <input
                    id="ticket-subject"
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="What do you need help with?"
                    maxLength={200}
                    disabled={creating}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="ticket-message"
                    className="mb-2 block text-sm text-zinc-400"
                  >
                    Message
                  </label>

                  <textarea
                    id="ticket-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Describe your issue..."
                    rows={5}
                    disabled={creating}
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ticket-category"
                      className="mb-2 block text-sm text-zinc-400"
                    >
                      Category
                    </label>

                    <select
                      id="ticket-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      disabled={creating}
                      className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 disabled:opacity-50"
                    >
                      <option value="other">Other</option>
                      <option value="order">Order</option>
                      <option value="payment">Payment</option>
                      <option value="technical">Technical</option>
                      <option value="account">Account</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-priority"
                      className="mb-2 block text-sm text-zinc-400"
                    >
                      Priority
                    </label>

                    <select
                      id="ticket-priority"
                      value={priority}
                      onChange={(event) =>
                        setPriority(
                          event.target.value as "low" | "normal" | "high",
                        )
                      }
                      disabled={creating}
                      className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 disabled:opacity-50"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Error */}
                {createError && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
                    <p className="text-sm text-red-400">{createError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    disabled={creating}
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
        <TicketIcon className="h-5 w-5 text-zinc-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-xs text-zinc-500">Ticket #{ticket.id}</p>

          <StatusBadge status={ticket.status} />

          <PriorityBadge priority={ticket.priority} />

          {ticket.escalation_required && (
            <span className="rounded-full border border-orange-900/50 bg-orange-950/30 px-2.5 py-1 text-[11px] font-medium text-orange-400">
              Escalated
            </span>
          )}
        </div>

        <h2 className="truncate font-medium text-white">{ticket.subject}</h2>

        <p className="mt-1 truncate text-sm text-zinc-400">{ticket.message}</p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-xs text-zinc-500">Category</p>

        <p className="mt-1 text-sm capitalize text-zinc-300">
          {ticket.category}
        </p>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-300">
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-400">
      {priority}
    </span>
  );
}
