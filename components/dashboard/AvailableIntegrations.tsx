"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Youtube,
  CreditCard,
  HeartHandshake,
  Music2,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Integration = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

const INTEGRATIONS: Integration[] = [
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "stripe", name: "Stripe", icon: CreditCard },
  { id: "patreon", name: "Patreon", icon: HeartHandshake },
  { id: "tiktok", name: "TikTok", icon: Music2 },
  { id: "amazon", name: "Amazon", icon: ShoppingBag },
];

export default function AvailableIntegrations({
  connectedProviders = [],
}: {
  connectedProviders?: string[];
}) {
  const connectedSet = new Set(connectedProviders.map((p) => p.toLowerCase()));
  const items = INTEGRATIONS.filter((i) => !connectedSet.has(i.id));

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Toutes les intégrations disponibles sont déjà connectées.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.id} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription>Connecter {item.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Link href={`/api/connect?provider=${item.id}`}>
                <Button variant="outline" className={cn("w-full md:w-auto")}>
                  Connecter
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

