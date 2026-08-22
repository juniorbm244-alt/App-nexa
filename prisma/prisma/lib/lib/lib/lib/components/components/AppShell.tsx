"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutGrid, Wallet, Landmark, FileText, Calendar, MessageCircle, LogOut, Bell, CreditCard } from "lucide-react";
import { THEME as T } from "@/lib/theme";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutGrid },
  { href: "/patrimonio", label: "Patrimônio", icon: Wallet },
  { href: "/financeiro", label: "Financeiro", icon: Landmark },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/calendario", label: "Calendário", icon: Calendar },
  { href: "/ai", label: "NEXA AI", icon: MessageCircle },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <link rel="stylesheet" href={FONT_LINK} />
      <GlobalStyles />
      <div className="nexa-sidebar" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 220, background: T.surface, borderRight: `1px solid ${T.hair}`, padding: "28px 16px", display: "flex", flexDirection: "column", zIndex: 40 }}>
        <div className="nexa-sidebar-logo" style={{ fontFamily: "'Fraunces', serif", fontSize: 22, padding: "0 8px", marginBottom: 34 }}>NEXA</div>
        <div className="nexa-sidebar-items" style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href;
            return (
              <Link key={it.href} href={it.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, textDecoration: "none", fontSize: 13.5, background: active ? T.surface2 : "transparent", color: active ? T.ink : T.muted, fontWeight: active ? 600 : 400 }}>
                <Icon size={16} strokeWidth={1.8} /> <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="nexa-sidebar-footer" style={{ borderTop: `1px solid ${T.hair}`, paddingTop: 14 }}>
          <div style={{ fontSize: 12.5, color: T.muted, padding: "0 10px 10px" }}>{session?.user?.name || session?.user?.email}</div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 12.5, padding: "6px 10px", fontFamily: "inherit" }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
      <main className="nexa-main">{children}</main>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      .nexa-main { margin-left: 220px; padding: 36px 40px 80px; max-width: 980px; }
      .nexa-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .nexa-grid2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
      @media (max-width: 760px) {
        .nexa-sidebar { position: fixed !important; top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 64px; flex-direction: row !important; align-items: center; padding: 0 6px !important; border-right: none !important; overflow-x: auto; z-index: 40; }
        .nexa-sidebar-logo, .nexa-sidebar-footer { display: none !important; }
        .nexa-sidebar-items { flex-direction: row !important; flex: 1; justify-content: space-around; }
        .nexa-sidebar-items a { flex-direction: column !important; gap: 3px !important; font-size: 10px !important; padding: 6px 4px !important; }
        .nexa-sidebar-items a span { display: none; }
        .nexa-main { margin-left: 0 !important; padding: 20px 16px 88px !important; max-width: 100% !important; }
        .nexa-grid4 { grid-template-columns: repeat(2, 1fr) !important; }
        .nexa-grid2 { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}
