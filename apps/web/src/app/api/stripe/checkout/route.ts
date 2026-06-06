import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateStripeCustomer, getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email
  );

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: session.user.id },
    },
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
