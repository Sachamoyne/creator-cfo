import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "stripe";

    // 1) Find or create demo user
    const user = await db.user.upsert({
      where: { email: "demo@creatorcfo.com" },
      update: {},
      create: {
        email: "demo@creatorcfo.com",
        currency: "EUR",
      },
    });

    // 2) Upsert connection for this provider
    const connection = await db.connection.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider,
        },
      },
      update: {
        updatedAt: new Date(),
        status: "ACTIVE",
      },
      create: {
        userId: user.id,
        provider,
        status: "ACTIVE",
      },
    });

    // 3) Generate 15 dummy transactions over last 3 months (mix INCOME / EXPENSE)
    const transactionDescriptions = [
      "Paiement publicité",
      "Abonnements premium",
      "Vente merch",
      "Sponsoring",
      "Frais plateforme",
      "Remboursement",
      "Consulting",
    ];

    const categories = [
      "Ads",
      "Subscriptions",
      "Merch",
      "Sponsorship",
      "Fees",
      "Refunds",
      "Services",
    ];

    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // within last 3 months
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const isIncome = Math.random() > 0.35; // 65% income, 35% expense
      const amountBase = Math.random() * 780 + 20; // 20 - 800
      const amount = Math.round(amountBase * 100) / 100;

      const description = transactionDescriptions[i % transactionDescriptions.length];
      const category = categories[i % categories.length];

      transactions.push({
        amount,
        description,
        date,
        status: "COMPLETED",
        type: isIncome ? "INCOME" : "EXPENSE",
        category,
        note: `${provider.toUpperCase()} ${isIncome ? "revenu" : "dépense"}`,
        connectionId: connection.id,
        userId: user.id,
      });
    }

    await db.transaction.createMany({ data: transactions });

    // 4) Redirect to dashboard with success flag
    redirect("/dashboard?success=true");
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("🔴 DETAILED API ERROR:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

