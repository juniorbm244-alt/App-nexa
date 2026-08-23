"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, AddButton, Modal, Field, Select, SaveButton } from "@/components/ui";
import { THEME as T, fmtBRL } from "@/lib/theme";

type Expense = { id: string; category: string; name: string; amount: string; date: string };
const CATEGORIAS: [string, string][] = [["Imóveis","Imóveis"],["Veículos","Veículos"],["Empresa","Empresa"],["Impostos","Impostos"],["Seguros","Seguros"],["Outros","Outros"]];

export default function FinanceiroPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Imóveis", name: "", amount: "", date: "" });
  const [loading, setLoading] = useState(true);

  const carregar = () => fetch("/api/expenses").then((r) => r.json()).then((d) => { setExpenses(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.name || !form.amount) return;
    await fetch("/api/expenses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: form.category, name: form.name, amount: Number(form.amount), date: new Date(form.date || Date.now()).toISOString() }),
    });
    setForm({ category: "Imóveis", name: "", amount: "", date: "" });
    setOpen(false);
    carregar();
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <AppShell>
      <SectionTitle action={<AddButton onClick={() => setOpen(true)}>+ Nova despesa</AddButton>}>Financeiro — {fmtBRL(total)}</SectionTitle>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : expenses.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13 }}>Nenhuma despesa cadastrada ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {expenses.map((e) => (
            <Card key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
              <div>
                <div style={{ fontSize: 13.5 }}>{e.name}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{e.category} · {new Date(e.date).toLocaleDateString("pt-BR")}</div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5 }}>{fmtBRL(e.amount)}</div>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title="Nova despesa" onClose={() => setOpen(false)}>
          <Select label="Categoria" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIAS} />
          <Field label="Descrição" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex.: Condomínio" />
          <Field label="Valor (R$)" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="0" />
          <Field label="Data" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          <SaveButton onClick={salvar}>Salvar</SaveButton>
        </Modal>
      )}
    </AppShell>
  );
}
