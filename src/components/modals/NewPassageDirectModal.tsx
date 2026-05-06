import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PassageDirect, type Category } from "@/lib/mock-data";

interface NewPassageDirectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSubmit: (passage: Omit<PassageDirect, "id">) => void;
}

export function NewPassageDirectModal({ open, onOpenChange, categories, onSubmit }: NewPassageDirectModalProps) {
  const [formData, setFormData] = useState({
    nomPrenom: "",
    motif: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        nomPrenom: "",
        motif: "",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomPrenom || !formData.motif) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);

    onSubmit({
      nomPrenom: formData.nomPrenom,
      date: todayStr,
      heure: timeStr,
      motif: formData.motif,
      statut: "en attente",
    });

    setFormData({
      nomPrenom: "",
      motif: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Nouveau Passage Direct</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomPrenom" className="text-sm">Nom et Prénom *</Label>
            <Input
              id="nomPrenom"
              value={formData.nomPrenom}
              onChange={(e) => setFormData({ ...formData, nomPrenom: e.target.value })}
              placeholder="Hadj-bouziane Fethellah"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motif" className="text-sm">Catégorie de Soin *</Label>
            <Select value={formData.motif} onValueChange={(value) => setFormData({ ...formData, motif: value })}>
              <SelectTrigger id="motif" className="text-base">
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

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-[#800020] hover:bg-[#600018] text-sm sm:text-base">
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
