import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = "Nouveau Patient" }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#800020] hover:bg-[#600018] p-0 flex items-center justify-center md:hidden z-40"
      title={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
