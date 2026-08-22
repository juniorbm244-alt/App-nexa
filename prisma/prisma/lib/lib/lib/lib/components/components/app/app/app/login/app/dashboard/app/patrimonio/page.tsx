"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, AddButton, Modal, Field, Select, SaveButton } from "@/components/ui";
import { THEME as T, TIPO_LABEL, fmtBRL } from "@/lib/theme";
import { Trash2 } from "lucide-react";

type Asset = { id: string; type: string; name: string; estimatedValue: string; notes?: string };

export default function PatrimonioPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "IMOVEL", name: "", estimatedValue: "", notes: "" });
  const [loading, setLoading] = useState(true);

  const carregar = () => fetch("/api/assets").then((r) => r.json()).then((d) => { setAssets(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.name || !form.estimatedValue) return;
    await fetch("/api/assets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: form.type, name: form.name, estimatedValue: Number(form.estimatedValue), notes: form.notes || undefined }),
    });
    setForm({ type: "IMOVEL", name: "", estimatedValue: "", notes: "" });
    setOpen(false);
    carregar();
  };

  const remover = async (id: string) => { await fetch(`/api/assets/${id}`, { method: "DELETE" }); carregar(); };

  return (
    <AppShell>
      <SectionTitle action={<AddButton onClick={() => setOpen(true)}>+ Adicionar</AddButton>}>Patrimônio</SectionTitle>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : assets.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13 }}>Nenhum item cadastrado ainda. Clique em "Adicionar" para começar.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assets.map((a) => (
            <Card key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
              <div>
                <div style={{ fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{TIPO_LABEL[a.type]}{a.notes ? ` · ${a.notes}` : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>{fmtBRL(a.estimatedValue)}</div>
                <button onClick={() => remover(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title="Adicionar patrimônio" onClose={() => setOpen(false)}>
          <Select label="Tipo" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={Object.entries(TIPO_LABEL) as [string, string][]} />
          <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex.: Apartamento — Jardins" />
          <Field label="Valor estimado (R$)" type="number" value={form.estimatedValue} onChange={(v) => setForm({ ...form, estimatedValue: v })} placeholder="0" />
          <Field label="Observação (opcional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="" />
          <SaveButton onClick={salvar}>Salvar</SaveButton>
        </Modal>
      )}
    </AppShell>
  );
}
