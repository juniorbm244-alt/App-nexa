import { prisma } from "@/lib/prisma";

export async function montarContextoDoUsuario(userId: string) {
  const [assets, expenses, documents] = await Promise.all([
    prisma.asset.findMany({ where: { userId } }),
    prisma.expense.findMany({ where: { userId, date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } }, orderBy: { date: "desc" } }),
    prisma.document.findMany({ where: { userId, dueDate: { not: null } }, orderBy: { dueDate: "asc" } }),
  ]);

  const totalPatrimonio = assets.reduce((s, a) => s + Number(a.estimatedValue), 0);
  const porTipo: Record<string, number> = {};
  for (const a of assets) porTipo[a.type] = (porTipo[a.type] || 0) + Number(a.estimatedValue);

  const hoje = new Date();
  const proximosVencimentos = documents.filter((d) => d.dueDate! >= hoje).slice(0, 10).map((d) => ({
    nome: d.name, categoria: d.category, diasRestantes: Math.round((d.dueDate!.getTime() - hoje.getTime()) / 86_400_000),
  }));

  const despesasPorCategoria: Record<string, number> = {};
  for (const e of expenses) despesasPorCategoria[e.category] = (despesasPorCategoria[e.category] || 0) + Number(e.amount);

  return {
    patrimonioTotal: totalPatrimonio,
    patrimonioPorTipo: porTipo,
    ativos: assets.map((a) => ({ nome: a.name, tipo: a.type, valor: Number(a.estimatedValue) })),
    despesasUltimos6Meses: expenses.map((e) => ({ nome: e.name, categoria: e.category, valor: Number(e.amount), data: e.date.toISOString().slice(0, 10) })),
    despesasPorCategoria,
    proximosVencimentos,
  };
}
