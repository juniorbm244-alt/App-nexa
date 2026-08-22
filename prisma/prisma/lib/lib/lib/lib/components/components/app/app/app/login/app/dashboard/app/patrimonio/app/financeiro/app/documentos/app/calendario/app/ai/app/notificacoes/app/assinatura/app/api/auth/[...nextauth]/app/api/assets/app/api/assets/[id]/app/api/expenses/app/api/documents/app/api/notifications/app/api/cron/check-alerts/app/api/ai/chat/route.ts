import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { montarContextoDoUsuario } from "@/lib/nexaAiContext";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const chatSchema = z.object({ message: z.string().min(1).max(2000), conversationId: z.string().uuid().optional() });

const SYSTEM_PROMPT = `
Você é o NEXA AI, assistente financeiro e patrimonial dentro do app NEXA.

Regras obrigatórias:
1. Responda SOMENTE com base nos dados fornecidos abaixo em <dados_do_usuario>. Nunca invente valores, ativos, despesas ou datas que não estejam ali.
2. Se a pergunta não puder ser respondida com os dados disponíveis, diga claramente que não há dados suficientes cadastrados — não tente adivinhar.
3. Valores monetários sempre em reais (R$), formatados de forma legível.
4. Seja direto e objetivo.
5. Nunca dê recomendação de investimento específica — você organiza informação, não é consultor de investimentos registrado.
`.trim();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = (session.user as any).id;

  const parsed = chatSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { message } = parsed.data;

  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const owns = await prisma.aIConversation.findFirst({ where: { id: conversationId, userId } });
    if (!owns) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  } else {
    const created = await prisma.aIConversation.create({ data: { userId } });
    conversationId = created.id;
  }

  const historico = await prisma.aIMessage.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" }, take: 20 });
  const contexto = await montarContextoDoUsuario(userId);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: `${SYSTEM_PROMPT}\n\n<dados_do_usuario>\n${JSON.stringify(contexto)}\n</dados_do_usuario>`,
    messages: [...historico.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user", content: message }],
  });

  const textoResposta = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n");

  await prisma.aIMessage.createMany({ data: [{ conversationId, role: "user", content: message }, { conversationId, role: "assistant", content: textoResposta }] });

  return NextResponse.json({ conversationId, reply: textoResposta });
}
