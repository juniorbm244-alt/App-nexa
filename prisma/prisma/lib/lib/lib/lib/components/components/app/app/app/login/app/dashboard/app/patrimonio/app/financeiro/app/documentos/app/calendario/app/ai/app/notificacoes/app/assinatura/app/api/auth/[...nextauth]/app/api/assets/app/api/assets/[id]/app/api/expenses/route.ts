import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expenseSchema = z.object({ category: z.string().min(1).max(60), name: z.string().min(1).max(160), amount: z.number().positive(), date: z.string().datetime(), assetId: z.string().uuid().optional(), recurring: z.boolean().optional() });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const expenses = await prisma.expense.findMany({ where: { userId: (session.user as any).id }, orderBy: { date: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = expenseSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.assetId) {
    const owns = await prisma.asset.findFirst({ where: { id: parsed.data.assetId, userId: (session.user as any).id } });
    if (!owns) return NextResponse.json({ error: "Ativo inválido" }, { status: 400 });
  }
  const expense = await prisma.expense.create({ data: { ...parsed.data, userId: (session.user as any).id } });
  return NextResponse.json(expense, { status: 201 });
}
