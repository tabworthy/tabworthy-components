export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);

  return newDate;
}

export function getDaysOfMonth(
  date: Date,
  padded: boolean,
  firstDayOfWeek: number
): Date[] {
  const days: Date[] = [];
  const firstOfMonth = getFirstOfMonth(date);
  const firstDayMonth = firstOfMonth.getDay() === 0 ? 7 : firstOfMonth.getDay();
  const lastOfMonth = getLastOfMonth(date);
  const lastDayOfMonth = lastOfMonth.getDay() === 0 ? 7 : lastOfMonth.getDay();
  const lastDayOfWeek = firstDayOfWeek === 1 ? 7 : firstDayOfWeek - 1;
  const leftPaddingDays: Date[] = [];
  const rightPaddingDays: Date[] = [];

  if (padded) {
    const leftPadding = (7 - firstDayOfWeek + firstDayMonth) % 7;

    let leftPaddingAmount = leftPadding;
    let leftPaddingDay = getPreviousDay(firstOfMonth);

    while (leftPaddingAmount > 0) {
      leftPaddingDays.push(leftPaddingDay);
      leftPaddingDay = getPreviousDay(leftPaddingDay);
      leftPaddingAmount -= 1;
    }

    leftPaddingDays.reverse();

    const rightPadding = (7 - lastDayOfMonth + lastDayOfWeek) % 7;

    let rightPaddingAmount = rightPadding;
    let rightPaddingDay = getNextDay(lastOfMonth);

    while (rightPaddingAmount > 0) {
      rightPaddingDays.push(rightPaddingDay);
      rightPaddingDay = getNextDay(rightPaddingDay);
      rightPaddingAmount -= 1;
    }
  }

  let currentDay = firstOfMonth;

  while (currentDay.getMonth() === date.getMonth()) {
    days.push(currentDay);
    currentDay = getNextDay(currentDay);
  }

  return [...leftPaddingDays, ...days, ...rightPaddingDays];
}

export function getFirstOfMonth(date: Date): Date {
  const firstOfMonth = removeTimezoneOffset(
    new Date(`${getYear(date)}-${String(getMonth(date)).padStart(2, "0")}-01`)
  );
  return firstOfMonth;
}

function getISODateStringHistoricalImplementation(
  date: Date
): string | undefined {
  if (!(date instanceof Date)) {
    return;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getISODateString(date: Date): string {
  // this is a lie, but can have unpredictable issues because heavily used,
  // so atm keeping historical implementation, until better test coverage and confidence is achieved
  return getISODateStringHistoricalImplementation(date) as string;
}

export function getLastOfMonth(date: Date): Date {
  const newDate = getFirstOfMonth(date);

  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(newDate.getDate() - 1);

  return newDate;
}

export function getMonth(date: Date): number {
  return date.getMonth() + 1;
}

export function getMonths(locale?: string): string[] {
  return new Array(12).fill(undefined).map((_, month) => {
    const date = removeTimezoneOffset(
      new Date(`2006-${String(month + 1).padStart(2, "0")}-01`)
    );

    return Intl.DateTimeFormat(locale, {
      month: "long"
    }).format(date);
  });
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

export function getNextMonth(date: Date): Date {
  const newDate = new Date(date);

  newDate.setMonth(newDate.getMonth() + 1);

  return newDate;
}

export function getNextYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setFullYear(newDate.getFullYear() + 1);

  return newDate;
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);

  newDate.setMonth(newDate.getMonth() - 1);
  return newDate;
}

export function getPreviousYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setFullYear(newDate.getFullYear() - 1);

  return newDate;
}

export function getWeekDays(
  firstDayOfWeek: number,
  locale?: string
): string[][] {
  return new Array(7)
    .fill(undefined)
    .map((_, index) => ((firstDayOfWeek + index) % 7) + 1)
    .map((day) => {
      const date = new Date(2006, 0, day);

      return [
        Intl.DateTimeFormat(locale, {
          weekday: "short"
        }).format(date),
        Intl.DateTimeFormat(locale, {
          weekday: "long"
        }).format(date)
      ];
    });
}

export function getYear(date: Date): number {
  return date.getFullYear();
}

export function isDateInRange(date: Date, range: { from: Date; to: Date }) {
  if (!date || !range || !range.from || !range.to) {
    return false;
  }

  const earlyDate = range.from < range.to ? range.from : range.to;
  const laterDate = range.from < range.to ? range.to : range.from;

  return date >= earlyDate && date <= laterDate;
}

export function isSameDay(date1?: Date | null, date2?: Date | null) {
  if (!date1 || !date2) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function removeTimezoneOffset(date: Date): Date {
  const newDate = new Date(date);

  newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());

  return newDate;
}

/**
 * Parse a date boundary string to a local Date.
 * Date-only strings ("YYYY-MM-DD") are parsed as UTC by JS, so we apply removeTimezoneOffset.
 * Datetime strings (containing "T" or space+time) are already parsed as local time.
 */
export function parseDateString(dateString: string): Date {
  const hasTime =
    dateString.includes("T") ||
    /\d{4}-\d{2}-\d{2}\s\d{2}:/.test(dateString);
  const parsed = new Date(dateString);
  return hasTime ? parsed : removeTimezoneOffset(parsed);
}

export function subDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() - days);

  return newDate;
}

export function dateIsWithinLowerBounds(date: Date, minDate?: string): boolean {
  if (minDate) {
    const min = parseDateString(minDate);
    return date >= min || isSameDay(min, date);
  } else return true;
}

export function dateIsWithinUpperBounds(date: Date, maxDate?: string): boolean {
  if (maxDate) {
    const max = parseDateString(maxDate);
    return date <= max || isSameDay(date, max);
  } else return true;
}

export function dateIsWithinBounds(
  date: Date,
  minDate?: string,
  maxDate?: string
): boolean {
  return (
    dateIsWithinLowerBounds(date, minDate) &&
    dateIsWithinUpperBounds(date, maxDate)
  );
}

export function monthIsDisabled(
  month: number,
  year: number,
  minDate?: string,
  maxDate?: string
) {
  if (minDate) {
    const min = parseDateString(minDate);
    const minYear = min.getFullYear();
    const minMonth = min.getMonth();
    if (year < minYear || (year === minYear && month < minMonth)) return true;
  }
  if (maxDate) {
    const max = parseDateString(maxDate);
    const maxYear = max.getFullYear();
    const maxMonth = max.getMonth();
    if (year > maxYear || (year === maxYear && month > maxMonth)) return true;
  }
  return false;
}

export function isValidISODate(dateString: string): boolean {
  var isoFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (dateString.match(isoFormat) == null) {
    return false;
  } else {
    var d = new Date(dateString);
    return !isNaN(d.getTime());
  }
}

export function extractDates(text: string) {
  var dateRegex = /\d{4}-\d{2}-\d{2}/g;
  var matches = text.match(dateRegex);
  return matches?.slice(0, 2);
}
