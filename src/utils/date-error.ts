export type DateErrorLabel = string | ((date: string) => string);

export const formatDateError = (label: DateErrorLabel, date: string): string =>
  typeof label === "function" ? label(date) : `${label} ${date}`;
