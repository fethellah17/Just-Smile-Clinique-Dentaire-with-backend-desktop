import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Patient, type Category, type CategoryType } from "@/lib/mock-data";

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  categories: Category[];
  onSubmit: (patient: Omit<Patient, "id" | "dateCreation">) => void;
}

export function EditPatientModal({ open, onOpenChange, patient, categories, onSubmit }: EditPatientModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    telephone: "",
    antecedents: "",
    categorie: "",
    type: "",
    typeSoin: "",
    typeSoinId: "",
    etapeActuelle: "",
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);

  // Initialize form with patient data when modal opens
  useEffect(() => {
    if (open && patient) {
      setFormData({
        nom: patient.nom,
        prenom: patient.prenom,
        age: patient.age.toString(),
        telephone: patient.telephone,
        antecedents: patient.antecedents,
        categorie: patient.categorie,
        type: patient.typeSoin || "",
        typeSoin: patient.typeSoin || "",
        typeSoinId: patient.typeSoinId || "",
        etapeActuelle: patient.etapeActuelle || "",
      });

      // Set selected category
      const category = categories.find(c => c.name === patient.categorie);
      setSelectedCategory(category || null);

      // Set selected type
      if (category && patient.typeSoin) {
        const type = category.types.find(t => t.name === patient.typeSoin);
        setSelectedType(type || null);
      }
    }
  }, [open, patient, categories]);

  // Update selected category when categorie changes
  useEffect(() => {
    if (formData.categorie) {
      const category = categories.find(c => c.name === formData.categorie);
      setSelectedCategory(category || null);
      // Reset type when category changes
      setFormData(prev => ({ ...prev, type: "" }));
      setSelectedType(null);
    } else {
      setSelectedCategory(null);
      setSelectedType(null);
    }
  }, [formData.categorie, categories]);

  // Update selected type when type changes
  useEffect(() => {
    if (formData.type && selectedCategory) {
      const type = selectedCategory.types.find(t => t.name === formData.type);
      setSelectedType(type || null);
      if (type) {
        setFormData(prev => ({
          ...prev,
          typeSoin: type.name,
          typeSoinId: type.id,
        }));
      }
    } else {
      setSelectedType(null);
      setFormData(prev => ({
        ...prev,
        typeSoin: "",
        typeSoinId: "",
      }));
    }
  }, [formData.type, selectedCategory]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.age || !formData.telephone || !formData.categorie) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    onSubmit({
      nom: formData.nom,
      prenom: formData.prenom,
      age: parseInt(formData.age),
      telephone: formData.telephone,
      antecedents: formData.antecedents,
      categorie: formData.categorie,
      typeSoin: formData.typeSoin || undefined,
      typeSoinId: formData.typeSoinId || undefined,
      etapeActuelle: formData.etapeActuelle || undefined,
      stepsCompleted: patient?.stepsCompleted || [],
      montantTotal: patient?.montantTotal || 0,
      montantPaye: patient?.montantPaye || 0,
      paymentHistory: patient?.paymentHistory || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nom">Nom *</Label>
              <Input
                id="edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Benali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prenom">Prénom *</Label>
              <Input
                id="edit-prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Fatima"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-age">Âge *</Label>
              <Input
                id="edit-age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="34"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telephone">Téléphone *</Label>
              <Input
                id="edit-telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="0551234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-antecedents">Antécédents Médicaux</Label>
            <Textarea
              id="edit-antecedents"
              value={formData.antecedents}
              onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
              placeholder="Diabète, Allergie, etc."
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-categorie">Catégorie *</Label>
            <Select value={formData.categorie} onValueChange={(value) => setFormData({ ...formData, categorie: value })}>
              <SelectTrigger id="edit-categorie">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type dropdown - appears after category selection */}
          {selectedCategory && selectedCategory.types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Sélectionner un type (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.types.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="submit" className="bg-[#800020] hover:bg-[#600018]">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
