export const THEME = {
  bg: "#0B0D0F", surface: "#14171A", surface2: "#1B1F23", hair: "#25292E",
  ink: "#EDEAE4", muted: "#8C8F94",
  accent: "#C7A06B", positive: "#5DA085", negative: "#C2695A",
};

export const TIPO_LABEL: Record<string, string> = {
  IMOVEL: "Imóveis", VEICULO: "Veículos", EMPRESA: "Empresas", INVESTIMENTO: "Investimentos",
};

export function fmtBRL(v: number | string | null | undefined) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function diasAte(dateStr: string) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dateStr);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}
