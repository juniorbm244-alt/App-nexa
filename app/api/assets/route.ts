import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assetSchema = z.object({
  type: z.enum(["IMOVEL", "VEICULO", "EMPRESA", "INVESTIMENTO"]),
  name: z.string().min(1).max(160),
  estimatedValue: z.number().positive(),
  purchaseValue: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const assets = await prisma.asset.findMany({ where: { userId: (session.user as any).id }, orderBy: { estimatedValue: "desc" } });
  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await req.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  const asset = await prisma.asset.create({ data: { ...parsed.data, userId: (session.user as any).id } });
  return NextResponse.json(asset, { status: 201 });
}
