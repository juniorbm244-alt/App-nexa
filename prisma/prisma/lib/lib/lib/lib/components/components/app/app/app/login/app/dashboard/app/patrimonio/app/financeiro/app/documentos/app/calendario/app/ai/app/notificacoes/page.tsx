"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui";
import { THEME as T } from "@/lib/theme";
import { AlertTriangle, TrendingDown, RefreshCw, Bell } from "lucide-react";

type Notification = { id: string; type: string; title: string; body: string; read: boolean; createdAt: string };
const ICON_BY_TYPE: Record<string, any> = { DOCUMENT_DUE: AlertTriangle, EXPENSE_ANOMALY: TrendingDown, NET_WORTH_DROP: TrendingDown, SUBSCRIPTION: RefreshCw };

export default function NotificacoesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => fetch("/api/notifications").then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { carregar(); }, []);

  const marcarLida = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
  };

  return (
    <AppShell>
      <SectionTitle>Notificações</SectionTitle>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : items.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><Bell size={16} /> Nenhuma notificação por enquanto.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((n) => {
            const Icon = ICON_BY_TYPE[n.type] || Bell;
            return (
              <Card key={n.id} onClick={() => !n.read && marcarLida(n.id)} style={{ display: "flex", gap: 12, padding: "14px 18px", cursor: n.read ? "default" : "pointer", opacity: n.read ? 0.6 : 1, border: n.read ? `1px solid ${T.hair}` : `1px solid ${T.accent}` }}>
                <Icon size={16} color={n.read ? T.muted : T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13.5 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{n.body}</div>
                  <div style={{ fontSize: 10.5, color: T.muted, marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString("pt-BR")}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
