import { newSpecPage } from "@stencil/core/testing";
import * as chronoParser from "@shared/utils/chrono-parser/chrono-parser";
import { TabworthyDates } from "./tabworthy-dates";

jest.mock("@react-aria/live-announcer", () => ({
  announce: jest.fn()
}));

describe("tabworthy-dates", () => {
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    jest.restoreAllMocks();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  const createPage = async (
    html = `<tabworthy-dates id="test"></tabworthy-dates>`
  ) => {
    return newSpecPage({
      components: [TabworthyDates],
      html
    });
  };

  it("renders and validates required id on load", async () => {
    await createPage("<tabworthy-dates></tabworthy-dates>");
    expect(console.error).toHaveBeenCalledWith(
      'tabworthy-dates: The "id" prop is required for accessibility'
    );
  });

  it("warns when chrono locale is unsupported", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.locale = "sv-SE";
    instance.chronoSupportedLocale = false;
    instance.componentDidLoad();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'tabworthy-dates: The chosen locale "sv-SE" is not supported by Chrono.js'
      )
    );
  });

  it("parseDate sets value on valid parse and returns formatted value", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    jest.spyOn(chronoParser, "chronoParseDate").mockResolvedValue({
      value: new Date("2023-06-08")
    } as any);

    const result = await instance.parseDate("June 8 2023", true);

    expect(result.value).toBe("2023-06-08");
    expect(instance.internalValue).toBe("2023-06-08");
    expect(instance.errorState).toBe(false);
  });

  it("parseDate uses default shouldSetValue=true when not provided", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    jest.spyOn(chronoParser, "chronoParseDate").mockResolvedValue({
      value: new Date("2023-07-15")
    } as any);

    // Call parseDate with only the text argument to cover default shouldSetValue = true
    const result = await instance.parseDate("July 15 2023");

    expect(result.value).toBe("2023-07-15");
    expect(instance.internalValue).toBe("2023-07-15");
    expect(instance.errorState).toBe(false);
  });

  it("parseDate keeps invalid state when parsing fails", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    jest.spyOn(chronoParser, "chronoParseDate").mockResolvedValue({
      value: null,
      reason: "invalid"
    } as any);

    const result = await instance.parseDate("bad input", true);

    expect(result.value).toBeUndefined();
    expect(result.reason).toBe("invalid");
    expect(instance.errorState).toBe(true);
  });

  it("handleCalendarButtonClick toggles modal open and close", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    jest
      .spyOn(customElements, "whenDefined")
      .mockResolvedValue(undefined as any);

    const setTriggerElement = jest.fn();
    const open = jest.fn();
    const close = jest.fn();
    let state = false;

    instance.calendarButtonRef = {} as HTMLButtonElement;
    instance.modalRef = {
      setTriggerElement,
      getState: jest.fn(async () => state),
      open: jest.fn(async () => {
        state = true;
        open();
      }),
      close: jest.fn(async () => {
        state = false;
        close();
      })
    };

    await instance.handleCalendarButtonClick();
    await instance.handleCalendarButtonClick();

    expect(setTriggerElement).toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("handleQuickButtonClick parses single date quick buttons", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    jest
      .spyOn(chronoParser, "chronoParseDate")
      .mockResolvedValue({ value: new Date("2023-01-20") } as any);

    await instance.handleQuickButtonClick({
      target: { innerText: "Yesterday" }
    } as unknown as MouseEvent);

    expect(instance.internalValue).toBe("2023-01-20");
    expect(instance.value).toBe(instance.internalValue);
  });

  it("handleQuickButtonClick parses range quick buttons", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" range></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    jest.spyOn(chronoParser, "chronoParseRange").mockResolvedValue({
      value: {
        start: new Date("2023-07-05"),
        end: new Date("2023-07-10")
      }
    } as any);

    await instance.handleQuickButtonClick({
      target: { innerText: "July 5-10" }
    } as unknown as MouseEvent);

    expect(instance.internalValue).toEqual(["2023-07-05", "2023-07-10"]);
    expect(instance.value).toEqual(instance.internalValue);
  });

  it("handleChange clears single input and emits empty value", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.pickerRef = { value: new Date("2023-01-01") };
    const emitSpy = jest.spyOn(instance.selectDate, "emit");

    await instance.handleChange({ target: { value: "" } } as any);

    expect(instance.internalValue).toBe("");
    expect(instance.value).toBe(instance.internalValue);
    expect(instance.pickerRef.value).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith("");
  });

  it("handleChange sets disabled-date error for single mode", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.disableDate = () => true;
    jest
      .spyOn(chronoParser, "chronoParseDate")
      .mockResolvedValue({ value: new Date("2023-06-08") } as any);

    await instance.handleChange({ target: { value: "June 8 2023" } } as any);

    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toBe(instance.datesLabels.disabledDateError);
  });

  it("handleChange sets min/max/invalid errors for single mode", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" min-date="1988-12-30" max-date="2034-11-02"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;
    const formatLocalizedDate = (date: Date) =>
      Intl.DateTimeFormat(instance.locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(date);

    const parseSpy = jest.spyOn(chronoParser, "chronoParseDate");

    parseSpy.mockResolvedValueOnce({ value: null, reason: "minDate" } as any);
    await instance.handleChange({ target: { value: "too early" } } as any);
    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toContain(
      formatLocalizedDate(new Date("1988-12-29"))
    );

    parseSpy.mockResolvedValueOnce({ value: null, reason: "maxDate" } as any);
    await instance.handleChange({ target: { value: "too late" } } as any);
    expect(instance.errorMessage).toContain(
      formatLocalizedDate(new Date("2034-11-03"))
    );

    parseSpy.mockResolvedValueOnce({ value: null, reason: "invalid" } as any);
    await instance.handleChange({ target: { value: "bad input" } } as any);
    expect(instance.errorMessage).toBe(instance.datesLabels.invalidDateError);
  });

  it("handleChange sets empty error message when minDate/maxDate reason but no min/max prop", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    const parseSpy = jest.spyOn(chronoParser, "chronoParseDate");

    // Test minDate reason without min-date prop set
    parseSpy.mockResolvedValueOnce({ value: null, reason: "minDate" } as any);
    await instance.handleChange({ target: { value: "some date" } } as any);
    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toBe("");

    // Test maxDate reason without max-date prop set
    parseSpy.mockResolvedValueOnce({ value: null, reason: "maxDate" } as any);
    await instance.handleChange({ target: { value: "another date" } } as any);
    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toBe("");
  });

  it("handleChange updates range and handles range errors", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" range></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    const parseSpy = jest.spyOn(chronoParser, "chronoParseRange");

    parseSpy.mockResolvedValueOnce({
      value: { start: new Date("2023-06-08"), end: new Date("2023-06-12") }
    } as any);
    await instance.handleChange({
      target: { value: "June 8 - 12 2023" }
    } as any);
    expect(instance.internalValue).toEqual(["2023-06-08", "2023-06-12"]);

    parseSpy.mockResolvedValueOnce({
      value: null,
      reason: "rangeOutOfBounds"
    } as any);
    await instance.handleChange({ target: { value: "bad range" } } as any);
    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toBe(
      instance.datesLabels.rangeOutOfBoundsError
    );
  });

  it("handles range input clear and emits empty value", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" range></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;
    instance.pickerRef = {
      value: [new Date("2023-06-08"), new Date("2023-06-12")]
    };
    const emitSpy = jest.spyOn(instance.selectDate, "emit");

    await instance.handleChange({ target: { value: "" } } as any);

    expect(instance.internalValue).toBe("");
    expect(instance.value).toBe(instance.internalValue);
    expect(instance.pickerRef.value).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith("");
  });

  it("handleChange updates single value when parsed and enabled", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.disableDate = () => false;
    const updateSpy = jest.spyOn(instance, "updateValue");
    const formatSpy = jest.spyOn(instance, "formatInput");

    jest
      .spyOn(chronoParser, "chronoParseDate")
      .mockResolvedValue({ value: new Date("2024-07-09") } as any);
    await instance.handleChange({ target: { value: "July 9 2024" } } as any);

    expect(updateSpy).toHaveBeenCalled();
    expect(formatSpy).toHaveBeenCalledWith(true, false);
    expect(instance.errorState).toBe(false);
    expect(instance.value).toBe(instance.internalValue);
  });

  it("formatInput handles plain and formatted modes", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "2023-06-08" } as HTMLInputElement;
    instance.internalValue = "2023-06-08";

    instance.inputShouldFormat = false;
    instance.formatInput(true, false);
    expect(instance.inputRef.value).toContain("2023-06-08");

    instance.inputShouldFormat = true;
    instance.errorState = false;
    instance.formatInput(true, false);
    expect(instance.inputRef.value).toContain("June 8, 2023");

    instance.internalValue = ["2023-06-08", "2023-06-12"];
    instance.formatInput(true, false);
    expect(instance.inputRef.value).toContain("Jun 8, 2023 to Jun 12, 2023");

    instance.internalValue = "2023-09-18";
    instance.inputShouldFormat = undefined;
    instance.errorState = false;
    instance.formatInput(true, false);
    expect(instance.inputRef.value).toBe("2023-09-18");
  });

  it("handlePickerSelection updates single and range selections", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" range></tabworthy-dates>'
    );
    const emitSpy = jest.fn();
    const instance = page.rootInstance as any;
    instance.selectDate = { emit: emitSpy };

    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.modalRef = { close: jest.fn() };

    instance.handlePickerSelection(["2023-06-08", "2023-06-12"]);
    expect(instance.internalValue).toEqual(["2023-06-08", "2023-06-12"]);
    expect(instance.value).toEqual(instance.internalValue);
    expect(instance.modalRef.close).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(["2023-06-08", "2023-06-12"]);

    instance.range = false;
    instance.handlePickerSelection("2023-06-08");
    expect(instance.internalValue).toBe("2023-06-08");
    expect(instance.value).toBe(instance.internalValue);
    expect(emitSpy).toHaveBeenCalledWith("2023-06-08");
  });

  it("announceDateChange announces selected content", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.announceDateChange("2023-06-08");
    instance.announceDateChange(["2023-06-08"]);
    instance.announceDateChange([]);
    expect(instance.internalValue).toBeUndefined();
  });

  it("announceDateChange handles undefined without moment parsing errors", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    // Should not throw or call moment with undefined
    expect(() => instance.announceDateChange(undefined)).not.toThrow();
    expect(() => instance.announceDateChange(null)).not.toThrow();
    expect(() => instance.announceDateChange("")).not.toThrow();
  });

  it("watchers and syncFromValueProp update state and picker/input refs", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" format="DD/MM/YYYY" value="15/03/2026"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.pickerRef = { value: null };

    instance.watchDisabled(true);
    expect(instance.disabledState).toBe(true);

    instance.watchValue("16/03/2026");
    expect(instance.internalValue).toBe("16/03/2026");
    expect(instance.pickerRef.value).toBeInstanceOf(Date);

    instance.value = ["15/03/2026", "16/03/2026"];
    instance.watchValue(instance.value);
    expect(Array.isArray(instance.pickerRef.value)).toBe(true);
  });

  it("syncFromValueProp keeps input in provided format when inputShouldFormat is false", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" input-should-format="false" value="01/01/2024" format="DD/MM/YYYY"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.inputShouldFormat = false;

    expect(instance.inputRef.value).toBe("01/01/2024");
    expect(instance.inputRef.value).not.toBe("Monday, January 1, 2024");
  });

  it("handleChangedMonths and handleYearChange emit announcements/events", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.handleChangedMonths({ month: 2, year: 2026 });

    const emitSpy = jest.fn();
    instance.changeYear = { emit: emitSpy };
    instance.handleYearChange({ year: 2025 });
    expect(emitSpy).toHaveBeenCalledWith({ year: 2025 });
  });

  it("renders quick buttons and error block based on state", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" show-quick-buttons></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.quickButtons = ["Today"];
    instance.chronoSupportedLocale = true;
    instance.errorState = true;
    instance.errorMessage = "Boom";
    await page.waitForChanges();

    expect(
      page.root?.querySelector(".tabworthy-dates__quick-group")
    ).toBeTruthy();
    expect(
      page.root?.querySelector(".tabworthy-dates__input-error")?.textContent
    ).toContain("Boom");
  });

  it("wires focus/blur and modal/calendar event handlers from render", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    const formatSpy = jest.spyOn(instance, "formatInput");
    const yearSpy = jest.fn();
    instance.changeYear = { emit: yearSpy };

    const input = page.root?.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.dispatchEvent(new FocusEvent("blur"));
    await page.waitForChanges();
    expect(formatSpy).toHaveBeenCalledWith(false);
    expect(formatSpy).toHaveBeenCalledWith(true, false);

    const modal = page.root?.querySelector(
      "tabworthy-dates-modal"
    ) as HTMLElement;
    instance.pickerRef = { modalIsOpen: false };
    modal.dispatchEvent(new CustomEvent("opened"));
    expect(instance.pickerRef.modalIsOpen).toBe(true);
    modal.dispatchEvent(new CustomEvent("closed"));
    expect(instance.pickerRef.modalIsOpen).toBe(false);

    const calendar = page.root?.querySelector(
      "tabworthy-dates-calendar"
    ) as HTMLElement;
    instance.handlePickerSelection = jest.fn();
    calendar.dispatchEvent(
      new CustomEvent("selectDate", { detail: "2026-04-11" })
    );
    calendar.dispatchEvent(
      new CustomEvent("changeMonth", { detail: { month: 4, year: 2026 } })
    );
    calendar.dispatchEvent(
      new CustomEvent("changeYear", { detail: { year: 2027 } })
    );
    expect(instance.handlePickerSelection).toHaveBeenCalledWith("2026-04-11");
    expect(yearSpy).toHaveBeenCalledWith({ year: 2027 });
  });

  it("closes the modal when the calendar requests close", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    const closeSpy = jest.fn();
    instance.modalRef = { close: closeSpy };

    const calendar = page.root?.querySelector(
      "tabworthy-dates-calendar"
    ) as HTMLElement;
    calendar.dispatchEvent(new CustomEvent("requestClose"));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("uses default disableDate callback", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    expect(instance.disableDate(new Date("2024-01-01"))).toBe(false);
  });

  it("covers additional render and formatting edge branches", async () => {
    const page = await createPage("<tabworthy-dates></tabworthy-dates>");
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "September 10 2023" } as HTMLInputElement;
    instance.internalValue = ["2023-09-10", "2023-09-12"];
    instance.errorState = false;
    instance.inputShouldFormat = true;
    instance.formatInput(true, true);
    expect(instance.inputRef.value).toContain("2023");

    instance.inputRef.value = "kept";
    instance.internalValue = "";
    instance.inputShouldFormat = false;
    instance.formatInput(true, false);
    expect(instance.inputRef.value).toBe("kept");

    instance.quickButtons = [];
    instance.chronoSupportedLocale = false;
    instance.errorState = true;
    instance.errorMessage = "edge";
    await page.waitForChanges();
    expect(
      page.root?.querySelector(".tabworthy-dates__quick-group")
    ).toBeFalsy();

    const error = page.root?.querySelector(".tabworthy-dates__input-error");
    expect(error?.id).toBe("");

    instance.changeYear = undefined;
    expect(() => instance.handleYearChange({ year: 2028 })).not.toThrow();
  });

  it("handlePickerSelection mutates internalValue correctly based on specified format", async () => {
    const page = await createPage(
      "<tabworthy-dates value='01/01/2024' format='DD/MM/YYYY'></tabworthy-dates>"
    );
    const instance = page.rootInstance as any;
    instance.modalRef = { close: jest.fn() };
    instance.inputShouldFormat = false;

    // Simulate calendar date selection (calendar emits ISO strings)
    instance.handlePickerSelection("2024-01-02");

    expect(instance.internalValue).toBe("02/01/2024");
  });

  it("handlePickerSelection supports DD/MM/YYYY format without throwing and formats input correctly", async () => {
    const page = await createPage(
      "<tabworthy-dates id='test' format='DD/MM/YYYY'></tabworthy-dates>"
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.fn();
    instance.selectDate = { emit: emitSpy };

    instance.modalRef = { close: jest.fn() };
    instance.inputShouldFormat = false;

    expect(() => instance.handlePickerSelection("2024-01-02")).not.toThrow();
    await page.waitForChanges();
    expect(emitSpy).toHaveBeenCalledWith("02/01/2024");
    expect(instance.inputRef.value).toBe("02/01/2024");
    expect(instance.internalValue).toBe("02/01/2024");
  });

  it("disable-freeform-input disables input", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" disable-freeform-input></tabworthy-dates>'
    );
    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("handlePickerSelection handles undefined without moment parsing errors", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    const emitSpy = jest.fn();
    instance.selectDate = { emit: emitSpy };
    instance.modalRef = { close: jest.fn() };

    expect(() => instance.handlePickerSelection(undefined)).not.toThrow();
    expect(instance.internalValue).toBe("");
    expect(instance.value).toBe(instance.internalValue);
    expect(instance.inputRef.value).toBe("");
    expect(emitSpy).toHaveBeenCalledWith("");
  });

  it("watchValue with undefined clears input and picker value", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" value="2024-01-15"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.pickerRef = { value: new Date("2024-01-15") };
    expect(instance.internalValue).toBe("2024-01-15");

    instance.watchValue(undefined);

    expect(instance.internalValue).toBeUndefined();
    expect(instance.pickerRef.value).toBeNull();
    expect(instance.inputRef.value).toBe("");
  });

  it("watchValue with empty string clears input and picker value", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" value="2024-01-15"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    instance.pickerRef = { value: new Date("2024-01-15") };
    expect(instance.internalValue).toBe("2024-01-15");

    instance.watchValue("");

    expect(instance.internalValue).toBe("");
    expect(instance.pickerRef.value).toBeNull();
    expect(instance.inputRef.value).toBe("");
  });

  it("renders custom calendar button content when provided", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" calendar-button-content="<span>OPEN</span>"></tabworthy-dates>'
    );

    const calendarButton = page.root?.querySelector(
      ".tabworthy-dates__calendar-button"
    );
    expect(calendarButton?.innerHTML).toContain("OPEN");
    expect(calendarButton?.getAttribute("aria-label")).toBe("Open calendar");
  });

  it("does not set aria-label on calendar button when no custom content", async () => {
    const page = await createPage();

    const calendarButton = page.root?.querySelector(
      ".tabworthy-dates__calendar-button"
    );
    expect(calendarButton?.getAttribute("aria-label")).toBeNull();
  });

  it("renders year-only mode using the selected value year", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" year-only label="Pick a year" value="2027-06-15"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    const input = page.root?.querySelector('input[type="number"]');
    const button = page.root?.querySelector(
      ".tabworthy-dates__calendar-button"
    );

    expect(page.root?.textContent).toContain("Pick a year");
    expect(input?.getAttribute("value")).toBe("2027");
    expect(button).toBeFalsy();
    expect(instance.inputContainerRef).toBeTruthy();
  });

  it("renders year-only mode with the current year when value is missing", async () => {
    const instance = new TabworthyDates() as any;
    instance.id = "test";
    instance.yearOnly = true;
    instance.label = "Pick a year";

    expect(() => instance.render()).not.toThrow();
  });

  it("handles year-only input changes within min/max bounds", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" year-only value="2024-01-01" min-date="2020-01-01" max-date="2030-12-31"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;
    const yearSpy = jest.fn();
    const selectSpy = jest.spyOn(instance.selectDate, "emit");
    instance.changeYear = { emit: yearSpy };

    instance.handleYearInputChange({ target: { value: "nope" } } as any);
    instance.handleYearInputChange({ target: { value: "2019" } } as any);
    instance.handleYearInputChange({ target: { value: "2031" } } as any);

    expect(instance.value).toBe("2024-01-01");
    expect(yearSpy).not.toHaveBeenCalled();
    expect(selectSpy).not.toHaveBeenCalled();

    instance.handleYearInputChange({ target: { value: "2025" } } as any);

    expect(instance.internalValue).toBe("2025-01-01");
    expect(instance.value).toBe("2025-01-01");
    expect(yearSpy).toHaveBeenCalledWith({ year: 2025 });
    expect(selectSpy).toHaveBeenCalledWith("2025-01-01");
  });

  it("getClassName returns base class name when no element is provided", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    expect(instance.getClassName()).toBe("tabworthy-dates");
    expect(instance.getClassName("input")).toBe("tabworthy-dates__input");
  });

  it("formatInput falls back to Date parsing when moment parsing fails for single date", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    // Set a value that moment strict parsing won't handle but Date() can
    instance.internalValue = "2024-03-15";
    instance.errorState = false;
    instance.inputShouldFormat = true;
    instance.inputRef.value = "March 15, 2024"; // This won't parse with moment's strict YYYY-MM-DD format

    instance.formatInput(true, true);

    // Should have formatted the date using Intl.DateTimeFormat
    expect(instance.inputRef.value).toContain("2024");
  });

  it("formatInput falls back to Date parsing with internalValue when useInputValue is false", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    // Set internalValue to something moment strict parsing won't handle but Date() can
    instance.internalValue = "March 15, 2024";
    instance.errorState = false;
    instance.inputShouldFormat = true;

    instance.formatInput(true, false); // useInputValue = false

    // Should have formatted the date using Intl.DateTimeFormat
    expect(instance.inputRef.value).toContain("2024");
  });

  it("passes showCloseButton prop to calendar component", async () => {
    const page = await createPage(
      '<tabworthy-dates id="test" show-close-button="true"></tabworthy-dates>'
    );
    const instance = page.rootInstance as any;

    expect(instance.showCloseButton).toBe(true);
  });

  it("does not have showCloseButton enabled by default", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    expect(instance.showCloseButton).toBe(false);
  });

  describe("errorChange event", () => {
    it("emits errorChange with reason when single date is invalid", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest
        .spyOn(chronoParser, "chronoParseDate")
        .mockResolvedValue({ value: null, reason: "invalid" } as any);

      await instance.handleChange({ target: { value: "garbage" } } as any);

      expect(errorSpy).toHaveBeenCalledWith({
        reason: "invalid",
        message: instance.datesLabels.invalidDateError
      });
    });

    it("emits errorChange with minDate reason", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test" min-date="2024-01-01"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest
        .spyOn(chronoParser, "chronoParseDate")
        .mockResolvedValue({ value: null, reason: "minDate" } as any);

      await instance.handleChange({ target: { value: "too early" } } as any);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "minDate"
        })
      );
      expect(errorSpy.mock.calls[0][0].message).toContain(
        "Please fill in a date after"
      );
    });

    it("emits errorChange with maxDate reason", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test" max-date="2024-12-31"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest
        .spyOn(chronoParser, "chronoParseDate")
        .mockResolvedValue({ value: null, reason: "maxDate" } as any);

      await instance.handleChange({ target: { value: "too late" } } as any);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "maxDate"
        })
      );
      expect(errorSpy.mock.calls[0][0].message).toContain(
        "Please fill in a date before"
      );
    });

    it("emits errorChange with disabledDate reason", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      instance.disableDate = () => true;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest
        .spyOn(chronoParser, "chronoParseDate")
        .mockResolvedValue({ value: new Date("2024-06-08") } as any);

      await instance.handleChange({ target: { value: "June 8" } } as any);

      expect(errorSpy).toHaveBeenCalledWith({
        reason: "disabledDate",
        message: instance.datesLabels.disabledDateError
      });
    });

    it("emits errorChange for range errors", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test" range></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest.spyOn(chronoParser, "chronoParseRange").mockResolvedValue({
        value: null,
        reason: "rangeOutOfBounds"
      } as any);

      await instance.handleChange({ target: { value: "bad range" } } as any);

      expect(errorSpy).toHaveBeenCalledWith({
        reason: "rangeOutOfBounds",
        message: instance.datesLabels.rangeOutOfBoundsError
      });
    });

    it("does not emit errorChange when input is valid", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.disableDate = () => false;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");
      jest
        .spyOn(chronoParser, "chronoParseDate")
        .mockResolvedValue({ value: new Date("2024-06-08") } as any);

      await instance.handleChange({
        target: { value: "June 8 2024" }
      } as any);

      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("does not emit errorChange when input is cleared", async () => {
      const page = await createPage(
        '<tabworthy-dates id="test"></tabworthy-dates>'
      );
      const instance = page.rootInstance as any;

      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handleChange({ target: { value: "" } } as any);

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
