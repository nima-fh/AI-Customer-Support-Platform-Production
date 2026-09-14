"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRound, Mail, Users, RefreshCw } from "lucide-react";

import AgentAuthGuard from "../../../components/AgentAuthGuard";
import { Customer, getCustomers } from "../../../lib/api";

export default function AgentCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        const data = await getCustomers();

        if (cancelled) return;

        setCustomers(data);
        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load customers:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load customers",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        String(customer.id).includes(query),
    );
  }, [customers, search]);

  const handleRefresh = async () => {
    try {
      setError("");

      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to refresh customers:", err);

      setError(
        err instanceof Error ? err.message : "Failed to refresh customers",
      );
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
            <header className="border-b border-white/10 px-6 py-6 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Customers</h1>

                  <p className="mt-1 text-sm text-white/40">
                    View and manage customer information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
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
              {/* Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/40">Total Customers</p>

                      <p className="mt-2 text-2xl font-semibold">
                        {customers.length}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Users className="h-5 w-5 text-white/60" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/40">Search Results</p>

                      <p className="mt-2 text-2xl font-semibold">
                        {filteredCustomers.length}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Search className="h-5 w-5 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, email, or customer ID..."
                    className="w-full rounded-xl border border-white/10 bg-[#0c0d10] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-12 text-center">
                  <RefreshCw className="mx-auto h-5 w-5 animate-spin text-white/40" />

                  <p className="mt-3 text-sm text-white/40">
                    Loading customers...
                  </p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-12 text-center">
                  <Users className="mx-auto h-8 w-8 text-white/20" />

                  <p className="mt-4 text-sm text-white/50">
                    {search
                      ? "No customers match your search."
                      : "No customers found."}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0d10]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-sm font-semibold">Customer List</h2>
                  </div>

                  <div className="divide-y divide-white/10">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() =>
                          router.push(`/agent/customers/${customer.id}`)
                        }
                        className="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                            <UserRound className="h-4 w-4 text-white/50" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {customer.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                              <Mail className="h-3.5 w-3.5" />

                              <span className="truncate">{customer.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-xs text-white/30">Customer ID</p>

                          <p className="mt-1 text-sm text-white/60">
                            #{customer.id}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </AgentAuthGuard>
  );
}
