import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const THRESHOLDS_DIAS = [30, 15, 7, 1];

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let criados = 0;

  const documentos = await prisma.document.findMany({ where: { dueDate: { not: null } }, select: { id: true, userId: true, name: true, dueDate: true } });

  for (const doc of documentos) {
    const dias = Math.round((doc.dueDate!.getTime() - hoje.getTime()) / 86_400_000);
    if (!THRESHOLDS_DIAS.includes(dias)) continue;
    const title = `${doc.name} vence em ${dias} dia${dias > 1 ? "s" : ""}`;
    try {
      await prisma.notification.create({ data: { userId: doc.userId, type: "DOCUMENT_DUE", title, body: `Fique atento: "${doc.name}" tem vencimento em ${dias} dia${dias > 1 ? "s" : ""}.`, documentId: doc.id } });
      criados++;
    } catch (e: any) { if (e.code !== "P2002") throw e; }
  }

  return NextResponse.json({ ok: true, notificacoesCriadas: criados });
}
