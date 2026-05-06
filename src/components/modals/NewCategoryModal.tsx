import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Category } from "@/lib/mock-data";

interface NewCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: Omit<Category, "id">) => Promise<void>;
}

const ICON_OPTIONS = ["🔪", "🦷", "👄", "✨", "📐", "🪥", "💉", "🩺", "🧬", "⚕️"];
const COLOR_OPTIONS = [
  { name: "Rouge", value: "#DC2626" },
  { name: "Orange", value: "#D97706" },
  { name: "Ambre", value: "#F59E0B" },
  { name: "Rose", value: "#EC4899" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Vert", value: "#10B981" },
  { name: "Bleu", value: "#3B82F6" },
];

export function NewCategoryModal({ open, onOpenChange, onSubmit }: NewCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "🦷",
    color: "#800020",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Veuillez entrer un nom de catégorie");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        types: [],
        stages: [],
      });
      setFormData({ name: "", icon: "🦷", color: "#800020" });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Erreur lors de la création de la catégorie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Nouvelle Catégorie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Implantologie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icône</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger id="icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS?.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="text-lg">{icon}</span>
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Couleur</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger id="color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: option.value }}
                      />
                      {option.name}
                    </div>
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md flex items-center gap-2">
            <span className="text-2xl">{formData.icon}</span>
            <span className="text-sm text-muted-foreground">Aperçu</span>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="submit" 
              className="bg-[#800020] hover:bg-[#600018]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter Catégorie'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
