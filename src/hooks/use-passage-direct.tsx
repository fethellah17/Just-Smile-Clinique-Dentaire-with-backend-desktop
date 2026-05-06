import { useData } from "@/lib/data-context";

export function usePassageDirect() {
  const { passagesDirects, addPassageDirect, updatePassageDirect, deletePassageDirect } = useData();
  return { passagesDirects: passagesDirects || [], addPassageDirect, updatePassageDirect, deletePassageDirect };
}
