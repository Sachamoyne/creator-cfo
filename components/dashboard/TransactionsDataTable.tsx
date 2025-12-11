"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, Search, Database, Wallet, ShoppingBag, Monitor, BadgeEuro, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionInfo = {
  provider: string;
} | null;

type Transaction = {
  id: string;
  description: string;
  date: string; // ISO string
  status: string;
  type: string;
  category: string;
  note: string;
  amount: number;
  connection: ConnectionInfo;
};

interface TransactionsDataTableProps {
  transactions: Transaction[];
  currency?: string;
}

const providerLabels: Record<string, string> = {
  youtube: "YouTube",
  stripe: "Stripe",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ads: TrendingUp,
  vente: ShoppingBag,
  merch: ShoppingBag,
  software: Monitor,
  services: BadgeEuro,
  default: Wallet,
};

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Database,
  stripe: BadgeEuro,
};

function formatCurrency(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsDataTable({ transactions, currency = "EUR" }: TransactionsDataTableProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType ? t.type === filterType : true;
      const provider = t.connection?.provider?.toLowerCase() || "";
      const matchesSource = filterSource ? provider === filterSource.toLowerCase() : true;
      return matchesSearch && matchesType && matchesSource;
    });
  }, [transactions, search, filterType, filterSource]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const exportCsv = () => {
    const headers = ["Description", "Date", "Type", "Catégorie", "Note", "Montant", "Source"];
    const rows = filtered.map((t) => [
      t.description,
      formatDate(t.date),
      t.type,
      t.category,
      t.note,
      t.amount,
      t.connection?.provider || "N/A",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCategoryBadge = (category: string) => {
    const normalized = category.toLowerCase();
    const Icon = categoryIcons[normalized] || categoryIcons.default;
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        <span className="capitalize">{category || "N/A"}</span>
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des transactions</CardTitle>
        <CardDescription>Recherche instantanée et filtres côté client.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une transaction..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-[150px]"
            >
              <option value="">Type : Tous</option>
              <option value="INCOME">Revenus</option>
              <option value="EXPENSE">Dépenses</option>
            </Select>
            <Select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setPage(1);
              }}
              className="w-[150px]"
            >
              <option value="">Source : Toutes</option>
              <option value="stripe">Stripe</option>
              <option value="youtube">YouTube</option>
            </Select>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-lg bg-muted/30">
            <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Aucune transaction trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Transaction</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Catégorie</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Montant</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => {
                  const provider = t.connection?.provider?.toLowerCase() || "autre";
                  const ProviderIcon = providerIcons[provider] || Database;
                  const providerLabel = providerLabels[provider] || provider;
                  const isIncome = (t.type || "INCOME") === "INCOME";
                  const normalizedCategory = (t.category || "default").toLowerCase();
                  const DisplayIcon =
                    categoryIcons[normalizedCategory] || categoryIcons.default;
                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <DisplayIcon className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">{t.description}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {renderCategoryBadge(t.category || "Autre")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ProviderIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground capitalize">{providerLabel}</span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-sm font-semibold text-right",
                          isIncome ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(Math.abs(t.amount), currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="px-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} — {filtered.length} transaction(s)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

