import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      xAccounts: { take: 1 },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
