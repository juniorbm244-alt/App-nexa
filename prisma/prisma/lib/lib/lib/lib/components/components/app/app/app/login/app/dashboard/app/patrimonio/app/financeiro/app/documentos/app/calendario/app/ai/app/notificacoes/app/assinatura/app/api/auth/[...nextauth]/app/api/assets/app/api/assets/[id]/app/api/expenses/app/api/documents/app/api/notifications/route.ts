import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const notifications = await prisma.notification.findMany({ where: { userId: (session.user as any).id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(notifications);
}

const markReadSchema = z.object({ ids: z.array(z.string().uuid()) });

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = markReadSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  await prisma.notification.updateMany({ where: { id: { in: parsed.data.ids }, userId: (session.user as any).id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
