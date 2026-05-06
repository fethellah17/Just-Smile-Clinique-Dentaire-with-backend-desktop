import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Patient } from "@/lib/mock-data";

interface ClinicalNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSave: (notes: string) => void;
}

export function ClinicalNotesModal({
  open,
  onOpenChange,
  patient,
  onSave,
}: ClinicalNotesModalProps) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setNotes(patient.clinicalNotes || "");
    }
  }, [patient, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(notes);
      toast.success("Notes cliniques sauvegardées");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto p-4 md:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            Notes Cliniques - {patient?.prenom} {patient?.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Entrez les notes cliniques pour ce patient..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-64 md:min-h-80 p-4 text-base md:text-sm resize-none rounded-lg border-2 border-border focus:border-primary"
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded-lg"
            >
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
