import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_BY_PLAN: Record<string, string> = { essential: process.env.STRIPE_PRICE_ESSENTIAL!, premium: process.env.STRIPE_PRICE_PREMIUM!, private: process.env.STRIPE_PRICE_PRIVATE! };
const checkoutSchema = z.object({ plan: z.enum(["essential", "premium", "private"]) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const userId = (session.user as any).id;
  const userEmail = session.user.email!;

  let stripeCustomerId = (await prisma.subscription.findUnique({ where: { userId } }))?.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: userEmail, metadata: { userId } });
    stripeCustomerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: PRICE_BY_PLAN[parsed.data.plan], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/assinatura?status=sucesso`,
    cancel_url: `${process.env.NEXTAUTH_URL}/assinatura?status=cancelado`,
    metadata: { userId, plan: parsed.data.plan },
    subscription_data: { metadata: { userId, plan: parsed.data.plan } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
