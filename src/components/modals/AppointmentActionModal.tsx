import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { type RendezVous, type Category } from "@/lib/mock-data";

interface AppointmentActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: RendezVous | null;
  categories: Category[];
  onConfirm: (appointment: RendezVous) => void;
  onReject: (appointmentId: string) => void;
}

export function AppointmentActionModal({
  open,
  onOpenChange,
  appointment,
  categories,
  onConfirm,
  onReject,
}: AppointmentActionModalProps) {
  if (!appointment) return null;

  const getCategoryName = (motif: string) => {
    const category = categories.find(c => c.name === motif);
    return category?.name || motif;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Gestion du Rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-semibold text-foreground">{appointment.patientNom}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">
                  {new Date(appointment.date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Heure</p>
                <p className="font-semibold text-foreground">{appointment.heure}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Catégorie de Soin</p>
              <p className="font-semibold text-foreground">{getCategoryName(appointment.motif)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Statut</p>
              <Badge
                variant="outline"
                className={`mt-1 font-normal ${
                  appointment.statut === "confirmé"
                    ? "border-success/30 bg-success/5 text-success"
                    : "border-warning/30 bg-warning/5 text-warning"
                }`}
              >
                {appointment.statut === "confirmé" ? "Confirmé" : "En attente"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              Que souhaitez-vous faire avec ce rendez-vous ?
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  onConfirm(appointment);
                  onOpenChange(false);
                }}
                className="flex-1 bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmer
              </Button>
              <Button
                onClick={() => {
                  onReject(appointment.id);
                  onOpenChange(false);
                }}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
