"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles, Send, Plus, UserRound } from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import {
  sendChatMessage,
  getConversations,
  getConversation,
  getConversationMessages,
  deleteConversation,
  Conversation,
  Message,
  getMe,
} from "@/lib/api";

export default function Home() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationStatus, setConversationStatus] =
    useState<string>("ai_active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("Customer");

  const router = useRouter();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const me = await getMe();
        setCustomerName(me.name);

        const conversations = await getConversations();
        setConversationList(conversations);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }

    loadInitialData();
  }, []);
  async function handleConversationSelect(id: number) {
    try {
      setError("");

      const [conversation, data] = await Promise.all([
        getConversation(id),
        getConversationMessages(id),
      ]);

      setMessages(data);
      setConversationId(id);
      setConversationStatus(conversation.status);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setError("Unable to load this conversation.");
    }
  }

  async function handleSend() {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const data = await sendChatMessage(
        userMessage,
        conversationId ?? undefined,
      );

      setConversationId(data.conversation_id);

      if (data.conversation_status) {
        setConversationStatus(data.conversation_status);
      }

      const updatedMessages = await getConversationMessages(
        data.conversation_id,
      );

      setMessages(updatedMessages);

      const conversations = await getConversations();
      setConversationList(conversations);
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Unable to connect to the AI support service.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    setConversationId(null);
    setMessages([]);
    setConversationStatus("ai_active");
    setError("");
  }

  async function handleDeleteConversation(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteConversation(id);

      setConversationList((currentConversations) =>
        currentConversations.filter((conversation) => conversation.id !== id),
      );

      if (conversationId === id) {
        handleNewConversation();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setError("Unable to delete this conversation.");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  const isHumanActive = conversationStatus === "human_active";

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const ws = new WebSocket(
      `ws://localhost:8000/ws/conversations/${conversationId}`,
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        const incomingMessage = data.message;

        setMessages((currentMessages) => {
          const alreadyExists = currentMessages.some(
            (message) => message.id === incomingMessage.id,
          );

          if (alreadyExists) {
            return currentMessages;
          }

          return [...currentMessages, incomingMessage];
        });

        return;
      }

      if (data.type === "conversation_status") {
        setConversationStatus(data.status);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [conversationId]);

  return (
    <AuthGuard>
      <main className="flex min-h-screen bg-zinc-950 text-zinc-100">
        {/* Sidebar */}
        <Sidebar
          role="customer"
          customerName={customerName}
          conversations={conversationList}
          activeConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onLogout={handleLogout}
        />
        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-5 md:px-8">
            <div>
              <p className="text-sm font-medium">AI Support</p>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                {isHumanActive ? "Support agent active" : "AI system online"}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
              {isHumanActive ? (
                <>
                  <UserRound size={14} className="text-emerald-400" />
                  Human Support
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-indigo-400" />
                  Powered by Qwen3
                </>
              )}
            </div>
          </header>

          {/* Chat */}
          <div className="flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-8 md:px-8">
              {messages.length === 0 ? (
                <EmptyState setMessage={setMessage} />
              ) : (
                <div className="flex-1 space-y-6 overflow-y-auto pb-8">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          msg.role === "user"
                            ? "bg-indigo-500 text-white"
                            : msg.role === "agent"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-zinc-200"
                              : "border border-zinc-800 bg-zinc-900 text-zinc-200"
                        }`}
                      >
                        {msg.role === "agent" && (
                          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                            <UserRound size={12} />
                            Support Agent
                          </div>
                        )}

                        {msg.role === "assistant" && (
                          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-indigo-400">
                            <Bot size={12} />
                            AI Assistant
                          </div>
                        )}

                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && !isHumanActive && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-500">
                        AI is thinking...
                      </div>
                    </div>
                  )}

                  {isHumanActive && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-zinc-400">
                        <UserRound size={15} className="text-emerald-400" />

                        <span>
                          A support agent is handling this conversation.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Input */}
              <div className="mt-4">
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-2 shadow-2xl shadow-black/20">
                  <div className="flex items-end gap-2">
                    <button
                      className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                      aria-label="Attachment"
                    >
                      <Plus size={19} />
                    </button>

                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isHumanActive
                          ? "Message your support agent..."
                          : "Ask anything about your account..."
                      }
                      rows={1}
                      className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                    />

                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || loading}
                      className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11px] text-zinc-600">
                  {isHumanActive
                    ? "Your messages will be sent directly to the support agent."
                    : "AI responses may contain mistakes. Verify important information."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AuthGuard>
  );
}

function EmptyState({ setMessage }: { setMessage: (message: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
        <Bot size={28} className="text-indigo-400" />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">
        How can I help you?
      </h2>

      <p className="mt-2 max-w-md text-center text-sm leading-6 text-zinc-500">
        Ask about your orders, tickets, refunds, shipping, or anything else.
        Your AI support assistant can access your account information when
        needed.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        <Suggestion
          title="Order status"
          description="Track my latest order"
          onClick={() => setMessage("What is the status of my order?")}
        />

        <Suggestion
          title="Refund policy"
          description="How do refunds work?"
          onClick={() => setMessage("What is your refund policy?")}
        />

        <Suggestion
          title="My tickets"
          description="Show my support tickets"
          onClick={() => setMessage("Show me my support tickets.")}
        />
      </div>
    </div>
  );
}

function Suggestion({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900"
    >
      <p className="text-sm font-medium text-zinc-200">{title}</p>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </button>
  );
}
