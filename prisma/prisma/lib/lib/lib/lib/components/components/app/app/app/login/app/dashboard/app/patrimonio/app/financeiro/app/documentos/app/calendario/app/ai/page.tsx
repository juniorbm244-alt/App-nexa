"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui";
import { THEME as T } from "@/lib/theme";
import { Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: "Olá. Posso responder sobre o seu patrimônio, despesas e vencimentos cadastrados. O que você quer saber?" }]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  const enviar = async (texto: string) => {
    if (!texto.trim() || enviando) return;
    setMessages((m) => [...m, { role: "user", text: texto }]);
    setInput("");
    setEnviando(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: texto, conversationId }) });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", text: data.reply || "Não consegui responder agora." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Houve um erro ao consultar seus dados. Tente novamente." }]);
    } finally { setEnviando(false); }
  };

  const suggestions = ["Qual meu patrimônio total?", "Quais contas vencem em breve?", "Qual foi minha maior despesa?"];

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 116px)" }}>
        <SectionTitle>NEXA AI</SectionTitle>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? T.accent : T.surface, color: m.role === "user" ? "#12100A" : T.ink, border: m.role === "user" ? "none" : `1px solid ${T.hair}`, borderRadius: 12, padding: "10px 14px", maxWidth: "72%", fontSize: 13.5, lineHeight: 1.5 }}>{m.text}</div>
          ))}
          {enviando && <div style={{ color: T.muted, fontSize: 12.5 }}>Consultando seus dados...</div>}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => enviar(s)} style={{ background: T.surface2, border: `1px solid ${T.hair}`, borderRadius: 20, padding: "6px 12px", fontSize: 11.5, color: T.muted, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar(input)} placeholder="Pergunte sobre seu patrimônio..."
            style={{ flex: 1, background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 10, color: T.ink, padding: "11px 14px", fontSize: 13.5, outline: "none", fontFamily: "inherit" }} />
          <button onClick={() => enviar(input)} style={{ background: T.accent, border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", color: "#12100A" }}><Send size={16} /></button>
        </div>
      </div>
    </AppShell>
  );
}
