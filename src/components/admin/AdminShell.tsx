"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDashboard,
  IconServices,
  IconProjects,
  IconTeam,
  IconGallery,
  IconQuotation,
  IconUnits,
  IconSettings,
  IconInquiries,
  IconLogOut,
  IconMenu,
  IconX,
} from "./Icons";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: IconDashboard },
  { name: "Inquiries", href: "/admin/inquiries", icon: IconInquiries },
  { name: "Services", href: "/admin/services", icon: IconServices },
  { name: "Projects", href: "/admin/projects", icon: IconProjects },
  { name: "Team Members", href: "/admin/team", icon: IconTeam },
  { name: "Media Gallery", href: "/admin/gallery", icon: IconGallery },
  { name: "Quotation Rates", href: "/admin/quotation", icon: IconQuotation },
  { name: "Units", href: "/admin/units", icon: IconUnits },
  { name: "Website Settings", href: "/admin/settings", icon: IconSettings },
];


export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    fullName: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch authenticated admin details
  useEffect(() => {
    let isMounted = true;
    async function loadAdminUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setAdminUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to load admin user:", err);
      }
    }
    loadAdminUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] flex flex-col md:flex-row">
      {/* ========================================================================= */}
      {/* MOBILE TOPBAR */}
      {/* ========================================================================= */}
      <div className="md:hidden flex items-center justify-between border-b border-[#2B313D] bg-[#14171C] px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-widest text-[#C5A869]">MAYA</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            CMS
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#14171C] border-r border-[#2B313D] p-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#2B313D]">
              <span className="text-xl font-bold tracking-widest text-[#C5A869]">MAYA</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 py-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-[#C5A869]/15 text-[#C5A869] border-l-2 border-[#C5A869]"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-[#2B313D]">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                <IconLogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-[#2B313D] bg-[#14171C] sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2B313D]">
          <Link href="/admin/dashboard" className="block">
            <h1 className="text-2xl font-black tracking-widest text-[#C5A869]">MAYA</h1>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
              Design & Build • Admin CMS
            </p>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-[#C5A869]/15 text-[#C5A869] font-semibold border-l-3 border-[#C5A869]"
                    : "text-neutral-400 hover:text-white hover:bg-[#1D2128]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#C5A869]" : "text-neutral-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-[#2B313D] bg-[#0F1115]">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-white truncate">
                {adminUser?.fullName || "Administrator"}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                {adminUser?.email || "admin@mayadesignandbuild.com"}
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C5A869]/20 text-[#C5A869]">
              {adminUser?.role || "Admin"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-800 hover:bg-red-500/20 hover:border-red-500/40 border border-transparent rounded-lg transition"
          >
            <IconLogOut className="w-4 h-4 text-red-400" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[#2B313D] bg-[#14171C]/50 backdrop-blur-xs sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-neutral-200 capitalize font-medium">
              {pathname.replace("/admin/", "").replace("/", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
