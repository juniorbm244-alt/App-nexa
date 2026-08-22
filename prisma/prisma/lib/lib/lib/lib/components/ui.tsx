"use client";
import React from "react";
import { X } from "lucide-react";
import { THEME as T } from "@/lib/theme";

export function Card({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: T.muted, letterSpacing: 0.4, textTransform: "uppercase" }}>{children}</div>
      {action}
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, color: "#12100A", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 14, padding: 24, width: 360, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: T.surface2, border: `1px solid ${T.hair}`, borderRadius: 8, color: T.ink, padding: "9px 11px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 5 }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: T.surface2, border: `1px solid ${T.hair}`, borderRadius: 8, color: T.ink, padding: "9px 11px", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
        {options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </div>
  );
}

export function SaveButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, background: T.accent, color: "#12100A", border: "none", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
      {children}
    </button>
  );
}
