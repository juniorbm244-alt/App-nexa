"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui";
import { THEME as T, TIPO_LABEL, fmtBRL, diasAte } from "@/lib/theme";

type Asset = { id: string; type: string; name: string; estimatedValue: string };
type Document = { id: string; name: string; category: string; dueDate: string | null };

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, d] = await Promise.all([
        fetch("/api/assets").then((r) => r.json()),
        fetch("/api/documents").then((r) => r.json()),
      ]);
      setAssets(Array.isArray(a) ? a : []);
      setDocuments(Array.isArray(d) ? d : []);
      setLoading(false);
    })();
  }, []);

  const total = assets.reduce((s, a) => s + Number(a.estimatedValue), 0);
  const porTipo = Object.keys(TIPO_LABEL).map((tipo) => ({
    tipo, total: assets.filter((a) => a.type === tipo).reduce((s, a) => s + Number(a.estimatedValue), 0),
  }));
  const obrigacoes = documents.filter((d) => d.dueDate).sort((a, b) => diasAte(a.dueDate!) - diasAte(b.dueDate!)).slice(0, 4);

  return (
    <AppShell>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : (
        <div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>Patrimônio total</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 46 }}>{fmtBRL(total)}</div>
          </div>
          <div className="nexa-grid4" style={{ marginBottom: 24 }}>
            {porTipo.map(({ tipo, total }) => (
              <Card key={tipo} style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{TIPO_LABEL[tipo]}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16 }}>{fmtBRL(total)}</div>
              </Card>
            ))}
          </div>
          <Card>
            <SectionTitle>Obrigações próximas</SectionTitle>
            {obrigacoes.length === 0 && <div style={{ color: T.muted, fontSize: 13 }}>Nenhum documento com vencimento cadastrado ainda.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {obrigacoes.map((d) => {
                const dias = diasAte(d.dueDate!);
                return (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: dias <= 10 ? T.negative : T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{dias}d</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
