import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, signature, webhookSecret); }
  catch (err) { return NextResponse.json({ error: "Assinatura de webhook inválida" }, { status: 400 }); }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (!userId || !plan) break;
      const stripeSubscriptionId = session.subscription as string;
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, plan, status: "ACTIVE", stripeCustomerId: session.customer as string, stripeSubscriptionId, currentPeriodEnd: new Date(sub.current_period_end * 1000) },
        update: { plan, status: "ACTIVE", stripeCustomerId: session.customer as string, stripeSubscriptionId, currentPeriodEnd: new Date(sub.current_period_end * 1000) },
      });
      await prisma.user.update({ where: { id: userId }, data: { plan } });
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId = invoice.subscription as string;
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      await prisma.subscription.updateMany({ where: { stripeSubscriptionId }, data: { status: "ACTIVE", currentPeriodEnd: new Date(sub.current_period_end * 1000) } });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.subscription.updateMany({ where: { stripeSubscriptionId: invoice.subscription as string }, data: { status: "PAST_DUE" } });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status: "CANCELED" } });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
