import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/LoginPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle2, XCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePatients } from "@/hooks/use-patients";
import { useRendezVous } from "@/hooks/use-rendez-vous";
import { usePassageDirect } from "@/hooks/use-passage-direct";
import { useCategories } from "@/hooks/use-categories";
import { NewPatientModal } from "@/components/modals/NewPatientModal";
import { NewRendezVousModal } from "@/components/modals/NewRendezVousModal";
import { NewPassageDirectModal } from "@/components/modals/NewPassageDirectModal";
import { AppointmentActionModal } from "@/components/modals/AppointmentActionModal";
import { toast } from "sonner";
import { type RendezVous } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Just Smile - Clinique Dentaire" },
      { name: "description", content: "Système de gestion - Just Smile Clinique Dentaire" },
    ],
  }),
});

function Index() {
  const { isAuthenticated, isInitialized } = useAuth();
  
  // Show nothing while initializing to prevent flash
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

  const { patients, addPatient } = usePatients();
  const { rendezVous, addRendezVous, updateRendezVous, archiveByDate } = useRendezVous();
  const { passagesDirects, addPassageDirect, deletePassageDirect } = usePassageDirect();
  const { categories } = useCategories();
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [newRdvOpen, setNewRdvOpen] = useState(false);
  const [newPassageOpen, setNewPassageOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<RendezVous | null>(null);
  const [appointmentActionOpen, setAppointmentActionOpen] = useState(false);
  const [appointmentToConvert, setAppointmentToConvert] = useState<RendezVous | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRDV = (rendezVous || []).filter((r) => r.date === todayStr && !r.archived);
  const todayPassages = (passagesDirects || []).filter((p) => p.date === todayStr);
  const totalPatients = (patients || []).length;

  // Check if there are any "en attente" appointments today
  const hasEnAttenteToday = todayRDV.some((rdv) => rdv.statut === "en attente");

  const handleConfirmAppointment = async (appointment: RendezVous) => {
    try {
      await updateRendezVous(appointment.id, { statut: "confirmé" });
      setAppointmentActionOpen(false);
      toast.success("Rendez-vous confirmé");
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await updateRendezVous(appointmentId, { statut: "annulé" });
      setAppointmentActionOpen(false);
      toast.success("Rendez-vous rejeté");
    } catch (error) {
      console.error('Failed to reject appointment:', error);
      toast.error("Erreur lors du rejet");
    }
  };

  const handleArchiveToday = async () => {
    try {
      await archiveByDate(todayStr);
      toast.success("Journée archivée");
    } catch (error) {
      console.error('Failed to archive:', error);
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleNewPatientSubmit = async (patientData: any) => {
    try {
      const newPatient = await addPatient(patientData);
      
      if (appointmentToConvert) {
        await updateRendezVous(appointmentToConvert.id, {
          patientId: newPatient.id,
          patientNom: `${newPatient.nom} ${newPatient.prenom}`,
        });
      }

      toast.success("Rendez-vous confirmé. Veuillez compléter le dossier du patient.");
      setNewPatientOpen(false);
      setAppointmentToConvert(null);
    } catch (error) {
      console.error('Failed to create patient:', error);
      toast.error("Erreur lors de la création du patient");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground">Bienvenue, Dr. Souidi</p>
        </div>

        {/* Top Row: Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-primary border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rendez-vous Aujourd'hui
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{todayRDV.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total Patients
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{totalPatients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Split View: Rendez-vous & Passages Directs */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Rendez-vous du jour */}
          <Card className="border border-border">
            <CardHeader className="bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Rendez-vous du jour
                </CardTitle>
                {todayRDV.length > 0 && !hasEnAttenteToday && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleArchiveToday}
                    className="h-8 gap-2 text-xs"
                    title="Archiver cette journée"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archiver la journée
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {todayRDV.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Aucun rendez-vous aujourd'hui</p>
              ) : (
                <div className="space-y-2">
                  {todayRDV.map((rdv) => (
                    <div
                      key={rdv.id}
                      className={`flex items-center justify-between rounded border border-border p-3 transition-colors ${
                        rdv.statut === "annulé" ? "opacity-60" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{rdv.patientNom}</p>
                        <p className="text-xs text-muted-foreground truncate">{rdv.motif}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground tabular-nums">{rdv.heure}</span>
                        {rdv.statut === "en attente" ? (
                          <button
                            onClick={() => {
                              setSelectedAppointment(rdv);
                              setAppointmentActionOpen(true);
                            }}
                            className="px-3 py-1 rounded border border-warning/30 bg-warning/5 text-warning hover:bg-warning/10 transition-colors cursor-pointer text-sm font-normal"
                            title="Cliquez pour confirmer ou rejeter"
                          >
                            En attente
                          </button>
                        ) : rdv.statut === "confirmé" ? (
                          <button
                            onClick={() => {
                              setAppointmentToConvert(rdv);
                              setNewPatientOpen(true);
                            }}
                            className="px-3 py-1 rounded border border-success/30 bg-success/5 text-success hover:bg-success/10 transition-colors cursor-pointer text-sm font-normal"
                            title="Cliquez pour créer le dossier patient"
                          >
                            Confirmé
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded border border-destructive/30 bg-destructive/5 text-destructive text-sm font-normal">
                            Annulé
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Passages Directs du Jour */}
          <Card className="border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="flex flex-row items-center justify-between bg-amber-100/50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Passages Directs du Jour
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setNewPassageOpen(true)} 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                + Nouveau Passage
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {todayPassages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Aucun passage aujourd'hui</p>
              ) : (
                <div className="space-y-2">
                  {todayPassages.map((passage) => (
                    <div
                      key={passage.id}
                      className="flex items-center justify-between rounded border border-amber-200 dark:border-amber-800 p-3 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{passage.nomPrenom}</p>
                        <p className="text-xs text-muted-foreground truncate">{passage.motif}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground tabular-nums">{passage.heure}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await deletePassageDirect(passage.id);
                                toast.success("Marqué comme passé");
                              } catch (error) {
                                console.error('Failed to complete passage:', error);
                                toast.error("Erreur lors de la suppression");
                              }
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Marquer comme passé et supprimer"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deletePassageDirect(passage.id);
                                toast.success("Marqué comme annulé");
                              } catch (error) {
                                console.error('Failed to cancel passage:', error);
                                toast.error("Erreur lors de la suppression");
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Marquer comme annulé et supprimer"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewPatientModal
        open={newPatientOpen}
        onOpenChange={setNewPatientOpen}
        categories={categories}
        onSubmit={handleNewPatientSubmit}
        prefilledData={appointmentToConvert ? {
          nom: appointmentToConvert.nom || appointmentToConvert.patientNom.split(' ')[0] || "",
          prenom: appointmentToConvert.prenom || appointmentToConvert.patientNom.split(' ').slice(1).join(' ') || "",
          telephone: appointmentToConvert.telephone,
          age: appointmentToConvert.age,
          categorie: appointmentToConvert.motif || "",
        } : undefined}
      />

      <NewRendezVousModal
        open={newRdvOpen}
        onOpenChange={setNewRdvOpen}
        categories={categories}
        onSubmit={async (rdvData) => {
          try {
            await addRendezVous(rdvData);
            toast.success("Rendez-vous ajouté");
          } catch (error) {
            console.error('Failed to add rendez-vous:', error);
            toast.error("Erreur lors de l'ajout");
          }
        }}
      />

      <NewPassageDirectModal
        open={newPassageOpen}
        onOpenChange={setNewPassageOpen}
        categories={categories}
        onSubmit={async (passageData) => {
          try {
            await addPassageDirect(passageData);
            toast.success("Passage direct ajouté");
          } catch (error) {
            console.error('Failed to add passage direct:', error);
            toast.error("Erreur lors de l'ajout");
          }
        }}
      />

      <AppointmentActionModal
        open={appointmentActionOpen}
        onOpenChange={setAppointmentActionOpen}
        appointment={selectedAppointment}
        categories={categories}
        onConfirm={handleConfirmAppointment}
        onReject={handleRejectAppointment}
      />
    </AppLayout>
  );
}
