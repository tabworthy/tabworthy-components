export declare function addDays(date: Date, days: number): Date;
export declare function getDaysOfMonth(date: Date, padded: boolean, firstDayOfWeek: number): Date[];
export declare function getFirstOfMonth(date: Date): Date;
export declare function getISODateString(date: Date): string;
export declare function getLastOfMonth(date: Date): Date;
export declare function getMonth(date: Date): number;
export declare function getMonths(locale?: string): string[];
export declare function getNextDay(date: Date): Date;
export declare function getNextMonth(date: Date): Date;
export declare function getNextYear(date: Date): Date;
export declare function getPreviousDay(date: Date): Date;
export declare function getPreviousMonth(date: Date): Date;
export declare function getPreviousYear(date: Date): Date;
export declare function getWeekDays(firstDayOfWeek: number, locale?: string): string[][];
export declare function getYear(date: Date): number;
export declare function isDateInRange(date: Date, range: {
    from: Date;
    to: Date;
}): boolean;
export declare function isSameDay(date1?: Date | null, date2?: Date | null): boolean;
export declare function removeTimezoneOffset(date: Date): Date;
/**
 * Parse a date boundary string to a local Date.
 * Date-only strings ("YYYY-MM-DD") are parsed as UTC by JS, so we apply removeTimezoneOffset.
 * Datetime strings (containing "T" or space+time) are already parsed as local time.
 */
export declare function parseDateString(dateString: string): Date;
export declare function subDays(date: Date, days: number): Date;
export declare function dateIsWithinLowerBounds(date: Date, minDate?: string): boolean;
export declare function dateIsWithinUpperBounds(date: Date, maxDate?: string): boolean;
export declare function dateIsWithinBounds(date: Date, minDate?: string, maxDate?: string): boolean;
export declare function monthIsDisabled(month: number, year: number, minDate?: string, maxDate?: string): boolean;
export declare function isValidISODate(dateString: string): boolean;
export declare function extractDates(text: string): string[];
