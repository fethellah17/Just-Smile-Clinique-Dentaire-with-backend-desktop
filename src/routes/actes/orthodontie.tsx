import { createFileRoute } from "@tanstack/react-router";
import { ActesModule } from "@/components/ActesModule";

export const Route = createFileRoute("/actes/orthodontie")({
  component: () => <ActesModule categorie="Orthodontie" titre="ODF (Orthodontie)" />,
  head: () => ({ meta: [{ title: "Orthodontie - Just Smile" }] }),
});
