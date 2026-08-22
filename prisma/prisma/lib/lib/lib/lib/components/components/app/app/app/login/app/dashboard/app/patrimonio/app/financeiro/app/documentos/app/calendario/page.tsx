"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui";
import { THEME as T, diasAte } from "@/lib/theme";

type Doc = { id: string; name: string; category: string; dueDate: string | null };

export default function CalendarioPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then((d) => { setDocuments(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const eventos = [...documents].filter((d) => d.dueDate).sort((a, b) => diasAte(a.dueDate!) - diasAte(b.dueDate!));

  return (
    <AppShell>
      <SectionTitle>Calendário financeiro</SectionTitle>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : eventos.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13 }}>Nenhum evento cadastrado ainda — adicione documentos com vencimento na tela de Documentos.</div>
      ) : (
        <div>
          {eventos.map((e, i) => (
            <div key={e.id} style={{ display: "flex", gap: 16, padding: "14px 4px", borderBottom: i < eventos.length - 1 ? `1px solid ${T.hair}` : "none" }}>
              <div style={{ width: 64, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.muted, paddingTop: 2 }}>
                {new Date(e.dueDate!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </div>
              <div>
                <div style={{ fontSize: 13.5 }}>{e.name}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{e.category}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
