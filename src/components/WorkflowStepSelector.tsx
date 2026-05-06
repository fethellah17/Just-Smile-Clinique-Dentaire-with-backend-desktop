import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CategoryType } from "@/lib/mock-data";

interface WorkflowStepSelectorProps {
  currentStep: string | undefined;
  type: CategoryType | undefined;
  onStepChange: (stepName: string) => void;
}

export function WorkflowStepSelector({
  currentStep,
  type,
  onStepChange,
}: WorkflowStepSelectorProps) {
  const [open, setOpen] = useState(false);

  if (!type || !type.steps || type.steps.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">-</span>
    );
  }

  const sortedSteps = [...type.steps].sort((a, b) => a.order - b.order);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs font-normal border-[#800020]/30 hover:bg-[#800020]/5 hover:border-[#800020]/50"
        >
          <span className="truncate max-w-[120px]">{currentStep || "Sélectionner"}</span>
          <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Étapes disponibles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedSteps.map((step) => (
          <DropdownMenuItem
            key={step.id}
            onClick={() => {
              onStepChange(step.name);
              setOpen(false);
            }}
            className="text-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-medium text-muted-foreground min-w-fit">
                {step.order}.
              </span>
              <span className={currentStep === step.name ? "font-semibold text-[#800020]" : ""}>
                {step.name}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
