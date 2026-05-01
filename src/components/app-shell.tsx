"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◩" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/leads", label: "Leads", icon: "↗" },
  { href: "/appointments", label: "Appointments", icon: "📅" },
  { href: "/call-logs", label: "Call Logs", icon: "📞" },
  { href: "/ai-receptionist", label: "AI Receptionist", icon: "🤖" },
];

type Profile = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
};

export function AppShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isUserLoaded) return;

    if (!isSignedIn) {
      setProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    void fetch("/api/users/profile")
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
      })
      .catch(() => setProfile(null))
      .finally(() => setIsLoadingProfile(false));
  }, [isSignedIn, isUserLoaded]);

  // Determine the display name
  const businessName = profile?.businessName || (isLoadingProfile ? "" : "Solomon's Logic");
  const userLabel =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : profile?.email ?? (isLoadingProfile ? "Loading..." : "Signed in");

  return (
    <div className="min-h-screen bg-[#11131b] text-zinc-100">
      <div className="flex min-h-screen">
        {isSignedIn && (
          <aside className="flex w-[258px] shrink-0 flex-col border-r border-white/5 bg-[#151826]">
            <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-[#5b7cfa] text-white shadow-lg shadow-blue-500/20">
                <span className="text-sm font-bold">
                  {businessName ? businessName.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold leading-none min-h-[1em]">
                  {businessName || <div className="h-4 w-24 animate-pulse rounded bg-white/5" />}
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                        active
                          ? "bg-[#355cc9] text-white shadow-lg shadow-blue-500/15"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                      ].join(" ")}
                    >
                      <span className="text-[13px] opacity-80">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-white/5 p-3">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-sm font-medium">
                  {businessName || <div className="h-4 w-20 animate-pulse rounded bg-white/10" />}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {isLoadingProfile ? "Loading..." : userLabel}
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1">
          <div className="border-b border-white/5 bg-[#121521] px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {isSignedIn && (
                  <>
                    <h1 className="text-[23px] font-semibold tracking-tight">{title}</h1>
                    {subtitle ? (
                      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isSignedIn && action ? <div>{action}</div> : null}

                {!isUserLoaded || isLoadingProfile ? (
                   <div className="h-9 w-20 animate-pulse rounded-md bg-white/5" />
                ) : !isSignedIn ? (
                  <SignInButton mode="modal">
                    <button className="rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-white/10">
                      Sign in
                    </button>
                  </SignInButton>
                ) : (
                  <>
                    <SignOutButton>
                      <button className="rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-white/10">
                        Sign out
                      </button>
                    </SignOutButton>
                       <div className="rounded-md bg-white/5 px-1 py-1">
                     <UserButton />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {isSignedIn ? (
              children
            ) : (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl mb-4">
                  🔒
                </div>
                <h2 className="text-xl font-semibold">Protected Area</h2>
                <p className="mt-2 text-zinc-500 max-w-xs">
                  Please sign in to your Solomon's Logic account to access the CRM and your appointments.
                </p>
                <div className="mt-6">
                  <SignInButton mode="modal">
                    <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">
                      Sign in to Solomon's Logic
                    </button>
                  </SignInButton>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  subvalue,
  icon,
}: {
  label: string;
  value: string | number;
  subvalue?: string;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#262942] p-5 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] text-zinc-400">{label}</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight">{value}</div>
          {subvalue ? <div className="mt-1 text-xs text-zinc-500">{subvalue}</div> : null}
        </div>
        {icon ? (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-zinc-300">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/5 bg-[#1b1e2e] ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#1b1e2e] px-5 py-10 text-center">
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
