import { useData } from "@/lib/data-context";

export function useRendezVous() {
  const { rendezVous, addRendezVous, updateRendezVous, deleteRendezVous, toggleRendezVousStatut, archiveRendezVousByDate } = useData();
  return { 
    rendezVous: rendezVous || [], 
    addRendezVous, 
    updateRendezVous, 
    deleteRendezVous, 
    toggleStatut: toggleRendezVousStatut,
    archiveByDate: archiveRendezVousByDate
  };
}
