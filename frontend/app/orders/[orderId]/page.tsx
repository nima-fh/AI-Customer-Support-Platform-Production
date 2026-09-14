"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, ShoppingBag, Headphones } from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { getOrder, Order } from "@/lib/api";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = Number(params.orderId);

  async function loadOrder() {
    if (!orderId || Number.isNaN(orderId)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
      setError("Unable to load this order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOrder() {
      if (!orderId || Number.isNaN(orderId)) {
        if (!cancelled) {
          setError("Invalid order ID.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getOrder(orderId);

        if (cancelled) return;

        setOrder(data);
        setError("");
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load order:", error);
        setError("Unable to load this order.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push("/orders")}
                  className="mb-4 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </button>

                <h1 className="text-3xl font-semibold">Order Details</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  View information about your order.
                </p>
              </div>

              <button
                onClick={loadOrder}
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
                <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
                <p className="text-sm text-red-400">{error}</p>

                <button
                  onClick={loadOrder}
                  className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Order */}
            {!loading && !error && order && (
              <div className="space-y-6">
                {/* Main order card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                        <ShoppingBag className="h-6 w-6 text-zinc-300" />
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400">Order</p>
                        <h2 className="text-xl font-semibold">#{order.id}</h2>
                      </div>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h2 className="mb-6 text-lg font-semibold">
                    Order Information
                  </h2>

                  <div className="divide-y divide-zinc-800">
                    <DetailRow label="Order ID" value={`#${order.id}`} />

                    <DetailRow
                      label="Customer ID"
                      value={`#${order.customer_id}`}
                    />

                    <DetailRow label="Status" value={order.status} />

                    <DetailRow
                      label="Total"
                      value={`$${Number(order.total_price).toFixed(2)}`}
                    />
                  </div>
                </div>

                {/* Support */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div>
                    <h2 className="font-semibold">Need help?</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Contact our AI support team about this order.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    <Headphones className="h-4 w-4" />
                    Contact Support
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium capitalize text-zinc-300">
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
