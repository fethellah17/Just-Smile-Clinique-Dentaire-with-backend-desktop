import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type RendezVous, type Category } from "@/lib/mock-data";

interface NewRendezVousModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSubmit: (rdv: Omit<RendezVous, "id">) => void;
  prefilledDate?: string;
}

export function NewRendezVousModal({ open, onOpenChange, categories, onSubmit, prefilledDate }: NewRendezVousModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    age: "",
    categorie: "",
    date: "",
    heure: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        age: "",
        categorie: "",
        date: "",
        heure: "",
      });
    } else if (prefilledDate) {
      // Pre-fill the date when modal opens with a specific date
      setFormData(prev => ({
        ...prev,
        date: prefilledDate,
      }));
    }
  }, [open, prefilledDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.prenom || !formData.date || !formData.heure || !formData.categorie) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    onSubmit({
      patientId: "",
      patientNom: `${formData.nom} ${formData.prenom}`,
      nom: formData.nom,
      prenom: formData.prenom,
      date: formData.date,
      heure: formData.heure,
      motif: formData.categorie,
      statut: "en attente",
      telephone: formData.telephone || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
    });

    setFormData({
      nom: "",
      prenom: "",
      telephone: "",
      age: "",
      categorie: "",
      date: "",
      heure: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Nouveau Rendez-vous</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Hadj-bouziane"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom" className="text-sm">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Fethellah"
                className="text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone" className="text-sm">Téléphone (Optionnel)</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="0795632344"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm">Âge (Optionnel)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="25"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie" className="text-sm">Catégorie de Soin *</Label>
            <Select value={formData.categorie} onValueChange={(value) => setFormData({ ...formData, categorie: value })}>
              <SelectTrigger id="categorie" className="text-base">
                <SelectValue placeholder={categories.length === 0 ? "Aucune catégorie trouvée" : "Sélectionner une catégorie"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Aucune catégorie trouvée
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heure" className="text-sm">Heure *</Label>
              <Input
                id="heure"
                type="time"
                value={formData.heure}
                onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                className="text-base"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-[#800020] hover:bg-[#600018] text-sm sm:text-base">
              Ajouter RDV
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
