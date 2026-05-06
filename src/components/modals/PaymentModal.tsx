import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Lock, AlertCircle, X, ChevronLeft } from "lucide-react";
import type { Patient, PaymentRecord } from "@/lib/mock-data";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onPaymentSaved: (paymentRecord: PaymentRecord) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  patient,
  onPaymentSaved,
}: PaymentModalProps) {
  const [newPayment, setNewPayment] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!patient) return null;

  const montantTotal = patient.montantTotal || 0;
  const montantPaye = patient.montantPaye || 0;
  const resteAPayer = montantTotal - montantPaye;
  const newPaymentAmount = parseFloat(newPayment) || 0;
  const totalAfterPayment = montantPaye + newPaymentAmount;
  const remainingAfterPayment = montantTotal - totalAfterPayment;

  const handleAddPayment = () => {
    if (!newPayment || newPaymentAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (newPaymentAmount > resteAPayer) {
      toast.error(`Le montant ne peut pas dépasser le reste à payer (${resteAPayer.toLocaleString()} DA)`);
      return;
    }

    setVerificationStep(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    try {
      const paymentRecord: PaymentRecord = {
        id: `payment-${Date.now()}`,
        amount: newPaymentAmount,
        date: new Date().toISOString(),
        locked: true,
      };

      onPaymentSaved(paymentRecord);
      toast.success(`Paiement de ${newPaymentAmount.toLocaleString()} DA enregistré`);
      
      setNewPayment("");
      setVerificationStep(false);
      setIsProcessing(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du paiement");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="sticky top-0 z-[50] bg-white dark:bg-slate-950 border-b pb-4 px-6 pt-6 w-full">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-[#800020]" />
              Suivi des Paiements
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="relative z-[51] inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors touch-target"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {patient.prenom} {patient.nom}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-6 px-6 py-6 pr-2">
          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="border border-border">
              <CardContent className="pt-4 p-3 md:p-4">
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Montant Total</div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {montantTotal.toLocaleString()} DA
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-4 p-3 md:p-4">
                <div className="text-xs text-green-700 dark:text-green-400 mb-2 font-semibold uppercase">Montant Payé</div>
                <div className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400">
                  {montantPaye.toLocaleString()} DA
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-4 p-3 md:p-4">
                <div className="text-xs text-red-700 dark:text-red-400 mb-2 font-semibold uppercase">Reste à Payer</div>
                <div className="text-xl md:text-2xl font-bold text-red-700 dark:text-red-400">
                  {resteAPayer.toLocaleString()} DA
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Historique des Paiements
            </h3>
            {patient.paymentHistory && patient.paymentHistory.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patient.paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {payment.amount.toLocaleString()} DA
                        </span>
                        {payment.locked && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Verrouillé
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground text-sm">
                Aucun paiement enregistré
              </div>
            )}
          </div>

          {/* New Payment Section */}
          {!verificationStep ? (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground">Nouveau Versement</h3>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Montant à payer (DA)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPayment}
                  onChange={(e) => setNewPayment(e.target.value)}
                  min="0"
                  max={resteAPayer}
                  className="bg-background h-10"
                />
              </div>

              {newPayment && newPaymentAmount > 0 && (
                <div className="space-y-2 p-3 bg-background rounded border border-border text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant à payer:</span>
                    <span className="font-medium text-foreground">
                      {newPaymentAmount.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total après paiement:</span>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {totalAfterPayment.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Reste à payer:</span>
                    <span className={`font-bold ${remainingAfterPayment > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                      {remainingAfterPayment.toLocaleString()} DA
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Confirmation du Paiement
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    Veuillez confirmer le paiement de <span className="font-bold">{newPaymentAmount.toLocaleString()} DA</span> pour {patient.prenom} {patient.nom}.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Cette action est irréversible. Le paiement sera verrouillé et ne pourra pas être modifié.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Buttons */}
        <div className="sticky bottom-0 z-[50] bg-white dark:bg-slate-950 border-t pt-4 px-6 pb-6 w-full flex gap-3 justify-end">
          {!verificationStep ? (
            <Button
              onClick={handleAddPayment}
              disabled={!newPayment || newPaymentAmount <= 0 || newPaymentAmount > resteAPayer}
              className="w-full md:w-auto bg-[#800020] hover:bg-[#600018] h-10"
            >
              Vérifier le Paiement
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setVerificationStep(false)}
                variant="ghost"
                className="h-10 gap-2"
                disabled={isProcessing}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="bg-green-700 hover:bg-green-800 h-10 text-white"
              >
                {isProcessing ? "Enregistrement..." : "Confirmer le Paiement"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
