"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui";
import { THEME as T } from "@/lib/theme";
import { Check } from "lucide-react";

const PLANOS = [
  { id: "essential", nome: "Essential", preco: "R$ 79/mês", destaque: false, recursos: ["Cadastro de patrimônio", "Despesas e receitas", "Documentos e alertas", "Calendário financeiro"] },
  { id: "premium", nome: "Premium", preco: "R$ 199/mês", destaque: true, recursos: ["Tudo do Essential", "NEXA AI ilimitado", "Relatórios avançados", "Alertas de anomalia de gastos"] },
  { id: "private", nome: "Private", preco: "R$ 499/mês", destaque: false, recursos: ["Tudo do Premium", "Usuários autorizados (contador, advogado)", "Suporte prioritário", "Experiência concierge"] },
];

export default function AssinaturaPage() {
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const assinar = async (plano: string) => {
    setErro(""); setCarregando(plano);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plano }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setErro("Não foi possível iniciar o pagamento. Tente novamente.");
    } catch { setErro("Não foi possível iniciar o pagamento. Tente novamente."); } finally { setCarregando(null); }
  };

  return (
    <AppShell>
      <SectionTitle>Assinatura</SectionTitle>
      {erro && <div style={{ color: T.negative, fontSize: 13, marginBottom: 14 }}>{erro}</div>}
      <div className="nexa-grid4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {PLANOS.map((p) => (
          <Card key={p.id} style={{ padding: 22, border: p.destaque ? `1px solid ${T.accent}` : `1px solid ${T.hair}`, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.nome}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, marginTop: 6, color: T.accent }}>{p.preco}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {p.recursos.map((r) => (
                <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: T.muted }}><Check size={14} color={T.accent} style={{ marginTop: 2, flexShrink: 0 }} /> {r}</div>
              ))}
            </div>
            <button onClick={() => assinar(p.id)} disabled={carregando === p.id} style={{ background: p.destaque ? T.accent : "transparent", color: p.destaque ? "#12100A" : T.ink, border: p.destaque ? "none" : `1px solid ${T.hair}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {carregando === p.id ? "Redirecionando..." : "Assinar"}
            </button>
          </Card>
        ))}
      </div>
      <div style={{ color: T.muted, fontSize: 11.5, marginTop: 16 }}>Preços de referência — ainda não validados com o mercado. Pagamento processado com segurança pelo Stripe.</div>
    </AppShell>
  );
}
