import type { RegistrationItem } from "../types";

type RegistrationAnswer = RegistrationItem["answers"][string];

export function getRegistrationAnswerEntries(row?: RegistrationItem | null) {
  if (!row?.answers) return [];

  return Object.entries(row.answers).sort(([, a], [, b]) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });
}

export function getRegistrationPrimaryAnswer(
  row?: RegistrationItem | null,
): string {
  const first = getRegistrationAnswerEntries(row)[0]?.[1] as RegistrationAnswer | undefined;
  const value = first?.value;
  return value === null || value === undefined ? "" : String(value);
}
