import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Patient, CategoryType, TypeStep, StepCompletion } from "@/lib/mock-data";
import { toast } from "sonner";

interface TreatmentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  type: CategoryType | undefined;
  onStepValidate: (stepId: string, stepName: string, timestamp?: string) => void;
  onStepReverse: (stepId: string) => void;
  onConfirm: (lastCompletedStep: string, stepsCompleted: StepCompletion[]) => void;
}

export function TreatmentHistoryModal({
  open,
  onOpenChange,
  patient,
  type,
  onStepValidate,
  onStepReverse,
  onConfirm,
}: TreatmentHistoryModalProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>("");
  const [draftSteps, setDraftSteps] = useState<StepCompletion[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open && patient) {
      setDraftSteps([...(patient.stepsCompleted || [])]);
      setHasChanges(false);
    }
  }, [open, patient]);

  if (!patient || !type || !type.steps) return null;

  const sortedSteps = [...type.steps].sort((a, b) => a.order - b.order);
  const completedStepIds = new Set(draftSteps.map(s => s.stepId));

  const getStepStatus = (step: TypeStep) => {
    if (completedStepIds.has(step.id)) {
      return "completed";
    }
    const isFirstPending = sortedSteps.findIndex(s => !completedStepIds.has(s.id)) === sortedSteps.indexOf(step);
    if (isFirstPending) {
      return "current";
    }
    return "pending";
  };

  const getCompletionTime = (stepId: string) => {
    const completion = draftSteps.find(s => s.stepId === stepId);
    if (!completion) return null;
    const date = new Date(completion.completedAt);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleValidateStep = (step: TypeStep) => {
    const timestamp = new Date().toISOString();
    const newCompletion: StepCompletion = {
      stepId: step.id,
      stepName: step.name,
      completedAt: timestamp,
    };
    setDraftSteps([...draftSteps, newCompletion]);
    setHasChanges(true);
  };

  const handleReverseStep = (stepId: string) => {
    setStepToDelete(stepId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteStep = () => {
    if (!stepToDelete) return;
    const stepIndex = draftSteps.findIndex(s => s.stepId === stepToDelete);
    if (stepIndex === -1) return;
    
    console.log(`🗑️ Removing step at index ${stepIndex} and all steps after it`);
    const updatedSteps = draftSteps.slice(0, stepIndex);
    console.log(`Steps remaining: ${updatedSteps.length}`);
    
    setDraftSteps(updatedSteps);
    setHasChanges(true);
    setDeleteConfirmOpen(false);
    setStepToDelete(null);
    toast.success("Étape supprimée. Cliquez sur 'Confirmer' pour sauvegarder.");
  };

  const handleEditTime = (stepId: string) => {
    const completion = draftSteps.find(s => s.stepId === stepId);
    if (completion) {
      const date = new Date(completion.completedAt);
      const timeStr = date.toISOString().slice(0, 16);
      setEditingStepId(stepId);
      setEditingTime(timeStr);
    }
  };

  const handleSaveTime = (stepId: string) => {
    if (editingTime) {
      const newDate = new Date(editingTime);
      const updatedSteps = draftSteps.map(s =>
        s.stepId === stepId
          ? { ...s, completedAt: newDate.toISOString() }
          : s
      );
      setDraftSteps(updatedSteps);
      setEditingStepId(null);
      setEditingTime("");
      setHasChanges(true);
    }
  };

  const handleConfirm = () => {
    try {
      console.log('🔄 Confirming treatment with steps:', draftSteps);
      
      // If no steps are completed, set etapeActuelle to empty
      if (draftSteps.length === 0) {
        console.log('No steps completed, clearing etapeActuelle');
        onConfirm("", draftSteps);
        toast.success("Suivi mis à jour avec succès");
        onOpenChange(false);
        return;
      }

      const lastCompletedStep = draftSteps[draftSteps.length - 1];
      console.log('Last completed step:', lastCompletedStep.stepName);
      onConfirm(lastCompletedStep.stepName, draftSteps);
      toast.success("Suivi mis à jour avec succès");
      onOpenChange(false);
    } catch (error) {
      console.error("Error confirming treatment:", error);
      toast.error("Erreur lors de la confirmation du traitement");
    }
  };

  const handleCancel = () => {
    setDraftSteps([...(patient.stepsCompleted || [])]);
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="sticky top-0 z-[50] bg-white dark:bg-slate-950 border-b pb-4 px-6 pt-6 w-full">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg">
              Suivi du Traitement
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="relative z-[51] inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors touch-target"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {patient.prenom} {patient.nom} • {patient.typeSoin}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4 py-4 px-6 pr-2">
          {sortedSteps.map((step) => {
            const status = getStepStatus(step);
            const completionTime = getCompletionTime(step.id);
            const isEditing = editingStepId === step.id;

            return (
              <div key={step.id} className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg">
                <div className="flex-shrink-0 pt-0.5">
                  {status === "completed" ? (
                    <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/40 bg-muted/20 flex-shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {step.name}
                      </p>
                      {status === "completed" && (
                        <div className="flex items-center gap-1 mt-1">
                          {isEditing ? (
                            <div className="flex gap-1 items-center">
                              <input
                                type="datetime-local"
                                value={editingTime}
                                onChange={(e) => setEditingTime(e.target.value)}
                                className="text-xs px-2 py-1 border border-muted-foreground/30 rounded"
                              />
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-[#800020] hover:bg-[#600018]"
                                onClick={() => handleSaveTime(step.id)}
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleEditTime(step.id)}>
                                {completionTime}
                              </p>
                              <button
                                onClick={() => handleEditTime(step.id)}
                                className="text-muted-foreground hover:text-foreground p-0.5"
                                title="Modifier l'heure"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {status !== "completed" && (
                        <Button
                          onClick={() => handleValidateStep(step)}
                          className="bg-[#800020] hover:bg-[#600018] text-white text-xs h-7 px-2.5"
                        >
                          Marquer
                        </Button>
                      )}
                      {status === "completed" && (
                        <Button
                          onClick={() => handleReverseStep(step.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Annuler cette étape"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 z-[50] bg-white dark:bg-slate-950 border-t pt-4 px-6 pb-6 w-full space-y-3">
          <div className="text-xs text-muted-foreground text-center">
            {draftSteps.length} sur {sortedSteps.length} étapes
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleConfirm}
              disabled={!hasChanges}
              className="bg-[#800020] hover:bg-[#600018] text-white text-xs h-10 px-3"
            >
              Confirmer
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog for Deletion */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[400px] w-[90vw] flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <DialogTitle className="text-lg font-semibold">
                Supprimer l'étape
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={confirmDeleteStep}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
