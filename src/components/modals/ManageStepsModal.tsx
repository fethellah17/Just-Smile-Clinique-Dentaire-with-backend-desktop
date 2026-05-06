import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Acte, type ActeStepProgress } from "@/lib/mock-data";

interface ManageStepsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acte: Acte;
  onUpdate: (acteId: string, stepProgress: ActeStepProgress[]) => void;
}

export function ManageStepsModal({ open, onOpenChange, acte, onUpdate }: ManageStepsModalProps) {
  const [stepProgress, setStepProgress] = useState<ActeStepProgress[]>(acte.stepProgress);

  const handleToggleStep = (stepId: string) => {
    setStepProgress(prev => prev.map(step => {
      if (step.stepId === stepId) {
        return {
          ...step,
          completed: !step.completed,
          completedDate: !step.completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return step;
    }));
  };

  const handleSave = () => {
    onUpdate(acte.id, stepProgress);
    onOpenChange(false);
  };

  const completedSteps = stepProgress.filter(s => s.completed).length;
  const totalSteps = stepProgress.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer les Étapes</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {acte.type} - {acte.categorie}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Progression</span>
              <span className="text-sm font-semibold text-foreground">{completedSteps}/{totalSteps} étapes</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-success h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              {progressPercentage.toFixed(0)}% complété
            </div>
          </div>

          <div className="space-y-3">
            {stepProgress.map((step, index) => (
              <div 
                key={step.stepId} 
                className="flex items-start gap-3 p-3 rounded border border-border hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-foreground/10 text-foreground flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={step.stepId}
                      checked={step.completed}
                      onCheckedChange={() => handleToggleStep(step.stepId)}
                    />
                    <Label 
                      htmlFor={step.stepId} 
                      className={`cursor-pointer ${step.completed ? "text-foreground font-medium" : "text-muted-foreground"}`}
                    >
                      {step.stepName}
                    </Label>
                  </div>
                  {step.completed && step.completedDate && (
                    <p className="text-xs text-muted-foreground ml-6">
                      Complété le {new Date(step.completedDate).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} className="bg-[#800020] hover:bg-[#600018]">
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
