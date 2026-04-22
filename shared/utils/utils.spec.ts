import {
  addDays,
  subDays,
  getNextDay,
  getPreviousDay,
  getNextMonth,
  getPreviousMonth,
  getNextYear,
  getPreviousYear,
  getDaysOfMonth,
  getFirstOfMonth,
  getLastOfMonth,
  getISODateString,
  getMonth,
  getYear,
  getMonths,
  getWeekDays,
  isSameDay,
  isDateInRange,
  dateIsWithinBounds,
  dateIsWithinUpperBounds,
  dateIsWithinLowerBounds,
  monthIsDisabled,
  isValidISODate,
  extractDates,
  removeTimezoneOffset
} from "./utils";

describe("utils", () => {
  it("supports date arithmetic and navigation", () => {
    expect(addDays(new Date("2022-01-01"), 10)).toEqual(new Date("2022-01-11"));
    expect(subDays(new Date("2022-01-11"), 10)).toEqual(new Date("2022-01-01"));
    expect(getNextDay(new Date("2022-01-31"))).toEqual(new Date("2022-02-01"));
    expect(getPreviousDay(new Date("2022-01-01"))).toEqual(
      new Date("2021-12-31")
    );
    expect(getNextMonth(new Date("2022-12-20"))).toEqual(
      new Date("2023-01-20")
    );
    expect(getPreviousMonth(new Date("2022-01-20"))).toEqual(
      new Date("2021-12-20")
    );
    expect(getNextYear(new Date("2022-12-31"))).toEqual(new Date("2023-12-31"));
    expect(getPreviousYear(new Date("2022-01-01"))).toEqual(
      new Date("2021-01-01")
    );
  });

  it("handles first/last day and ISO formatting", () => {
    expect(getISODateString(getFirstOfMonth(new Date("2022-01-20")))).toEqual(
      "2022-01-01"
    );
    expect(getISODateString(getLastOfMonth(new Date("2022-01-01")))).toEqual(
      "2022-01-31"
    );
    expect(getISODateString(new Date("2024-01-05"))).toEqual("2024-01-05");
    expect(getISODateString("2023-01-01" as unknown as Date)).toBeUndefined();
    expect(getMonth(new Date("2022-02-28"))).toEqual(2);
    expect(getYear(new Date("2022-01-01"))).toEqual(2022);
  });

  it("returns padded and unpadded month days", () => {
    const feb2024 = getDaysOfMonth(new Date("2024-02-15"), false, 1);
    expect(feb2024.length).toEqual(29);

    const paddedSunday = getDaysOfMonth(new Date("2022-01-01"), true, 0);
    const paddedMonday = getDaysOfMonth(new Date("2023-05-01"), true, 1);

    expect(paddedSunday.length % 7).toBe(0);
    expect(paddedMonday.length).toBeGreaterThanOrEqual(31);
    expect(getISODateString(paddedMonday[0])).toEqual("2023-05-01");

    const janStartIndex = paddedSunday.findIndex(
      (d) => getMonth(d) === 1 && d.getDate() === 1
    );
    expect(janStartIndex).toBeGreaterThan(0);
  });

  it("provides localized months and weekdays", () => {
    const monthsEn = getMonths("en-US");
    const weekdaysSunday = getWeekDays(0, "en-US");
    const weekdaysMonday = getWeekDays(1, "en-US");

    expect(monthsEn).toHaveLength(12);
    expect(monthsEn[0]).toEqual("January");
    expect(weekdaysSunday).toEqual([
      ["Sun", "Sunday"],
      ["Mon", "Monday"],
      ["Tue", "Tuesday"],
      ["Wed", "Wednesday"],
      ["Thu", "Thursday"],
      ["Fri", "Friday"],
      ["Sat", "Saturday"]
    ]);
    expect(weekdaysMonday).toEqual([
      ["Mon", "Monday"],
      ["Tue", "Tuesday"],
      ["Wed", "Wednesday"],
      ["Thu", "Thursday"],
      ["Fri", "Friday"],
      ["Sat", "Saturday"],
      ["Sun", "Sunday"]
    ]);
  });

  it("compares days and date ranges including guard clauses", () => {
    expect(isSameDay(new Date("2022-01-01"), new Date("2022-01-01"))).toBe(
      true
    );
    expect(isSameDay(undefined, new Date("2022-01-01"))).toBe(false);
    expect(isSameDay(new Date("2022-01-01"), null)).toBe(false);

    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2022-02-01"),
        to: new Date("2021-01-01")
      })
    ).toBe(true);
    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2022-01-02"),
        to: new Date("2022-02-01")
      })
    ).toBe(false);
    expect(
      isDateInRange(null as unknown as Date, {
        from: new Date(),
        to: new Date()
      })
    ).toBe(false);
    expect(isDateInRange(new Date(), null as any)).toBe(false);
  });

  it("evaluates lower/upper/full date bounds", () => {
    const date = new Date("2023-06-15");

    expect(dateIsWithinLowerBounds(date, undefined)).toBe(true);
    expect(dateIsWithinLowerBounds(date, "2023-01-01")).toBe(true);
    expect(dateIsWithinLowerBounds(date, "2023-12-01")).toBe(false);

    expect(dateIsWithinUpperBounds(date, undefined)).toBe(true);
    expect(dateIsWithinUpperBounds(date, "2023-12-31")).toBe(true);
    expect(dateIsWithinUpperBounds(date, "2023-01-01")).toBe(false);

    expect(dateIsWithinBounds(date)).toBe(true);
    expect(dateIsWithinBounds(date, "2023-01-01", "2023-12-31")).toBe(true);
    expect(dateIsWithinBounds(date, "2023-06-15", "2023-06-15")).toBe(true);
  });

  it("determines disabled months", () => {
    expect(monthIsDisabled(2, 1999, undefined, undefined)).toBeFalsy();
    expect(monthIsDisabled(11, 2022, "2023-01-01", undefined)).toBeTruthy();
    expect(monthIsDisabled(0, 2024, undefined, "2023-12-12")).toBeTruthy();
    expect(monthIsDisabled(0, 2024, "1999-02-02", "2024-12-12")).toBeFalsy();
  });

  it("disables months outside datetime bounds", () => {
    // February is disabled when only March is allowed
    expect(monthIsDisabled(1, 2026, "2026-03-01", "2026-03-31")).toBeTruthy();
    // April is disabled when only March is allowed
    expect(monthIsDisabled(3, 2026, "2026-03-01", "2026-03-31")).toBeTruthy();
    // March is NOT disabled when March is allowed
    expect(monthIsDisabled(2, 2026, "2026-03-01", "2026-03-31")).toBeFalsy();
    // Adjacent month to a wide range is not disabled
    expect(monthIsDisabled(5, 2024, "2024-01-01", "2024-12-31")).toBeFalsy();
  });

  it("validates and extracts ISO dates", () => {
    expect(isValidISODate("2023-01-15")).toBeTruthy();
    expect(isValidISODate("2023-02-31")).toBeTruthy();
    expect(isValidISODate("01-15-2023")).toBeFalsy();

    expect(extractDates("Meeting on 2023-01-15")).toEqual(["2023-01-15"]);
    expect(extractDates("From 2023-01-15 to 2023-01-20")).toEqual([
      "2023-01-15",
      "2023-01-20"
    ]);
    expect(extractDates("2023-01-15, 2023-01-20, 2023-01-25")).toEqual([
      "2023-01-15",
      "2023-01-20"
    ]);
    expect(extractDates("No dates here")).toBeUndefined();
  });

  it("removes timezone offset while preserving date type", () => {
    const result = removeTimezoneOffset(new Date("2023-06-15T14:30:00Z"));
    expect(result instanceof Date).toBe(true);
    expect(getISODateString(result)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
