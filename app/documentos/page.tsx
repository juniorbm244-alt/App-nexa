"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, AddButton, Modal, Field, Select, SaveButton } from "@/components/ui";
import { THEME as T, fmtBRL, diasAte } from "@/lib/theme";
import { AlertTriangle, FileText } from "lucide-react";

type Doc = { id: string; name: string; category: string; dueDate: string | null };
const CATEGORIAS: [string, string][] = [["Pessoal","Pessoal"],["Imóveis","Imóveis"],["Veículos","Veículos"],["Empresas","Empresas"],["Contratos","Contratos"],["Seguros","Seguros"],["Impostos","Impostos"]];

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Imóveis", dueDate: "" });
  const [loading, setLoading] = useState(true);

  const carregar = () => fetch("/api/documents").then((r) => r.json()).then((d) => { setDocuments(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.name || !form.dueDate) return;
    await fetch("/api/documents", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, category: form.category, dueDate: new Date(form.dueDate).toISOString() }),
    });
    setForm({ name: "", category: "Imóveis", dueDate: "" });
    setOpen(false);
    carregar();
  };

  const ordenados = [...documents].filter((d) => d.dueDate).sort((a, b) => diasAte(a.dueDate!) - diasAte(b.dueDate!));

  return (
    <AppShell>
      <SectionTitle action={<AddButton onClick={() => setOpen(true)}>+ Novo documento</AddButton>}>Documentos</SectionTitle>
      {loading ? (
        <div style={{ color: T.muted }}>Carregando...</div>
      ) : ordenados.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13 }}>Nenhum documento cadastrado ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ordenados.map((d) => {
            const dias = diasAte(d.dueDate!);
            const urgente = dias <= 10;
            return (
              <Card key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {urgente ? <AlertTriangle size={16} color={T.negative} /> : <FileText size={16} color={T.muted} />}
                  <div>
                    <div style={{ fontSize: 14 }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: T.muted }}>{d.category} · vence em {new Date(d.dueDate!).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: urgente ? T.negative : T.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{dias >= 0 ? `${dias}d` : "vencido"}</div>
              </Card>
            );
          })}
        </div>
      )}
      {open && (
        <Modal title="Novo documento" onClose={() => setOpen(false)}>
          <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex.: Seguro do veículo" />
          <Select label="Categoria" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIAS} />
          <Field label="Vencimento" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
          <SaveButton onClick={salvar}>Salvar</SaveButton>
        </Modal>
      )}
    </AppShell>
  );
}
