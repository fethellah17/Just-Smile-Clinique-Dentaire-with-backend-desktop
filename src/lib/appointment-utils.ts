import { RendezVous } from "./mock-data";

/**
 * Checks if a date has any pending appointments
 */
export function hasActivePendingAppointments(
  date: string,
  appointments: RendezVous[]
): boolean {
  return (appointments || [])
    .filter((rdv) => rdv.date === date)
    .some((rdv) => rdv.statut === "en attente");
}

/**
 * Separates appointments into active (not archived) and archived (manually archived)
 */
export function separateActiveAndArchived(appointments: RendezVous[]): {
  active: RendezVous[];
  archived: RendezVous[];
} {
  const safeAppointments = appointments || [];
  const active = safeAppointments.filter((rdv) => !rdv.archived);
  const archived = safeAppointments.filter((rdv) => rdv.archived);

  return { active, archived };
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Sorts dates with today first, then ascending order
 */
export function sortDatesWithTodayFirst(dates: string[]): string[] {
  const today = getTodayDate();

  return (dates || []).sort((a, b) => {
    // Today comes first
    if (a === today) return -1;
    if (b === today) return 1;

    // Then sort by date ascending (nearest future dates first)
    return a.localeCompare(b);
  });
}

/**
 * Groups appointments by date and returns sorted date keys
 */
export function groupAndSortAppointments(
  appointments: RendezVous[]
): {
  grouped: Record<string, RendezVous[]>;
  sortedDates: string[];
} {
  const safeAppointments = appointments || [];
  const grouped = safeAppointments.reduce<Record<string, RendezVous[]>>(
    (acc, rdv) => {
      if (!acc[rdv.date]) acc[rdv.date] = [];
      acc[rdv.date].push(rdv);
      return acc;
    },
    {}
  );

  const sortedDates = sortDatesWithTodayFirst(Object.keys(grouped));

  return { grouped, sortedDates };
}

/**
 * Checks if there are any active (non-archived) appointments
 */
export function hasAnyActiveAppointments(appointments: RendezVous[]): boolean {
  return (appointments || []).some((rdv) => !rdv.archived);
}

/**
 * Checks if a specific date has any pending appointments
 */
export function hasAnyPendingAppointmentsForDate(
  appointments: RendezVous[],
  date: string
): boolean {
  return (appointments || [])
    .filter((rdv) => rdv.date === date && !rdv.archived)
    .some((rdv) => rdv.statut === "en attente");
}

/**
 * Checks if a specific date has any appointments to archive
 */
export function canArchiveDate(
  appointments: RendezVous[],
  date: string
): boolean {
  const safeAppointments = appointments || [];
  const dateAppointments = safeAppointments.filter(
    (rdv) => rdv.date === date && !rdv.archived
  );
  return (
    dateAppointments.length > 0 &&
    !dateAppointments.some((rdv) => rdv.statut === "en attente")
  );
}
