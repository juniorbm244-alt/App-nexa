import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({ name: z.string().min(1).max(160).optional(), estimatedValue: z.number().positive().optional(), notes: z.string().max(500).optional() });

async function ownedAssetOrNull(id: string, userId: string) { return prisma.asset.findFirst({ where: { id, userId } }); }

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const owned = await ownedAssetOrNull(params.id, (session.user as any).id);
  if (!owned) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  const updated = await prisma.asset.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const owned = await ownedAssetOrNull(params.id, (session.user as any).id);
  if (!owned) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  await prisma.asset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
