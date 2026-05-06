import { useData } from "@/lib/data-context";

export function usePatients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  return { patients: patients || [], addPatient, updatePatient, deletePatient };
}
