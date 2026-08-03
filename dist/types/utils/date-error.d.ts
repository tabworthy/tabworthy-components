export type DateErrorLabel = string | ((date: string) => string);
export declare const formatDateError: (label: DateErrorLabel, date: string) => string;
