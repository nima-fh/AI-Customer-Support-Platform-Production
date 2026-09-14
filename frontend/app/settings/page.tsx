"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  Check,
  LogOut,
  Mail,
  Shield,
  UserRound,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { getMe, Me } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiSupport, setAiSupport] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const me = await getMe();

        if (cancelled) return;

        setUser(me);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load settings:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSave() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold">Settings</h1>

              <p className="mt-1 text-sm text-zinc-400">
                Manage your account and support preferences.
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-40 animate-pulse rounded-2xl bg-zinc-900"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
                  <div className="border-b border-zinc-800 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                        <UserRound className="h-5 w-5 text-zinc-400" />
                      </div>

                      <div>
                        <h2 className="font-medium">Profile</h2>

                        <p className="text-sm text-zinc-500">
                          Your account information
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 sm:grid-cols-2">
                    <InfoField
                      icon={<UserRound className="h-4 w-4" />}
                      label="Name"
                      value={user?.name || "Customer"}
                    />

                    <InfoField
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={user?.email || "—"}
                    />

                  </div>
                </section>

                {/* Notifications */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
                  <div className="border-b border-zinc-800 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                        <Bell className="h-5 w-5 text-zinc-400" />
                      </div>

                      <div>
                        <h2 className="font-medium">Notifications</h2>

                        <p className="text-sm text-zinc-500">
                          Control how you receive updates
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-800">
                    <SettingRow
                      icon={<Mail className="h-4 w-4" />}
                      title="Email notifications"
                      description="Receive updates about your tickets and support requests."
                      enabled={emailNotifications}
                      onChange={setEmailNotifications}
                    />

                    <SettingRow
                      icon={<Bell className="h-4 w-4" />}
                      title="Support updates"
                      description="Get notified when an agent responds to your request."
                      enabled={emailNotifications}
                      onChange={setEmailNotifications}
                    />
                  </div>
                </section>

                {/* AI Support */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
                  <div className="border-b border-zinc-800 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                        <Bot className="h-5 w-5 text-zinc-400" />
                      </div>

                      <div>
                        <h2 className="font-medium">AI Support</h2>

                        <p className="text-sm text-zinc-500">
                          Configure your AI support experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-800">
                    <SettingRow
                      icon={<Bot className="h-4 w-4" />}
                      title="AI assistance"
                      description="Allow the AI assistant to help resolve your support requests."
                      enabled={aiSupport}
                      onChange={setAiSupport}
                    />
                  </div>
                </section>

                {/* Security */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
                  <div className="border-b border-zinc-800 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                        <Shield className="h-5 w-5 text-zinc-400" />
                      </div>

                      <div>
                        <h2 className="font-medium">Account</h2>

                        <p className="text-sm text-zinc-500">
                          Manage your account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </section>

                {/* Save */}
                <div className="flex items-center justify-end gap-3">
                  {saved && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4" />
                      Settings saved
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    Save Changes
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

function InfoField({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
        {icon}
        {label}
      </p>

      <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
        {value}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="mt-0.5 text-zinc-500">{icon}</div>

        <div>
          <h3 className="text-sm font-medium text-zinc-200">{title}</h3>

          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-label={`${title}: ${enabled ? "enabled" : "disabled"}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-white" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition ${
            enabled ? "left-6 bg-black" : "left-1 bg-zinc-400"
          }`}
        />
      </button>
    </div>
  );
}
