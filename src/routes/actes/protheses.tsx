import { createFileRoute } from "@tanstack/react-router";
import { ActesModule } from "@/components/ActesModule";

export const Route = createFileRoute("/actes/protheses")({
  component: () => <ActesModule categorie="Prothèse Fixe" titre="Bridge céramique & Prothèses" />,
  head: () => ({ meta: [{ title: "Prothèses - Just Smile" }] }),
});
