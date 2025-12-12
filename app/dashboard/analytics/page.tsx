import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfitabilityChart from "@/components/dashboard/ProfitabilityChart";
import ExpensesPie from "@/components/dashboard/ExpensesPie";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MonthlyPoint = {
  month: string;
  income: number;
  expense: number;
  profit: number;
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const transactions = user.transactions;

  // Totaux
  const totalIncome = transactions
    .filter((t) => (t.type || "INCOME") === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Groupement par mois (12 derniers mois)
  const now = new Date();
  const months: MonthlyPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      income: 0,
      expense: 0,
      profit: 0,
      _key: key,
    } as any);
  }
  const monthMap = new Map(months.map((m) => [(m as any)._key || (m as any).name, m]));

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point = monthMap.get(key);
    if (point) {
      if ((t.type || "INCOME") === "INCOME") {
        point.income += t.amount;
      } else {
        point.expense += t.amount;
      }
    }
  });
  months.forEach((m) => (m.profit = m.income - m.expense));
  const monthlyData: MonthlyPoint[] = months;

  // Répartition des dépenses par catégorie
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const cat = t.category || "Autres";
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
    });
  const expenseData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: user.currency,
      minimumFractionDigits: 0,
    }).format(amount);

  const insightText =
    margin < 20
      ? "Attention, vos dépenses sont élevées. Essayez de réduire les coûts fixes."
      : margin < 30
      ? "Marge correcte, mais surveillez l'évolution des dépenses."
      : "Excellent ratio de marge, continuez à optimiser vos revenus.";

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Analyses Financières</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Pas assez de données pour l'analyse. Connectez plus de sources ou attendez les premières transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analyses Financières</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Suivez la rentabilité, les revenus et les dépenses.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Nette</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                margin > 30 ? "text-green-400" : "text-yellow-400"
              )}
            >
              {margin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net Profit / Revenus</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Dépenses cumulées</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenus - Dépenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="h-[450px] flex flex-col">
        <CardHeader>
          <CardTitle>Revenus vs Dépenses</CardTitle>
          <CardDescription>Suivi mensuel de la rentabilité (12 mois)</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="h-[400px]">
            <ProfitabilityChart data={monthlyData} currency={user.currency} />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-[450px] flex flex-col">
          <CardHeader>
            <CardTitle>Distribution Dépenses</CardTitle>
            <CardDescription>Répartition par catégorie</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[400px]">
              <ExpensesPie data={expenseData} currency={user.currency} />
            </div>
          </CardContent>
        </Card>

        <Card className="h-[450px] flex flex-col">
          <CardHeader>
            <CardTitle>L'analyse du CFO</CardTitle>
            <CardDescription>Commentaire automatique basé sur votre marge</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">{insightText}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

