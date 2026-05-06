import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/LoginPage";
import { usePatients } from "@/hooks/use-patients";
import { useActes } from "@/hooks/use-actes";
import { useCategories } from "@/hooks/use-categories";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { NewActeModal } from "@/components/modals/NewActeModal";
import { NewCategoryModal } from "@/components/modals/NewCategoryModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  categorie: string;
  titre: string;
}

export function ActesModule({ categorie, titre }: Props) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;

  const { patients } = usePatients();
  const { actes, addActe, deleteActe } = useActes();
  const { categories, addCategory } = useCategories();
  const [newActeOpen, setNewActeOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = actes.filter((a) => a.categorie === categorie);

  const handleDeleteCategory = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      await deleteActe(deleteConfirm);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete acte:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{titre}</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} acte(s) enregistré(s)</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setNewActeOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Nouvel Acte
            </Button>
            <Button onClick={() => setNewCategoryOpen(true)} variant="outline" className="border-border">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une Catégorie
            </Button>
          </div>
        </div>

        <Card className="border border-border">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun acte dans cette catégorie</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                    <TableHead className="text-right font-semibold">Versé</TableHead>
                    <TableHead className="text-right font-semibold">Reste</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((a) => {
                    const patient = patients?.find((p) => p.id === a.patientId);
                    return (
                      <TableRow key={a.id} className="hover:bg-muted/30 border-b border-border">
                        <TableCell className="font-medium text-foreground">
                          {patient?.prenom} {patient?.nom}
                        </TableCell>
                        <TableCell className="text-foreground">{a.type}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(a.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-right tabular-nums text-foreground">{a.montantTotal.toLocaleString("fr-DZ")} DA</TableCell>
                        <TableCell className="text-right text-success tabular-nums font-semibold">{a.montantVerse.toLocaleString("fr-DZ")} DA</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`font-normal tabular-nums ${
                              a.resteAPayer > 0 
                                ? "border-destructive/30 bg-destructive/5 text-destructive" 
                                : "border-success/30 bg-success/5 text-success"
                            }`}
                          >
                            {a.resteAPayer.toLocaleString("fr-DZ")} DA
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(a.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) ?? null}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <NewActeModal
        open={newActeOpen}
        onOpenChange={setNewActeOpen}
        patients={patients}
        categories={categories}
        defaultCategory={categories.find(c => c.name === categorie)?.id}
        onSubmit={addActe}
      />

      <NewCategoryModal
        open={newCategoryOpen}
        onOpenChange={setNewCategoryOpen}
        onSubmit={addCategory}
      />

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'acte</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet acte ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
