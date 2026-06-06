import { NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (user.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const subscriptions = await getStripe().subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
      });
      for (const sub of subscriptions.data) {
        await getStripe().subscriptions.cancel(sub.id);
      }
    } catch {
      // Continue deletion even if Stripe fails
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });

  return NextResponse.json({ ok: true });
}
