import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TransactionsDataTable from "@/components/dashboard/TransactionsDataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: {
        include: { connection: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const transactions = user.transactions.map((t) => ({
    id: t.id,
    description: t.description,
    date: t.date.toISOString(),
    status: t.status,
    type: t.type || "INCOME",
    category: t.category || "",
    note: t.note || "",
    amount: t.amount,
    connection: t.connection
      ? {
          provider: t.connection.provider,
        }
      : null,
  }));

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Consultez toutes vos transactions et filtres en temps réel.
          </p>
        </div>
      </div>

      <TransactionsDataTable transactions={transactions} currency={user.currency} />
    </div>
  );
}

