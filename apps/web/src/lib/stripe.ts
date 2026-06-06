import Stripe from "stripe";
import { prisma } from "@/lib/db";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function syncPlanFromSubscription(
  stripeCustomerId: string,
  status: string
) {
  const plan = status === "active" || status === "trialing" ? "PRO" : "FREE";
  await prisma.user.updateMany({
    where: { stripeCustomerId },
    data: { plan },
  });
}
