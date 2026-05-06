import { createFileRoute } from "@tanstack/react-router";
import { ActesModule } from "@/components/ActesModule";

export const Route = createFileRoute("/actes/chirurgie")({
  component: () => <ActesModule categorie="Chirurgie" titre="Chirurgie & Extractions" />,
  head: () => ({ meta: [{ title: "Chirurgie - Just Smile" }] }),
});
