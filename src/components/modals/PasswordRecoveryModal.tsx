import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";

interface PasswordRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const USER_EMAIL = "dr.souidi@justsmile.dz";
const MASTER_RECOVERY_CODE = "JUST-SMILE-2026";

export function PasswordRecoveryModal({ open, onOpenChange }: PasswordRecoveryModalProps) {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate recovery code
      if (recoveryCode.trim().toUpperCase() !== MASTER_RECOVERY_CODE) {
        toast.error("Code de récupération incorrect");
        setLoading(false);
        return;
      }

      // Call backend API to reset password
      const response = await authApi.resetPassword(USER_EMAIL, recoveryCode);
      
      toast.success(`Mot de passe réinitialisé à '${response.defaultPassword}'. Vous pouvez maintenant vous connecter.`);
      
      // Reset form and close modal
      setRecoveryCode("");
      setLoading(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || "Erreur lors de la réinitialisation du mot de passe");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRecoveryCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Récupération du mot de passe</DialogTitle>
          <DialogDescription>
            Entrez le code de récupération pour réinitialiser votre mot de passe
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Veuillez contacter l'administrateur pour obtenir le code de récupération.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-code">Code de Récupération</Label>
            <Input
              id="recovery-code"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Entrez le code de récupération"
              className="uppercase"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Vérification..." : "Réinitialiser"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
