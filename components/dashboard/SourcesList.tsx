"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Connection = {
  id: string;
  provider: string;
  status: string;
  updatedAt: string | Date;
  createdAt?: string | Date;
};

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  stripe: CreditCard,
};

export default function SourcesList({ connections }: { connections: Connection[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("🔵 Deleting source", id);
      setLoadingId(id);
      const res = await fetch(`/api/sources/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      router.refresh();
      router.push("/dashboard/sources");
    } catch (err) {
      console.error("❌ Delete error", err);
      alert("Erreur lors de la suppression");
    } finally {
      setLoadingId(null);
    }
  };

  if (!connections || connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Aucune source connectée pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => {
        const providerKey = connection.provider.toLowerCase();
        const Icon = providerIcons[providerKey] || CreditCard;
        return (
          <Card key={connection.id} className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base capitalize">{connection.provider}</CardTitle>
                  <CardDescription>Connecté le {formatDate(connection.createdAt || connection.updatedAt)}</CardDescription>
                </div>
              </div>
              <Badge variant="success" className="uppercase">
                Actif
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button
                variant="outline"
                className={cn("text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground")}
                onClick={() => handleDelete(connection.id)}
                disabled={loadingId === connection.id}
              >
                {loadingId === connection.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Déconnecter"
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

