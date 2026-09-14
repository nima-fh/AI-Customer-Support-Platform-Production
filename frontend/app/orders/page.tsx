"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Package, RefreshCw, ShoppingBag } from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { getMe, getOrders, Order } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const [me, data] = await Promise.all([getMe(), getOrders()]);

      setCustomerName(me.name);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOrders() {
      try {
        const [me, data] = await Promise.all([getMe(), getOrders()]);

        if (cancelled) return;

        setCustomerName(me.name);
        setOrders(data);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load orders:", error);
        setError("Unable to load your orders.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  return (
    <AuthGuard>
      <main className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar
          role="customer"
          customerName={customerName}
          onLogout={handleLogout}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-5 md:px-8">
            <div>
              <h1 className="text-sm font-semibold">Orders</h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                View and track your orders
              </p>
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 px-5 py-8 md:px-8">
            <div className="mx-auto max-w-5xl">
              {/* Page title */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                    <ShoppingBag size={20} className="text-indigo-400" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">Your Orders</h2>
                    <p className="text-sm text-zinc-500">
                      {orders.length} {orders.length === 1 ? "order" : "orders"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50"
                    />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                    <Package size={22} className="text-zinc-500" />
                  </div>

                  <h3 className="mt-4 text-sm font-medium">No orders yet</h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                    You don&apos;t have any orders associated with your account.
                  </p>
                </div>
              ) : (
                /* Orders */
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </AuthGuard>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/orders/${order.id}`)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
        <Package size={20} className="text-zinc-400" />
      </div>

      {/* Main information */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-zinc-200">Order #{order.id}</p>

          <StatusBadge status={order.status} />
        </div>

        <p className="mt-1 text-xs text-zinc-500">
          Customer #{order.customer_id}
        </p>
      </div>

      {/* Amount */}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-zinc-200">
          ${Number(order.total_price).toFixed(2)}
        </p>

        <p className="mt-1 text-[11px] text-zinc-600">Total</p>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={18}
        className="shrink-0 text-zinc-600 transition group-hover:text-zinc-400"
      />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles =
    normalizedStatus === "shipped"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : normalizedStatus === "pending"
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
        : normalizedStatus === "delivered"
          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
          : normalizedStatus === "cancelled"
            ? "border-red-500/20 bg-red-500/10 text-red-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-400";

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
