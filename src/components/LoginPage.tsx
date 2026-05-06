import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PasswordRecoveryModal } from "@/components/modals/PasswordRecoveryModal";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion. Vérifiez que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border border-slate-200">
        <CardHeader className="text-center pb-2 pt-8 border-b border-slate-200">
          <div className="mx-auto mb-6">
            <img
              src="/images/logo.jpg"
              alt="Just Smile Dental Clinic"
              className="h-20 w-20 rounded-lg object-cover mx-auto shadow-md"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Just Smile</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">Clinique Dentaire</p>
          <p className="text-xs text-slate-500 mt-2">
            Dr. Souidi H. Ep Belmekki
          </p>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: dr.souidi@justsmile.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-amber-900 hover:bg-amber-950 text-white font-medium py-2"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setRecoveryOpen(true)}
                className="text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PasswordRecoveryModal
        open={recoveryOpen}
        onOpenChange={setRecoveryOpen}
      />
    </div>
  );
}
