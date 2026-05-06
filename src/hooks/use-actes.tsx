import { useData } from "@/lib/data-context";

export function useActes() {
  const { actes, addActe, updateActe, deleteActe } = useData();

  const getActesByPatient = (patientId: string) => {
    return (actes || []).filter(a => a.patientId === patientId);
  };

  const getTotalDebtByPatient = (patientId: string) => {
    return (actes || [])
      .filter(a => a.patientId === patientId)
      .reduce((sum, a) => sum + a.resteAPayer, 0);
  };

  return { actes: actes || [], addActe, updateActe, deleteActe, getActesByPatient, getTotalDebtByPatient };
}
