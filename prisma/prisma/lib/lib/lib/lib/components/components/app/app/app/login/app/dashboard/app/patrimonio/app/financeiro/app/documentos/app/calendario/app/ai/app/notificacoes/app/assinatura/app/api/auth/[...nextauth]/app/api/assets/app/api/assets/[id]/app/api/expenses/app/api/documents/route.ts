import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const documentSchema = z.object({ name: z.string().min(1).max(160), category: z.string().min(1).max(60), dueDate: z.string().datetime().optional(), issueDate: z.string().datetime().optional(), fileUrl: z.string().url().optional(), assetId: z.string().uuid().optional(), notes: z.string().max(500).optional() });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const documents = await prisma.document.findMany({ where: { userId: (session.user as any).id }, orderBy: { dueDate: "asc" } });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = documentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  const document = await prisma.document.create({ data: { ...parsed.data, userId: (session.user as any).id } });
  return NextResponse.json(document, { status: 201 });
}
