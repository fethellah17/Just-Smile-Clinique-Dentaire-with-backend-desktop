import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { type Category, type CategoryType, type TypeStep } from "@/lib/mock-data";

interface ManageCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSubmit: (category: Omit<Category, "id">) => Promise<void>;
}

export function ManageCategoryModal({ open, onOpenChange, category, onSubmit }: ManageCategoryModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    icon: string;
    color: string;
    types: CategoryType[];
    stages: unknown[];
  }>({
    name: "",
    icon: "Stethoscope",
    color: "#6B7280",
    types: [],
    stages: [],
  });

  const [newType, setNewType] = useState("");
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(null);
  const [newStepForType, setNewStepForType] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        types: [...category.types],
        stages: category.stages || [],
      });
    } else {
      setFormData({
        name: "",
        icon: "Stethoscope",
        color: "#6B7280",
        types: [],
        stages: [],
      });
    }
    setNewType("");
    setExpandedTypeId(null);
    setNewStepForType({});
  }, [category, open]);

  const handleAddType = () => {
    if (newType.trim()) {
      const newTypeObj: CategoryType = {
        id: `type-${Date.now()}`,
        name: newType.trim(),
        steps: [],
      };
      setFormData(prev => ({
        ...prev,
        types: [...prev.types, newTypeObj],
      }));
      setNewType("");
    }
  };

  const handleRemoveType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.filter(t => t.id !== id),
    }));
  };

  const handleAddStepToType = (typeId: string) => {
    const stepName = newStepForType[typeId]?.trim();
    if (stepName) {
      setFormData(prev => ({
        ...prev,
        types: prev.types.map(type => {
          if (type.id === typeId) {
            const newStep: TypeStep = {
              id: `step-${Date.now()}`,
              name: stepName,
              order: type.steps.length + 1,
            };
            return {
              ...type,
              steps: [...type.steps, newStep],
            };
          }
          return type;
        }),
      }));
      setNewStepForType(prev => ({ ...prev, [typeId]: "" }));
    }
  };

  const handleRemoveStepFromType = (typeId: string, stepId: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.map(type => {
        if (type.id === typeId) {
          return {
            ...type,
            steps: type.steps.filter(s => s.id !== stepId).map((s, idx) => ({
              ...s,
              order: idx + 1,
            })),
          };
        }
        return type;
      }),
    }));
  };

  const handleMoveStepUp = (typeId: string, stepIndex: number) => {
    if (stepIndex > 0) {
      setFormData(prev => ({
        ...prev,
        types: prev.types.map(type => {
          if (type.id === typeId) {
            const newSteps = [...type.steps];
            [newSteps[stepIndex - 1], newSteps[stepIndex]] = [newSteps[stepIndex], newSteps[stepIndex - 1]];
            return {
              ...type,
              steps: newSteps.map((s, idx) => ({ ...s, order: idx + 1 })),
            };
          }
          return type;
        }),
      }));
    }
  };

  const handleMoveStepDown = (typeId: string, stepIndex: number, totalSteps: number) => {
    if (stepIndex < totalSteps - 1) {
      setFormData(prev => ({
        ...prev,
        types: prev.types.map(type => {
          if (type.id === typeId) {
            const newSteps = [...type.steps];
            [newSteps[stepIndex], newSteps[stepIndex + 1]] = [newSteps[stepIndex + 1], newSteps[stepIndex]];
            return {
              ...type,
              steps: newSteps.map((s, idx) => ({ ...s, order: idx + 1 })),
            };
          }
          return type;
        }),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Veuillez entrer un nom de catégorie");
      return;
    }
    if (formData.types.length === 0) {
      alert("Veuillez ajouter au moins un type de traitement");
      return;
    }
    
    // Check if all types have at least one step
    const typesWithoutSteps = formData.types.filter(t => t.steps.length === 0);
    if (typesWithoutSteps.length > 0) {
      alert(`Les types suivants n'ont pas d'étapes: ${typesWithoutSteps.map(t => t.name).join(", ")}`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        stages: formData.stages as any,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? "Modifier la Catégorie" : "Nouvelle Catégorie"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la Catégorie *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Orthodontie"
                className="max-w-md text-base md:text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Types de Traitement & Leurs Étapes *</h3>
            <div className="space-y-2">
              {formData.types.map((type) => (
                <div key={type.id} className="border border-border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-muted/50 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setExpandedTypeId(expandedTypeId === type.id ? null : type.id)}
                        className="p-1 hover:bg-accent rounded flex-shrink-0"
                      >
                        {expandedTypeId === type.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <span className="text-sm font-medium truncate">{type.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">({type.steps.length})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveType(type.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {expandedTypeId === type.id && (
                    <div className="p-3 bg-background space-y-2">
                      {type.steps.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {type.steps
                            .sort((a, b) => a.order - b.order)
                            .map((step, index) => (
                              <div key={step.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-foreground/10 text-foreground flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <span className="truncate">{step.name}</span>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveStepUp(type.id, index)}
                                    disabled={index === 0}
                                    className="h-7 w-7 p-0"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveStepDown(type.id, index, type.steps.length)}
                                    disabled={index === type.steps.length - 1}
                                    className="h-7 w-7 p-0"
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveStepFromType(type.id, step.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newStepForType[type.id] || ""}
                          onChange={(e) => setNewStepForType(prev => ({ ...prev, [type.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStepToType(type.id))}
                          placeholder="Ajouter une étape..."
                          className="text-sm text-base md:text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddStepToType(type.id)}
                          size="sm"
                          variant="outline"
                          className="border-[#800020] text-[#800020] hover:bg-[#800020]/10 flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddType())}
                placeholder="Ajouter un type..."
                className="text-base md:text-sm"
              />
              <Button
                type="button"
                onClick={handleAddType}
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-[#800020]/10 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-4 border-t">
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-[#800020] hover:bg-[#600018]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : (category ? "Mettre à jour" : "Créer")} {!isSubmitting && 'Catégorie'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
