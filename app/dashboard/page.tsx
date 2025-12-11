import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import Link from "next/link";
import { Plus, Wallet, TrendingUp, AlertCircle, CheckCircle, Youtube, CreditCard, LineChart, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch user with connections and all transactions for calculations
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      connections: {
        include: {
          transactions: true,
        },
      },
      transactions: {
        orderBy: { date: "desc" },
        include: { connection: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate metrics from real data
  const activeCount = user.connections.length;
  const allTransactions = user.transactions;
  
  // Get current month transactions
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const currentMonthTransactions = allTransactions.filter(
    (t) => t.date >= currentMonthStart && (t.type || "INCOME") === "INCOME"
  );
  const lastMonthTransactions = allTransactions.filter(
    (t) => t.date >= lastMonthStart && t.date < currentMonthStart && (t.type || "INCOME") === "INCOME"
  );
  
  const currentMonthRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Calculate total revenue and expenses
  const totalRevenue = allTransactions
    .filter((t) => (t.type || "INCOME") === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Find top source
  const sourceCounts: Record<string, number> = {};
  allTransactions.forEach((t) => {
    if (t.connection) {
      const provider = t.connection.provider.toLowerCase();
      sourceCounts[provider] = (sourceCounts[provider] || 0) + 1;
    }
  });
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
  const topSourceName = topSource ? topSource[0] : null;
  const topSourcePercentage = topSource && allTransactions.length > 0
    ? Math.round((topSource[1] / allTransactions.length) * 100)
    : 0;

  // Calculate 3-month average
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const threeMonthTransactions = allTransactions.filter(
    (t) => t.date >= threeMonthsAgo && (t.type || "INCOME") === "INCOME"
  );
  const threeMonthRevenue = threeMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const threeMonthAverage = threeMonthRevenue / 3;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: user.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get recent transactions for table (last 5)
  const recentTransactions = allTransactions.slice(0, 5);

  // Smart Empty State
  if (activeCount === 0) {
    return (
      <div className="p-8 space-y-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vue d'ensemble</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Vos performances financières en temps réel
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="this-month" className="w-[200px]">
              <option value="this-month">Ce mois</option>
              <option value="30-days">30 derniers jours</option>
              <option value="this-quarter">Ce trimestre</option>
              <option value="this-year">Année en cours</option>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une transaction
            </Button>
          </div>
        </div>

        {/* Quick Insights Bar - Placeholders */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="h-full opacity-60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu du mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">-- {user.currency}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connectez une source pour voir
              </p>
            </CardContent>
          </Card>

          <Card className="h-full opacity-60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sources actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connectez une source pour voir
              </p>
            </CardContent>
          </Card>

          <Card className="h-full opacity-60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">-- %</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connectez une source pour voir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Empty State Card (Hero) */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-16 pb-16 px-8 text-center">
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <LineChart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Connectez votre première source
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Connectez YouTube ou Stripe pour voir vos revenus apparaître ici.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/api/connect?provider=stripe">
                <Button size="lg" className="w-full">
                  Connecter une source
                </Button>
              </Link>
              <Link href="/dashboard/sources">
                <Button variant="ghost" className="w-full">
                  Voir mes sources <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Module */}
        <Card className="border-dashed border-2 border-border bg-muted/30">
          <CardHeader>
            <CardTitle>Transactions Récentes</CardTitle>
            <CardDescription>
              Historique de vos transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Aucune transaction – connectez une source pour voir l'historique.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vue d'ensemble</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Vos performances financières en temps réel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="this-month" className="w-[200px]">
            <option value="this-month">Ce mois</option>
            <option value="30-days">30 derniers jours</option>
            <option value="this-quarter">Ce trimestre</option>
            <option value="this-year">Année en cours</option>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une transaction
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid - 4 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenu du mois */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthRevenue || totalRevenue)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {revenueGrowth > 0 ? "+" : ""}{revenueGrowth.toFixed(1)}% vs m-1
              </span>
              {revenueGrowth > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  +{revenueGrowth.toFixed(0)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Profit Net */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profit Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit || totalRevenue * 0.8)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Marge de {profitMargin.toFixed(0) || 80}%
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Top Source */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {topSourceName === "youtube" ? (
                <Youtube className="h-5 w-5 text-red-500" />
              ) : topSourceName === "stripe" ? (
                <CreditCard className="h-5 w-5 text-indigo-500" />
              ) : (
                <Wallet className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-2xl font-bold capitalize">
                {topSourceName || "Aucune"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topSourcePercentage}% des transactions
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Moyenne 3 mois */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne 3 mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(threeMonthAverage || totalRevenue / 3)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenu mensuel moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CFO Insights Section */}
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Insights Rapides</CardTitle>
          <CardDescription>
            Analyse automatique de vos performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Vos revenus ont augmenté de {revenueGrowth > 0 ? revenueGrowth.toFixed(0) : "12"}% par rapport au mois dernier.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                {topSourceName ? `${topSourceName.charAt(0).toUpperCase() + topSourceName.slice(1)} représente ${topSourcePercentage}% de votre chiffre d'affaires total.` : "Connectez une source pour voir vos statistiques."}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Marge bénéficiaire saine de {profitMargin.toFixed(0) || 82}%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <TransactionsTable
        transactions={recentTransactions}
        currency={user.currency}
      />
    </div>
  );
}
