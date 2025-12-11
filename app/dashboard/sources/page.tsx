import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SourcesList from "@/components/dashboard/SourcesList";
import AvailableIntegrations from "@/components/dashboard/AvailableIntegrations";
import { Database } from "lucide-react";

export default async function SourcesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const connections = await db.connection.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Sources</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gérez vos intégrations et déconnectez celles dont vous n’avez plus besoin.
          </p>
        </div>
        <a href="#sources-disponibles">
          <Button variant="outline">Voir les sources disponibles</Button>
        </a>
      </div>

      {/* Empty state handled inside SourcesList if needed */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune source connectée</p>
            <a href="#sources-disponibles" className="mt-4">
              <Button>Ajouter votre première source</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <SourcesList connections={connections} />
      )}

      {/* Available integrations */}
      <div id="sources-disponibles" className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sources Disponibles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connectez de nouvelles plateformes en un clic.
          </p>
        </div>
        <AvailableIntegrations
          connectedProviders={connections.map((c) => c.provider.toLowerCase())}
        />
      </div>
    </div>
  );
}

