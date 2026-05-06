import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/LoginPage";
import { usePatients } from "@/hooks/use-patients";
import { useActes } from "@/hooks/use-actes";
import { useCategories } from "@/hooks/use-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, User, FileText, CreditCard, Trash2, CheckSquare } from "lucide-react";
import { useState } from "react";
import { NewActeModal } from "@/components/modals/NewActeModal";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { ManageStepsModal } from "@/components/modals/ManageStepsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type ActeStepProgress } from "@/lib/mock-data";

export const Route = createFileRoute("/patients/$patientId")({
  component: PatientDetailPage,
  head: () => ({
    meta: [{ title: "Fiche Patient - Just Smile" }],
  }),
});

function PatientDetailPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  const { patientId } = Route.useParams();
  const { patients } = usePatients();
  const { actes, addActe, updateActe, deleteActe, getActesByPatient } = useActes();
  const { categories } = useCategories();
  const [newActeOpen, setNewActeOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [manageStepsOpen, setManageStepsOpen] = useState<string | null>(null);

  const patient = patients.find((p) => p.id === patientId);
  const patientCategory = patient ? categories.find(c => c.name === patient.categorie) : null;
  const patientActes = getActesByPatient(patientId);

  if (!patient) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient non trouvé</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/patients">Retour</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalDu = patientActes.reduce((s, a) => s + a.montantTotal, 0);
  const totalVerse = patientActes.reduce((s, a) => s + a.montantVerse, 0);
  const totalReste = patientActes.reduce((s, a) => s + a.resteAPayer, 0);

  const handlePayment = (acteId: string, montant: number) => {
    const acte = actes.find(a => a.id === acteId);
    if (acte) {
      updateActe(acteId, {
        montantVerse: acte.montantVerse + montant,
      });
    }
    setPaymentOpen(null);
  };

  const handleUpdateSteps = (acteId: string, stepProgress: ActeStepProgress[]) => {
    updateActe(acteId, { stepProgress });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patients">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {patient.prenom} {patient.nom}
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{patient.prenom} {patient.nom}</p>
                  <p className="text-sm text-muted-foreground">{patient.age} ans</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {patient.telephone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" /> {patient.antecedents}
                </div>
                {patientCategory && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="border-border text-foreground bg-muted/50 font-normal">
                      {patientCategory.name}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {patientActes.length > 0 && (
            <Card className="border border-border md:col-span-2">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-sm font-semibold">Progression des Traitements</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {patientActes.map((acte) => {
                    const completedSteps = acte.stepProgress.filter(s => s.completed).length;
                    const totalSteps = acte.stepProgress.length;
                    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
                    
                    return (
                      <div key={acte.id} className="space-y-2 p-3 bg-muted/20 rounded border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{acte.type}</p>
                            <p className="text-xs text-muted-foreground">{acte.categorie}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-foreground">{completedSteps}/{totalSteps} étapes</p>
                            <p className="text-xs text-muted-foreground">{progressPercentage.toFixed(0)}%</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-success h-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        
                        <div className="space-y-1 mt-3">
                          {acte.stepProgress
                            .sort((a, b) => {
                              const stepA = acte.stepProgress.indexOf(a);
                              const stepB = acte.stepProgress.indexOf(b);
                              return stepA - stepB;
                            })
                            .map((step, index) => (
                              <div key={step.stepId} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/30">
                                <div
                                  className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold ${
                                    step.completed 
                                      ? "bg-success text-white" 
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                                    {step.stepName}
                                  </span>
                                </div>
                                {step.completed && step.completedDate && (
                                  <span className="text-muted-foreground text-xs">
                                    {new Date(step.completedDate).toLocaleDateString("fr-FR")}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setManageStepsOpen(acte.id)}
                          className="w-full mt-2 border-border"
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Gérer les Étapes
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-l-4 border-l-success border border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Total Versé</p>
              <p className="text-2xl font-bold text-success tabular-nums">{totalVerse.toLocaleString("fr-DZ")} DA</p>
              <p className="text-xs text-muted-foreground mt-1">sur {totalDu.toLocaleString("fr-DZ")} DA</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-destructive" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Reste à Payer</p>
              </div>
              <p className="text-2xl font-bold text-destructive tabular-nums">{totalReste.toLocaleString("fr-DZ")} DA</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b border-border">
            <CardTitle className="text-base font-semibold">Historique des Soins & Paiements</CardTitle>
            <Button onClick={() => setNewActeOpen(true)} className="bg-primary hover:bg-primary/90">
              Nouvel Acte
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {patientActes?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Aucun acte enregistré</p>
            ) : (
              <div className="relative border-l-2 border-border ml-4 space-y-6">
                {patientActes?.map((a) => (
                  <div key={a.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-card" />
                    <div className="rounded border border-border p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{a.type}</p>
                          <p className="text-xs text-muted-foreground">{a.categorie}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-normal border-border">
                            {new Date(a.date).toLocaleDateString("fr-FR")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(a.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                      <div className="grid grid-cols-3 gap-3 text-xs mb-3 p-3 bg-muted/50 rounded border border-border">
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wide font-semibold">Total</span>
                          <p className="font-semibold text-foreground tabular-nums">{a.montantTotal.toLocaleString("fr-DZ")} DA</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wide font-semibold">Versé</span>
                          <p className="font-semibold text-success tabular-nums">{a.montantVerse.toLocaleString("fr-DZ")} DA</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wide font-semibold">Reste</span>
                          <p className={`font-semibold tabular-nums ${a.resteAPayer > 0 ? "text-destructive" : "text-success"}`}>
                            {a.resteAPayer.toLocaleString("fr-DZ")} DA
                          </p>
                        </div>
                      </div>
                      {a.resteAPayer > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentOpen(a.id)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          Payer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewActeModal
        open={newActeOpen}
        onOpenChange={setNewActeOpen}
        patients={patients}
        categories={categories}
        onSubmit={addActe}
      />

      {paymentOpen && (
        <PaymentModal
          open={true}
          onOpenChange={(open) => !open && setPaymentOpen(null)}
          resteAPayer={actes.find(a => a.id === paymentOpen)?.resteAPayer || 0}
          onSubmit={(montant) => handlePayment(paymentOpen, montant)}
        />
      )}

      {manageStepsOpen && (
        <ManageStepsModal
          open={true}
          onOpenChange={(open) => !open && setManageStepsOpen(null)}
          acte={actes.find(a => a.id === manageStepsOpen)!}
          onUpdate={handleUpdateSteps}
        />
      )}

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'acte</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet acte ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteActe(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
