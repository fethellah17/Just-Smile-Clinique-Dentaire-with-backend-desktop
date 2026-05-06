import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/LoginPage";
import { useCategories } from "@/hooks/use-categories";
import { usePatients } from "@/hooks/use-patients";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ManageCategoryModal } from "@/components/modals/ManageCategoryModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Category } from "@/lib/mock-data";

export const Route = createFileRoute("/configurations/categories")({
  component: CategoriesConfigPage,
  head: () => ({
    meta: [{ title: "Catégories de Soins - Just Smile" }],
  }),
});

function CategoriesConfigPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory, isLoaded } = useCategories();
  const { patients } = usePatients();

  // UI Guard: Ensure categories is always an array
  if (!categories || !Array.isArray(categories)) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
            <p className="mt-4 text-slate-600">Chargement des catégories...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate active patients for each category
  const getPatientCountForCategory = (categoryName: string): number => {
    return patients.filter(p => p.categorie === categoryName).length;
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setManageOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setManageOpen(true);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, "id">) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      setManageOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Erreur lors de la sauvegarde de la catégorie');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteCategory(id);
      setDeleteConfirm(null);
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Erreur lors de la suppression de la catégorie');
    } finally {
      setIsDeleting(false);
    }
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

  // Show loading state while categories are being fetched
  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="space-y-6 px-4 md:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Catégories de Soins</h1>
              <p className="text-sm text-muted-foreground">Configurez les catégories, types et étapes de traitement</p>
            </div>
            <Button onClick={handleAddCategory} className="w-full md:w-auto bg-[#800020] hover:bg-[#600018]">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Catégorie
            </Button>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
            <p className="mt-4 text-muted-foreground">Chargement des catégories...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Catégories de Soins</h1>
            <p className="text-sm text-muted-foreground">Configurez les catégories, types et étapes de traitement</p>
          </div>
          <Button onClick={handleAddCategory} className="w-full md:w-auto bg-[#800020] hover:bg-[#600018]">
            <Plus className="h-4 w-4 mr-2" /> Nouvelle Catégorie
          </Button>
        </div>

        <div className="grid gap-4">
          {!Array.isArray(categories) || categories.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Aucune catégorie définie</p>
                <Button onClick={handleAddCategory} className="bg-[#800020] hover:bg-[#600018]">
                  <Plus className="h-4 w-4 mr-2" /> Créer votre première catégorie
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
            const patientCount = getPatientCountForCategory(category.name);
            return (
              <Card key={category.id} className="overflow-hidden border border-border">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 w-full">
                      <button
                        onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                        className="p-1.5 hover:bg-accent rounded transition-colors flex-shrink-0"
                      >
                        {expandedId === category.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <h3 className="font-semibold text-base text-foreground truncate">{category.name}</h3>
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                            {patientCount} patient{patientCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(category.types || []).length} type{(category.types || []).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 w-full md:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 md:flex-none text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(category.id)}
                        className="flex-1 md:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedId === category.id && (
                  <CardContent className="space-y-4 border-t pt-4 bg-background">
                    <div>
                      <h4 className="font-medium text-xs uppercase tracking-wide mb-3 text-muted-foreground">Types de Traitement</h4>
                      <div className="space-y-3">
                        {Array.isArray(category.types) && category.types.length > 0 ? (
                          category.types.map((type) => (
                            <div key={type.id} className="border border-border rounded overflow-hidden">
                              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                                <span className="text-sm font-medium text-foreground">{type.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {(type.steps || []).length} étape(s)
                                </span>
                              </div>
                              {Array.isArray(type.steps) && type.steps.length > 0 && (
                                <div className="px-3 py-2 bg-background space-y-1">
                                  {type.steps
                                    .sort((a, b) => a.order - b.order)
                                    .map((step, index) => (
                                      <div key={step.id} className="flex items-center gap-2 text-xs py-1">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-foreground/10 text-foreground">
                                          {index + 1}
                                        </div>
                                        <span className="text-muted-foreground">{step.name}</span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic px-3 py-2">Aucun type défini</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          }))}
        </div>
      </div>

      <ManageCategoryModal
        open={manageOpen}
        onOpenChange={setManageOpen}
        category={editingCategory}
        onSubmit={handleSaveCategory}
      />

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteCategory(deleteConfirm)}
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
