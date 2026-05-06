import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Patient, type Acte, type Category, type ActeStepProgress } from "@/lib/mock-data";

interface NewActeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  categories: Category[];
  defaultCategory?: string;
  onSubmit: (acte: Omit<Acte, "id" | "resteAPayer">) => void;
}

export function NewActeModal({ open, onOpenChange, patients, categories, defaultCategory, onSubmit }: NewActeModalProps) {
  const [formData, setFormData] = useState({
    patientId: "",
    categoryId: defaultCategory || "",
    typeId: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    montantTotal: "",
    montantVerse: "",
  });

  useEffect(() => {
    if (defaultCategory) {
      setFormData(prev => ({ ...prev, categoryId: defaultCategory }));
    }
  }, [defaultCategory]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedType = selectedCategory?.types.find(t => t.id === formData.typeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.categoryId || !formData.typeId || !formData.montantTotal) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const montantTotal = parseFloat(formData.montantTotal);
    const montantVerse = parseFloat(formData.montantVerse) || 0;

    if (montantVerse > montantTotal) {
      alert("Le montant versé ne peut pas dépasser le montant total");
      return;
    }

    // Initialize step progress for the selected type
    const stepProgress: ActeStepProgress[] = selectedType?.steps.map(step => ({
      stepId: step.id,
      stepName: step.name,
      completed: false,
    })) || [];

    onSubmit({
      patientId: formData.patientId,
      type: selectedType?.name || "",
      typeId: formData.typeId,
      categorie: selectedCategory?.name || "",
      categoryId: formData.categoryId,
      description: formData.description,
      date: formData.date,
      stepProgress,
      montantTotal,
      montantVerse,
    });

    setFormData({
      patientId: "",
      categoryId: defaultCategory || "",
      typeId: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      montantTotal: "",
      montantVerse: "",
    });
    onOpenChange(false);
  };

  const resteAPayer = formData.montantTotal && formData.montantVerse
    ? parseFloat(formData.montantTotal) - parseFloat(formData.montantVerse)
    : formData.montantTotal ? parseFloat(formData.montantTotal) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Acte Médical</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Sélectionner un patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nom} {p.prenom}
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie *</Label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value, typeId: "" })}>
              <SelectTrigger id="categorie">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <Label htmlFor="type">Type de traitement *</Label>
              <Select value={formData.typeId} onValueChange={(value) => setFormData({ ...formData, typeId: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedType && selectedType.steps.length > 0 && (
            <div className="space-y-2 p-3 bg-muted/30 rounded border border-border">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Étapes du traitement</Label>
              <div className="space-y-1">
                {selectedType.steps
                  .sort((a, b) => a.order - b.order)
                  .map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-foreground/10 text-foreground">
                        {index + 1}
                      </div>
                      <span className="text-foreground">{step.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Détails du traitement"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montantTotal">Montant Total (DA) *</Label>
              <Input
                id="montantTotal"
                type="number"
                value={formData.montantTotal}
                onChange={(e) => setFormData({ ...formData, montantTotal: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantVerse">Montant Versé (DA)</Label>
              <Input
                id="montantVerse"
                type="number"
                value={formData.montantVerse}
                onChange={(e) => setFormData({ ...formData, montantVerse: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">Reste à payer:</p>
            <p className="text-lg font-semibold text-foreground">{resteAPayer.toFixed(2)} DA</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="submit" className="bg-[#800020] hover:bg-[#600018]">
              Ajouter Acte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
