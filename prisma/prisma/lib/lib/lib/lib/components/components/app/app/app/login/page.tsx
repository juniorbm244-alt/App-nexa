"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { THEME as T } from "@/lib/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const entrarComCredenciais = async () => {
    setErro("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setErro("E-mail ou senha inválidos.");
    else window.location.href = "/dashboard";
  };

  const socialBtn = (bg: string, color: string): React.CSSProperties => ({
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
    background: bg, color, border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginBottom: 10, fontFamily: "inherit",
  });

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "24px 0" }}>
      <div style={{ width: 340, maxWidth: "90vw", textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, marginBottom: 6 }}>NEXA</div>
        <div style={{ color: T.muted, fontSize: 13, marginBottom: 32 }}>Tudo o que importa para o seu patrimônio. Em um só lugar.</div>

        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} style={socialBtn("#FFFFFF", "#1F1F1F")}>Continuar com Google</button>
        <button onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })} style={socialBtn("#1877F2", "#FFFFFF")}>Continuar com Facebook</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0", color: T.muted, fontSize: 11 }}>
          <div style={{ flex: 1, height: 1, background: T.hair }} /> ou <div style={{ flex: 1, height: 1, background: T.hair }} />
        </div>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" type="email"
          style={{ width: "100%", background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 10, color: T.ink, padding: "12px 14px", fontSize: 14, outline: "none", marginBottom: 10, fontFamily: "inherit" }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" onKeyDown={(e) => e.key === "Enter" && entrarComCredenciais()}
          style={{ width: "100%", background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 10, color: T.ink, padding: "12px 14px", fontSize: 14, outline: "none", marginBottom: 14, fontFamily: "inherit" }} />

        {erro && <div style={{ color: T.negative, fontSize: 12, marginBottom: 10 }}>{erro}</div>}

        <button onClick={entrarComCredenciais} style={{ width: "100%", background: T.accent, color: "#12100A", border: "none", borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Entrar</button>
      </div>
    </div>
  );
}
