import { createFileRoute } from "@tanstack/react-router";
import { ActesModule } from "@/components/ActesModule";

export const Route = createFileRoute("/actes/soins")({
  component: () => <ActesModule categorie="Soins de base" titre="Soins de base" />,
  head: () => ({ meta: [{ title: "Soins de base - Just Smile" }] }),
});
