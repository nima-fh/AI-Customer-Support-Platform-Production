"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Ticket as TicketIcon,
  Trash2,
  Save,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { getTicket, updateTicket, deleteTicket, Ticket } from "@/lib/api";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const ticketId = Number(params.ticketId);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<Ticket["status"]>("open");
  const [priority, setPriority] = useState<Ticket["priority"]>("normal");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTicket() {
    if (!ticketId || Number.isNaN(ticketId)) {
      setError("Invalid ticket ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTicket(ticketId);

      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      setError("Unable to load this ticket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialTicket() {
      if (!ticketId || Number.isNaN(ticketId)) {
        if (!cancelled) {
          setError("Invalid ticket ID.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getTicket(ticketId);

        if (cancelled) return;

        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load ticket:", error);
        setError("Unable to load this ticket.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialTicket();

    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  async function handleSave() {
    if (!ticket) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await updateTicket(ticket.id, {
        status,
        priority,
      });

      setTicket(updated);
      setSuccess("Ticket updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      setError("Unable to update this ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!ticket) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteTicket(ticket.id);

      router.push("/tickets");
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      setError("Unable to delete this ticket.");
      setDeleting(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <button
                  onClick={() => router.push("/tickets")}
                  className="mb-4 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tickets
                </button>

                <h1 className="text-3xl font-semibold">Ticket Details</h1>

                <p className="mt-1 text-sm text-zinc-400">
                  View and manage your support request.
                </p>
              </div>

              <button
                onClick={loadTicket}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                <div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
                <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />
              </div>
            )}

            {/* Error */}
            {!loading && error && !ticket && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
                <p className="text-sm text-red-400">{error}</p>

                <button
                  onClick={loadTicket}
                  className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && ticket && (
              <div className="space-y-6">
                {/* Ticket Header */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                      <TicketIcon className="h-6 w-6 text-zinc-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-500">
                        Ticket #{ticket.id}
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        {ticket.subject}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />

                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs capitalize text-zinc-400">
                          {ticket.category}
                        </span>

                        {ticket.escalation_required && (
                          <span className="rounded-full border border-orange-900/50 bg-orange-950/30 px-3 py-1 text-xs text-orange-400">
                            Escalated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h2 className="mb-4 text-lg font-semibold">Your Message</h2>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {ticket.message}
                  </p>
                </div>

                {/* Manage */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h2 className="mb-6 text-lg font-semibold">Manage Ticket</h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">
                        Status
                      </label>

                      <select
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value as Ticket["status"])
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-600"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">
                        Priority
                      </label>

                      <select
                        value={priority}
                        onChange={(event) =>
                          setPriority(event.target.value as Ticket["priority"])
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-600"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {success && (
                    <p className="mt-4 text-sm text-green-400">{success}</p>
                  )}

                  {error && ticket && (
                    <p className="mt-4 text-sm text-red-400">{error}</p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                {/* Delete */}
                <div className="flex items-center justify-between rounded-2xl border border-red-900/30 bg-red-950/10 p-6">
                  <div>
                    <h2 className="font-semibold">Delete Ticket</h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Permanently remove this support ticket.
                    </p>
                  </div>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 rounded-xl border border-red-900/50 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium capitalize text-zinc-300">
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium capitalize text-zinc-400">
      {priority}
    </span>
  );
}
