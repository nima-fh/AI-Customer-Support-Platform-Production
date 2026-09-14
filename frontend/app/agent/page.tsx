"use client";
import { MessageSquare, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEscalatedTickets,
  updateTicketAsAgent,
  getTicketConversation,
  sendAgentMessage,
  Message,
  Ticket,
  takeOverTicket,
} from "../../lib/api";
import AgentAuthGuard from "../../components/AgentAuthGuard";

export default function AgentDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState("");

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const handleTakeOver = async () => {
    if (!selectedTicket || updating || sendingReply) return;

    try {
      setUpdating(true);
      setActionError("");

      const updatedTicket = await takeOverTicket(selectedTicket.id);

      setSelectedTicket(updatedTicket);

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to take over conversation",
      );
    } finally {
      setUpdating(false);
    }
  };
  /* =====================================================
     LOAD ESCALATED TICKETS
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialTickets() {
      try {
        const data = await getEscalatedTickets();

        if (cancelled) return;

        setTickets(data);
        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load escalated tickets:", err);

        setError(err instanceof Error ? err.message : "Something went wrong");
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
  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      escalated: tickets.length,

      open: tickets.filter((ticket) => ticket.status === "open").length,

      high: tickets.filter((ticket) => ticket.priority === "high").length,

      closed: tickets.filter((ticket) => ticket.status === "closed").length,
    };
  }, [tickets]);

  /* =====================================================
     SELECT TICKET + LOAD CONVERSATION
  ===================================================== */

  async function handleTicketSelect(ticket: Ticket) {
    setSelectedTicket(ticket);

    setTicketMessages([]);
    setReplyText("");
    setConversationError("");
    setActionError("");
    setConversationLoading(true);

    try {
      const messages = await getTicketConversation(ticket.id);

      setTicketMessages(messages);
    } catch (err) {
      console.error("Failed to load ticket conversation:", err);

      setConversationError(
        err instanceof Error
          ? err.message
          : "Unable to load ticket conversation",
      );
    } finally {
      setConversationLoading(false);
    }
  }

  /* =====================================================
     SEND AGENT REPLY
  ===================================================== */

  async function handleSendReply() {
    if (!selectedTicket || !replyText.trim() || sendingReply) {
      return;
    }

    try {
      setSendingReply(true);
      setActionError("");

      const newMessage = await sendAgentMessage(
        selectedTicket.id,
        replyText.trim(),
      );

      setTicketMessages((currentMessages) => [...currentMessages, newMessage]);

      setReplyText("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to send agent reply",
      );
    } finally {
      setSendingReply(false);
    }
  }

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeTicketModal() {
    if (updating || sendingReply) {
      return;
    }

    setSelectedTicket(null);
    setTicketMessages([]);
    setReplyText("");
    setConversationError("");
    setActionError("");
  }

  /* =====================================================
     UPDATE TICKET
  ===================================================== */

  async function updateTicket(
    ticketId: number,
    updates: {
      status?: string;
      priority?: string;
      category?: string;
    },
  ) {
    try {
      setUpdating(true);
      setActionError("");

      const updatedTicket = await updateTicketAsAgent(ticketId, updates);

      setTickets((currentTickets) =>
        updatedTicket.status === "closed"
          ? currentTickets.filter((ticket) => ticket.id !== ticketId)
          : currentTickets.map((ticket) =>
              ticket.id === ticketId ? updatedTicket : ticket,
            ),
      );

      setSelectedTicket(updatedTicket);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update ticket",
      );
    } finally {
      setUpdating(false);
    }
  }

  /* =====================================================
     STYLES
  ===================================================== */

  function priorityStyles(priority: string) {
    switch (priority) {
      case "high":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "normal":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "low":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      default:
        return "border-white/10 bg-white/5 text-gray-400";
    }
  }

  function statusStyles(status: string) {
    switch (status) {
      case "open":
        return "bg-emerald-500/10 text-emerald-400";

      case "pending":
        return "bg-yellow-500/10 text-yellow-400";

      case "closed":
        return "bg-gray-500/10 text-gray-400";

      default:
        return "bg-white/5 text-gray-400";
    }
  }

  return (
    <AgentAuthGuard>
      <main className="min-h-screen bg-[#08090b] text-white">
        <div className="flex min-h-screen">
          {/* ================= SIDEBAR ================= */}

          <aside className="hidden w-64 border-r border-white/10 bg-[#0c0d10] lg:block">
            <div className="flex h-full flex-col">
              {/* Logo */}

              <div className="border-b border-white/10 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-black">
                    AI
                  </div>

                  <div>
                    <h1 className="font-semibold">Support AI</h1>

                    <p className="text-xs text-gray-500">Agent Console</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}

              <nav className="flex-1 space-y-2 p-4">
                <button
                  className="
                    flex w-full items-center gap-3
                    rounded-xl bg-white/10
                    px-4 py-3
                    text-sm font-medium
                    text-white
                  "
                >
                  <span>▣</span>
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/agent/customers")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <UserRound className="h-4 w-4" />
                  Customers
                </button>{" "}
              </nav>

              {/* Agent */}

              <div className="border-t border-white/10 p-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-gray-500">Logged in as</p>

                  <p className="mt-1 truncate text-sm font-medium">
                    Support Agent
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= MAIN ================= */}

          <section className="flex-1">
            {/* Header */}

            <header
              className="
                flex h-20
                items-center justify-between
                border-b border-white/10
                px-6 lg:px-8
              "
            >
              <div>
                <h2 className="text-xl font-semibold">Dashboard</h2>

                <p className="text-sm text-gray-500">
                  Monitor and manage escalated support requests
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">Support Agent</p>

                  <p className="text-xs text-emerald-400">● Online</p>
                </div>

                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    border border-white/10
                    bg-white/5
                    text-sm font-semibold
                  "
                >
                  SA
                </div>
              </div>
            </header>

            <div className="p-6 lg:p-8">
              {/* ================= STATS ================= */}

              <div
                className="
                  grid gap-4
                  sm:grid-cols-2
                  xl:grid-cols-4
                "
              >
                <StatCard
                  label="Escalated"
                  value={stats.escalated}
                  description="Needs human attention"
                  icon="!"
                />

                <StatCard
                  label="Open"
                  value={stats.open}
                  description="Currently active"
                  icon="○"
                />

                <StatCard
                  label="High Priority"
                  value={stats.high}
                  description="Urgent tickets"
                  icon="↑"
                />

                <StatCard
                  label="Closed"
                  value={stats.closed}
                  description="Resolved tickets"
                  icon="✓"
                />
              </div>

              {/* ================= TICKETS ================= */}

              <div className="mt-8">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Escalated Tickets</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Tickets automatically escalated by Support AI
                    </p>
                  </div>

                  <span
                    className="
                      rounded-full
                      border border-red-500/20
                      bg-red-500/10
                      px-3 py-1.5
                      text-xs font-medium
                      text-red-400
                    "
                  >
                    {tickets.length} requiring attention
                  </span>
                </div>

                {/* Loading */}

                {loading && (
                  <div
                    className="
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.03]
                      p-10
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto h-6 w-6
                        animate-spin
                        rounded-full
                        border-2
                        border-white/20
                        border-t-white
                      "
                    />

                    <p className="mt-4 text-sm text-gray-500">
                      Loading tickets...
                    </p>
                  </div>
                )}

                {/* Error */}

                {error && !loading && (
                  <div
                    className="
                      rounded-2xl
                      border border-red-500/20
                      bg-red-500/5
                      p-5
                      text-sm
                      text-red-400
                    "
                  >
                    {error}
                  </div>
                )}

                {/* Empty */}

                {!loading && !error && tickets.length === 0 && (
                  <div
                    className="
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.03]
                      p-12
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto flex h-12 w-12
                        items-center justify-center
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      ✓
                    </div>

                    <h3 className="mt-4 font-semibold">All caught up</h3>

                    <p className="mt-2 text-sm text-gray-500">
                      There are no escalated tickets requiring attention.
                    </p>
                  </div>
                )}

                {/* Ticket List */}

                {!loading && !error && tickets.length > 0 && (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className="
                          group w-full
                          rounded-2xl
                          border border-white/10
                          bg-white/[0.03]
                          p-5
                          text-left
                          transition
                          hover:border-white/20
                          hover:bg-white/[0.05]
                        "
                      >
                        <div
                          className="
                            flex flex-col gap-4
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                          "
                        >
                          <div className="min-w-0 flex-1">
                            {/* Badges */}

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">
                                #{ticket.id}
                              </span>

                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-2.5 py-1
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  ${priorityStyles(ticket.priority)}
                                `}
                              >
                                {ticket.priority}
                              </span>

                              <span
                                className="
                                  rounded-full
                                  bg-red-500/10
                                  px-2.5 py-1
                                  text-[11px]
                                  font-semibold
                                  text-red-400
                                "
                              >
                                ESCALATED
                              </span>
                            </div>

                            {/* Subject */}

                            <h4 className="mt-3 truncate font-semibold">
                              {ticket.subject}
                            </h4>

                            {/* Message */}

                            <p
                              className="
                                mt-2
                                line-clamp-2
                                text-sm
                                leading-6
                                text-gray-400
                              "
                            >
                              {ticket.message}
                            </p>

                            {/* Metadata */}

                            <div
                              className="
                                mt-4
                                flex flex-wrap
                                items-center
                                gap-2
                                text-xs
                                text-gray-500
                              "
                            >
                              <span>Customer #{ticket.customer_id}</span>

                              <span className="text-gray-700">•</span>

                              <span className="capitalize">
                                {ticket.category}
                              </span>

                              <span className="text-gray-700">•</span>

                              <span
                                className={`
                                  rounded-md
                                  px-2 py-1
                                  capitalize
                                  ${statusStyles(ticket.status)}
                                `}
                              >
                                {ticket.status}
                              </span>
                            </div>
                          </div>

                          {/* View */}

                          <div
                            className="
                              flex items-center
                              justify-end
                              text-gray-600
                              transition
                              group-hover:text-white
                            "
                          >
                            <span className="mr-2 text-xs">View ticket</span>

                            <span className="text-lg">→</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ================= TICKET MODAL ================= */}

        {selectedTicket && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/70
              p-4
              backdrop-blur-sm
            "
            onClick={closeTicketModal}
          >
            <div
              className="
                flex max-h-[90vh]
                w-full max-w-3xl
                flex-col
                overflow-hidden
                rounded-2xl
                border border-white/10
                bg-[#101114]
                shadow-2xl
              "
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}

              <div
                className="
                  flex shrink-0 items-start justify-between
                  border-b border-white/10
                  p-6
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Ticket #{selectedTicket.id}
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-red-500/10
                        px-2.5 py-1
                        text-[11px]
                        font-semibold
                        text-red-400
                      "
                    >
                      ESCALATED
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <button
                  disabled={updating || sendingReply}
                  onClick={closeTicketModal}
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    text-gray-500
                    transition
                    hover:bg-white/10
                    hover:text-white
                    disabled:opacity-40
                  "
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}

              <div className="min-h-0 overflow-y-auto">
                <div className="space-y-6 p-6">
                  {/* Customer Message */}

                  <div>
                    <p
                      className="
                        mb-2
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-gray-500
                      "
                    >
                      Customer Message
                    </p>

                    <div
                      className="
                        rounded-xl
                        border border-white/10
                        bg-white/[0.03]
                        p-4
                        text-sm
                        leading-7
                        text-gray-300
                      "
                    >
                      {selectedTicket.message}
                    </div>
                  </div>

                  {/* Ticket Information */}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <DetailItem
                      label="Customer"
                      value={`#${selectedTicket.customer_id}`}
                    />

                    <DetailItem
                      label="Category"
                      value={selectedTicket.category}
                    />

                    <DetailItem
                      label="Priority"
                      value={selectedTicket.priority}
                    />

                    <DetailItem label="Status" value={selectedTicket.status} />
                  </div>

                  {/* Escalation Notice */}

                  <div
                    className="
                      rounded-xl
                      border border-yellow-500/20
                      bg-yellow-500/5
                      p-4
                    "
                  >
                    <p className="text-sm font-medium text-yellow-400">
                      Human attention required
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-gray-400
                      "
                    >
                      This ticket was automatically escalated by the AI support
                      system and requires review by a support agent.
                    </p>
                  </div>

                  {/* ================= CONVERSATION ================= */}

                  <div className="border-t border-white/10 pt-6">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold">
                        Conversation History
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        The conversation that led to this support ticket
                      </p>
                    </div>

                    {/* Loading */}

                    {conversationLoading && (
                      <div
                        className="
                          rounded-xl
                          border border-white/10
                          bg-white/[0.03]
                          p-8
                          text-center
                        "
                      >
                        <div
                          className="
                            mx-auto h-5 w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-white/20
                            border-t-white
                          "
                        />

                        <p className="mt-3 text-xs text-gray-500">
                          Loading conversation...
                        </p>
                      </div>
                    )}

                    {/* Error */}

                    {!conversationLoading && conversationError && (
                      <div
                        className="
                          rounded-xl
                          border border-red-500/20
                          bg-red-500/5
                          p-4
                          text-sm
                          text-red-400
                        "
                      >
                        {conversationError}
                      </div>
                    )}

                    {/* Empty */}

                    {!conversationLoading &&
                      !conversationError &&
                      ticketMessages.length === 0 && (
                        <div
                          className="
                            rounded-xl
                            border border-white/10
                            bg-white/[0.03]
                            p-8
                            text-center
                          "
                        >
                          <p className="text-sm text-gray-500">
                            No conversation history is available for this
                            ticket.
                          </p>
                        </div>
                      )}

                    {/* Messages */}

                    {!conversationLoading &&
                      !conversationError &&
                      ticketMessages.length > 0 && (
                        <div
                          className="
                            max-h-96
                            space-y-4
                            overflow-y-auto
                            rounded-xl
                            border border-white/10
                            bg-black/10
                            p-4
                          "
                        >
                          {ticketMessages.map((message) => {
                            const isUser = message.role === "user";
                            const isAgent = message.role === "agent";

                            return (
                              <div
                                key={message.id}
                                className={`flex ${
                                  isUser
                                    ? "justify-end"
                                    : isAgent
                                      ? "justify-end"
                                      : "justify-start"
                                }`}
                              >
                                <div
                                  className={`
                                    max-w-[85%]
                                    rounded-2xl
                                    px-4 py-3
                                    ${
                                      isUser
                                        ? "bg-white text-black"
                                        : isAgent
                                          ? "border border-blue-500/20 bg-blue-500/10 text-blue-100"
                                          : "border border-white/10 bg-white/[0.05] text-gray-200"
                                    }
                                  `}
                                >
                                  <p
                                    className={`
                                      mb-1
                                      text-[11px]
                                      font-medium
                                      ${
                                        isUser
                                          ? "text-black/50"
                                          : isAgent
                                            ? "text-blue-300/60"
                                            : "text-gray-500"
                                      }
                                    `}
                                  >
                                    {isUser
                                      ? "Customer"
                                      : isAgent
                                        ? "Support Agent"
                                        : message.role === "assistant"
                                          ? "AI Assistant"
                                          : message.role}
                                  </p>

                                  <p className="text-sm leading-6">
                                    {message.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>

                  {/* ================= AGENT REPLY ================= */}

                  <div className="border-t border-white/10 pt-6">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold">
                        Reply to Customer
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        Send a message directly to the customer
                      </p>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Write your reply..."
                      rows={4}
                      disabled={sendingReply || updating}
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border border-white/10
                        bg-white/[0.03]
                        px-4 py-3
                        text-sm
                        leading-6
                        text-white
                        placeholder:text-gray-600
                        outline-none
                        transition
                        focus:border-white/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply || updating}
                        className="
                          rounded-xl
                          bg-white
                          px-5 py-2.5
                          text-sm
                          font-medium
                          text-black
                          transition
                          hover:bg-gray-200
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        onClick={handleTakeOver}
                        disabled={updating || sendingReply}
                        className="
                              rounded-xl
                              bg-blue-600
                              px-5 py-2.5
                              text-sm
                              font-medium
                              text-white
                              transition
                              hover:bg-blue-500
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                      >
                        Take Over
                      </button>{" "}
                    </div>
                  </div>

                  {/* Action Error */}

                  {actionError && (
                    <div
                      className="
                        rounded-xl
                        border border-red-500/20
                        bg-red-500/5
                        p-3
                        text-sm
                        text-red-400
                      "
                    >
                      {actionError}
                    </div>
                  )}

                  {/* Controls */}

                  <div className="border-t border-white/10 pt-5">
                    <div className="flex flex-col gap-4">
                      {/* Status */}

                      <div>
                        <label className="mb-2 block text-xs text-gray-500">
                          Ticket Status
                        </label>

                        <select
                          value={selectedTicket.status}
                          disabled={updating || sendingReply}
                          onChange={(event) =>
                            updateTicket(selectedTicket.id, {
                              status: event.target.value,
                            })
                          }
                          className="
                            w-full
                            rounded-xl
                            border border-white/10
                            bg-white/5
                            px-3 py-2.5
                            text-sm
                            text-white
                            outline-none
                            transition
                            focus:border-white/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <option value="open" className="bg-[#101114]">
                            Open
                          </option>

                          <option value="pending" className="bg-[#101114]">
                            Pending
                          </option>

                          <option value="closed" className="bg-[#101114]">
                            Closed
                          </option>
                        </select>
                      </div>

                      {/* Priority */}

                      <div>
                        <label className="mb-2 block text-xs text-gray-500">
                          Priority
                        </label>

                        <select
                          value={selectedTicket.priority}
                          disabled={updating || sendingReply}
                          onChange={(event) =>
                            updateTicket(selectedTicket.id, {
                              priority: event.target.value,
                            })
                          }
                          className="
                            w-full
                            rounded-xl
                            border border-white/10
                            bg-white/5
                            px-3 py-2.5
                            text-sm
                            text-white
                            outline-none
                            transition
                            focus:border-white/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <option value="low" className="bg-[#101114]">
                            Low
                          </option>

                          <option value="normal" className="bg-[#101114]">
                            Normal
                          </option>

                          <option value="high" className="bg-[#101114]">
                            High
                          </option>
                        </select>
                      </div>

                      {/* Buttons */}

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          disabled={updating || sendingReply}
                          onClick={closeTicketModal}
                          className="
                            rounded-xl
                            border border-white/10
                            px-4 py-2.5
                            text-sm
                            text-gray-300
                            transition
                            hover:bg-white/5
                            disabled:opacity-40
                          "
                        >
                          Close
                        </button>

                        <button
                          disabled={updating || sendingReply}
                          onClick={() =>
                            updateTicket(selectedTicket.id, {
                              status:
                                selectedTicket.status === "closed"
                                  ? "open"
                                  : "closed",
                            })
                          }
                          className="
                            rounded-xl
                            bg-white
                            px-4 py-2.5
                            text-sm
                            font-medium
                            text-black
                            transition
                            hover:bg-gray-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {updating
                            ? "Updating..."
                            : selectedTicket.status === "closed"
                              ? "Reopen Ticket"
                              : "Close Ticket"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AgentAuthGuard>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-white/[0.03]
        p-5
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

          <p className="mt-1 text-xs text-gray-600">{description}</p>
        </div>

        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            bg-white/5
            text-sm
            text-gray-400
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        rounded-xl
        border border-white/10
        bg-white/[0.03]
        p-3
      "
    >
      <p
        className="
          text-[11px]
          uppercase
          tracking-wide
          text-gray-600
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-sm
          capitalize
          text-gray-300
        "
      >
        {value}
      </p>
    </div>
  );
}
