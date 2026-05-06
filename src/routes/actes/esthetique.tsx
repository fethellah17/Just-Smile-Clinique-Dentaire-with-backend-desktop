import { createFileRoute } from "@tanstack/react-router";
import { ActesModule } from "@/components/ActesModule";

export const Route = createFileRoute("/actes/esthetique")({
  component: () => <ActesModule categorie="Soins Esthétiques" titre="Blanchiment & Soins Esthétiques" />,
  head: () => ({ meta: [{ title: "Esthétique - Just Smile" }] }),
});
