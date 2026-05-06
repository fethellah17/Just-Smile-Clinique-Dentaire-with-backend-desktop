import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/LoginPage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2, History, Filter, Wallet, CheckCircle2, MessageCircle, FileText } from "lucide-react";
import { getWhatsAppLink } from "@/lib/phone-utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients } from "@/hooks/use-patients";
import { useCategories } from "@/hooks/use-categories";
import { NewPatientModal } from "@/components/modals/NewPatientModal";
import { EditPatientModal } from "@/components/modals/EditPatientModal";
import { TreatmentHistoryModal } from "@/components/modals/TreatmentHistoryModal";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { ClinicalNotesModal } from "@/components/modals/ClinicalNotesModal";
import { PatientCard } from "@/components/PatientCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";
import type { Patient } from "@/lib/mock-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Patient as PatientType } from "@/lib/mock-data";

export const Route = createFileRoute("/patients")({
  component: PatientsPage,
  head: () => ({
    meta: [{ title: "Patients - Just Smile" }],
  }),
});

function PatientsPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { patients, addPatient, updatePatient, deletePatient } = usePatients();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientType | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Helper function to check if patient is fully paid
  const isFullyPaid = (patient: Patient): boolean => {
    const montantTotal = patient.montantTotal || 0;
    const montantPaye = patient.montantPaye || 0;
    return montantTotal > 0 && montantPaye >= montantTotal;
  };

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

  const filtered = patients
    .filter(
      (p) =>
        (selectedCategory === "all" || p.categorie === selectedCategory) &&
        (`${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
        p.telephone.includes(search))
    )
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());

  const handleDeletePatient = (id: string) => {
    deletePatient(id);
    setDeleteConfirm(null);
  };

  const handleOpenHistory = (patientId: string) => {
    setSelectedPatientId(patientId);
    setHistoryOpen(true);
  };

  const handleOpenPayment = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPaymentOpen(true);
  };

  const handleOpenEdit = (patient: PatientType) => {
    setEditingPatient(patient);
    setEditModalOpen(true);
  };

  const handleOpenNotes = (patientId: string) => {
    setSelectedPatientId(patientId);
    setNotesOpen(true);
  };

  const handleSaveEdit = (updatedPatient: Omit<PatientType, "id" | "dateCreation">) => {
    if (editingPatient) {
      updatePatient(editingPatient.id, updatedPatient);
      toast.success("Informations du patient mises à jour");
      setEditModalOpen(false);
      setEditingPatient(null);
    }
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedPatientId) {
      updatePatient(selectedPatientId, { clinicalNotes: notes });
    }
  };

  const handleValidateStep = (patientId: string, stepId: string, stepName: string, customTimestamp?: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      const isAlreadyCompleted = patient.stepsCompleted.some(s => s.stepId === stepId);
      if (!isAlreadyCompleted) {
        const timestamp = customTimestamp || new Date().toISOString();
        const updatedSteps = [
          ...patient.stepsCompleted,
          {
            stepId,
            stepName,
            completedAt: timestamp,
          },
        ];
        
        // Do NOT automatically update etapeActuelle here
        // It will be updated only when user clicks "Confirmer" in the modal
        updatePatient(patientId, {
          stepsCompleted: updatedSteps,
        });
      }
    }
  };

  const handleReverseStep = (patientId: string, stepId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      // Find the index of the step to reverse
      const stepIndex = patient.stepsCompleted.findIndex(s => s.stepId === stepId);
      if (stepIndex === -1) return;

      // Remove this step and all subsequent steps (cascade)
      const updatedSteps = patient.stepsCompleted.slice(0, stepIndex);
      
      // Do NOT automatically update etapeActuelle here
      // It will be updated only when user clicks "Confirmer" in the modal
      updatePatient(patientId, {
        stepsCompleted: updatedSteps,
      });
    }
  };

  const handleConfirmTreatment = (patientId: string, lastCompletedStepName: string, stepsCompleted: any[] = []) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      try {
        // IMPORTANT: Use the passed stepsCompleted array directly, even if empty
        // An empty array means all steps were unmarked and should be cleared
        const persistedSteps = stepsCompleted;
        
        // Set etapeActuelle to the last completed step name, or empty if no steps completed
        const etapeActuelle = persistedSteps.length > 0 ? lastCompletedStepName : "";
        
        console.log(`🔄 Confirming treatment for patient ${patientId}`);
        console.log(`   Steps to persist: ${persistedSteps.length}`);
        console.log(`   New etapeActuelle: "${etapeActuelle}"`);
        
        // Update the patient with both the current step and the complete steps array
        updatePatient(patientId, {
          etapeActuelle: etapeActuelle,
          stepsCompleted: persistedSteps,
        });
        
        console.log(`✅ Patient ${patientId} treatment confirmed: ${etapeActuelle || "(empty)"}`);
        console.log(`✅ Persisted ${persistedSteps.length} steps for patient ${patientId}`);
      } catch (error) {
        console.error("Error confirming treatment:", error);
        toast.error("Erreur lors de la confirmation du traitement");
      }
    } else {
      console.warn(`Patient ${patientId} not found`);
      toast.error("Patient non trouvé");
    }
  };

  const handlePaymentSaved = (patientId: string, paymentRecord: any) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      const newMontantPaye = (patient.montantPaye || 0) + paymentRecord.amount;
      const updatedPaymentHistory = [...(patient.paymentHistory || []), paymentRecord];
      
      updatePatient(patientId, {
        montantPaye: newMontantPaye,
        paymentHistory: updatedPaymentHistory,
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Header - Desktop Only */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Patients</h1>
            <p className="text-sm text-muted-foreground">{patients.length} patients enregistrés</p>
          </div>
          <Button onClick={() => setNewPatientOpen(true)} className="bg-[#800020] hover:bg-[#600018]">
            <Plus className="h-4 w-4 mr-2" /> Nouveau Patient
          </Button>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-foreground">Gestion des Patients</h1>
          <p className="text-sm text-muted-foreground">{patients.length} patients enregistrés</p>
        </div>

        {/* Sticky Search and Filter Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border -mx-4 px-4 py-4 md:relative md:mx-0 md:px-0 md:py-0 md:border-0 md:bg-transparent md:backdrop-filter-none">
          <div className="flex flex-col gap-4 md:flex-row md:gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-background w-full md:max-w-sm h-12 md:h-10 text-base md:text-sm rounded-lg border-2 border-border focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background flex-1 md:w-48 h-12 md:h-10 text-base md:text-sm rounded-lg border-2 border-border focus:border-primary">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="font-semibold">Nom</TableHead>
                    <TableHead className="font-semibold">Prénom</TableHead>
                    <TableHead className="font-semibold">Âge</TableHead>
                    <TableHead className="font-semibold">Catégorie</TableHead>
                    <TableHead className="font-semibold">Type de Soin</TableHead>
                    <TableHead className="font-semibold">Étape Actuelle</TableHead>
                    <TableHead className="font-semibold">Montant Total</TableHead>
                    <TableHead className="font-semibold">Montant Payé</TableHead>
                    <TableHead className="font-semibold">Téléphone</TableHead>
                    <TableHead className="font-semibold text-center">Contact</TableHead>
                    <TableHead className="font-semibold">Antécédents</TableHead>
                    <TableHead className="font-semibold text-center">Notes</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((p) => {
                    const category = categories?.find(c => c.name === p.categorie);
                    const type = category?.types?.find(t => t.id === p.typeSoinId);
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30 border-b border-border">
                        <TableCell className="font-medium cursor-pointer hover:text-primary">
                          <Link to="/patients/$patientId" params={{ patientId: p.id }}>
                            {p.nom}
                          </Link>
                        </TableCell>
                        <TableCell className="cursor-pointer hover:text-primary">
                          <Link to="/patients/$patientId" params={{ patientId: p.id }}>
                            {p.prenom}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.age} ans</TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant="outline" className="border-border text-foreground bg-muted/50 font-normal">
                              {category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.typeSoin ? (
                            <span className="text-foreground font-medium">{p.typeSoin}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.etapeActuelle ? (
                            <span className="text-sm text-foreground font-medium">{p.etapeActuelle}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {(p.montantTotal || 0).toLocaleString()} DA
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-700 dark:text-green-400">
                              {(p.montantPaye || 0).toLocaleString()} DA
                            </span>
                            {isFullyPaid(p) && (
                              <div title="Paiement complet">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{p.telephone}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <a
                              href={getWhatsAppLink(p.telephone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
                              title="Envoyer un message WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.antecedents}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenNotes(p.id)}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                            title="Voir les notes cliniques"
                          >
                            <FileText
                              className={`h-4 w-4 ${
                                p.clinicalNotes
                                  ? "fill-[#800020] text-[#800020]"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPayment(p.id)}
                              className="text-green-700 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                              title="Gérer les paiements"
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenHistory(p.id)}
                              className="text-[#800020] hover:text-[#800020] hover:bg-[#800020]/10"
                              title="Voir l'historique du traitement"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(p)}
                              className="text-muted-foreground hover:text-foreground hover:bg-accent"
                              title="Modifier le patient"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(p.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Supprimer le patient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) ?? null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filtered?.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun patient trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filtered?.map((p) => {
              const category = categories?.find(c => c.name === p.categorie);
              return (
                <PatientCard
                  key={p.id}
                  patient={p}
                  categoryName={category?.name}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteConfirm}
                  onHistory={handleOpenHistory}
                  onPayment={handleOpenPayment}
                  onNotes={handleOpenNotes}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton onClick={() => setNewPatientOpen(true)} />

      <NewPatientModal
        open={newPatientOpen}
        onOpenChange={setNewPatientOpen}
        categories={categories}
        onSubmit={addPatient}
      />

      <EditPatientModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        patient={editingPatient}
        categories={categories}
        onSubmit={handleSaveEdit}
      />

      {selectedPatientId && (
        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          patient={patients.find(p => p.id === selectedPatientId) || null}
          onPaymentSaved={(paymentRecord) => handlePaymentSaved(selectedPatientId, paymentRecord)}
        />
      )}

      {selectedPatientId && (() => {
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        const selectedCategory = selectedPatient ? categories.find(c => c.name === selectedPatient.categorie) : undefined;
        const selectedType = selectedCategory ? selectedCategory.types.find(t => t.id === selectedPatient?.typeSoinId) : undefined;
        
        return (
          <TreatmentHistoryModal
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            patient={selectedPatient || null}
            type={selectedType}
            onStepValidate={(stepId, stepName, customTimestamp) => handleValidateStep(selectedPatientId, stepId, stepName, customTimestamp)}
            onStepReverse={(stepId) => handleReverseStep(selectedPatientId, stepId)}
            onConfirm={(lastCompletedStepName, stepsCompleted) => handleConfirmTreatment(selectedPatientId, lastCompletedStepName, stepsCompleted)}
          />
        );
      })()}

      {selectedPatientId && (
        <ClinicalNotesModal
          open={notesOpen}
          onOpenChange={setNotesOpen}
          patient={patients.find(p => p.id === selectedPatientId) || null}
          onSave={handleSaveNotes}
        />
      )}

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le patient</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeletePatient(deleteConfirm)}
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
