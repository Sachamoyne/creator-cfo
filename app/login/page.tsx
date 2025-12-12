"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Email ou mot de passe incorrect");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // Registration logic
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erreur lors de la création du compte");
          return;
        }

        // Success - show message and auto-login
        setSuccess("Compte créé ! Connexion en cours...");
        setError("");
        
        // Automatically log in the user after successful registration
        setTimeout(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Compte créé mais connexion échouée. Veuillez vous connecter manuellement.");
            setSuccess("");
          } else {
            router.push("/dashboard");
            router.refresh();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {isLogin ? "Connexion" : "Inscription"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin 
              ? "Connectez-vous à votre compte Creator CFO"
              : "Créez votre compte Creator CFO"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "••••••••" : "Minimum 6 caractères"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? undefined : 6}
                disabled={isLoading}
                className="bg-background border-input text-foreground"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:opacity-90" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isLogin ? "Connexion..." : "Création du compte...")
                : (isLogin ? "Se connecter" : "Créer mon compte")}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
                setEmail("");
                setPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
