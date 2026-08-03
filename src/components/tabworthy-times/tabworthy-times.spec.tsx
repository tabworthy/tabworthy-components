import { newSpecPage } from "@stencil/core/testing";
import { TabworthyTimes } from "./tabworthy-times";
import type { TimesLabels } from "./tabworthy-times";
import { TabworthyDatesCalendar } from "../tabworthy-dates-calendar/tabworthy-dates-calendar";

describe("tabworthy-times", () => {
  const originalError = console.error;
  const formatBoundaryDate = (
    locale: string,
    date: Date,
    includeTime = false
  ) =>
    Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "numeric", minute: "numeric" } : {})
    }).format(date);

  beforeEach(() => {
    jest.restoreAllMocks();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  const createPage = async (
    html = `<tabworthy-times id="time-test"></tabworthy-times>`
  ) => {
    return newSpecPage({
      components: [TabworthyTimes],
      html
    });
  };

  it("renders and validates required id", async () => {
    const page = await createPage("<tabworthy-times></tabworthy-times>");
    expect(page.root).toBeTruthy();
    expect(console.error).toHaveBeenCalledWith(
      'tabworthy-times: The "id" prop is required for accessibility'
    );
  });

  it("initializes to current time when no value is provided", async () => {
    const now = new Date();
    const page = await createPage();
    const instance = page.rootInstance as any;

    // Verify hours and minutes are within valid ranges
    expect(instance.selectedHours).toBeGreaterThanOrEqual(0);
    expect(instance.selectedHours).toBeLessThanOrEqual(23);
    expect(instance.selectedMinutes).toBeGreaterThanOrEqual(0);
    expect(instance.selectedMinutes).toBeLessThanOrEqual(59);

    // Verify the time is close to current time (within 2 minutes tolerance)
    const instanceMinutesSinceMidnight =
      instance.selectedHours * 60 + instance.selectedMinutes;
    const currentMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    expect(
      Math.abs(instanceMinutesSinceMidnight - currentMinutesSinceMidnight)
    ).toBeLessThanOrEqual(2);
  });

  it("syncs initial value and parses selected time", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T14:30:00"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    expect(instance.internalValue).toBe("2024-03-15T14:30:00");
    expect(instance.selectedDate).toBeInstanceOf(Date);
    expect(instance.selectedHours).toBe(14);
    expect(instance.selectedMinutes).toBe(30);
  });

  it("watchers update disabled and error states and resync value", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.watchDisabled(true);
    expect(instance.disabledState).toBe(true);

    instance.watchHasError(true);
    expect(instance.errorState).toBe(true);

    instance.value = "2024-03-16T12:00:00";
    instance.watchValue(instance.value);
    expect(instance.internalValue).toBe("2024-03-16T12:00:00");
  });

  it("updateValue formats and emits for single values", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    instance.selectedHours = 9;
    instance.selectedMinutes = 45;
    instance.selectedSeconds = 0;
    instance.updateValue(new Date("2024-03-15"));

    expect(instance.internalValue).toContain("2024-03-15T09:45:00");
    expect(instance.value).toContain("2024-03-15T09:45:00");
    expect(emitSpy).toHaveBeenCalled();
    expect(instance.errorState).toBe(false);
  });

  it("updateValue formats and emits for ranges", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" range></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    instance.selectedHours = 17;
    instance.selectedMinutes = 0;
    instance.selectedSeconds = 0;
    instance.updateValue([new Date("2024-03-15"), new Date("2024-03-16")]);

    expect(Array.isArray(instance.internalValue)).toBe(true);
    expect(instance.internalValue[0]).toContain("2024-03-15T17:00:00");
    expect(instance.internalValue[1]).toContain("2024-03-16T17:00:00");
    expect(emitSpy).toHaveBeenCalled();
  });

  it("handles picker selection for single and range", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" range></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.pickerRef = { value: null };

    await instance.handlePickerSelection("2024-03-15,2024-03-16");
    expect(instance.pickerRef.value).toHaveLength(2);

    instance.range = false;
    await instance.handlePickerSelection("2024-03-17");
    expect(instance.pickerRef.value).toBeInstanceOf(Date);
  });

  it("updates selected time via time picker events", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T14:30:00"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");
    instance.handleTimeChange({ detail: { hours: 20, minutes: 15 } });

    expect(instance.selectedHours).toBe(20);
    expect(instance.selectedMinutes).toBe(15);
    expect(emitSpy).toHaveBeenCalled();
  });

  it("opens modal from calendar button click", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    const setTriggerElement = jest.fn();
    const open = jest.fn();
    instance.calendarButtonRef = {} as HTMLButtonElement;
    instance.modalRef = {
      setTriggerElement: async (...args: any[]) => setTriggerElement(...args),
      open: async () => open()
    };

    await instance.handleCalendarButtonClick();

    expect(setTriggerElement).toHaveBeenCalled();
    expect(open).toHaveBeenCalled();
  });

  it("handles year change event emission", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    const emitSpy = jest.fn();
    instance.changeYear = { emit: emitSpy };

    instance.handleYearChange({ year: 2025 });
    expect(emitSpy).toHaveBeenCalledWith({ year: 2025 });

    instance.changeYear = undefined;
    instance.handleYearChange({ year: 2026 });
    expect(emitSpy).toHaveBeenCalledTimes(1);

    instance.handleChangedMonths({ month: 3, year: 2026 });
  });

  it("parses valid input changes and formats output", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.selectedSeconds = 0;
    instance.handleInputChange({
      target: { value: "2024-03-15 10:30" }
    } as any);

    expect(instance.selectedHours).toBe(10);
    expect(instance.selectedMinutes).toBe(30);
    expect(instance.internalValue).toContain("2024-03-15T10:30:00");

    const before = instance.internalValue;
    instance.handleInputChange({ target: { value: "not a datetime" } } as any);
    expect(instance.internalValue).toBe(before);

    instance.handleInputBlur();
    expect(instance.inputRef.value).toBeTruthy();
  });

  it("clears state when the input is emptied", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T10:30:00"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    instance.pickerRef = { value: new Date("2024-03-15") };
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    instance.handleInputChange({ target: { value: "" } } as any);

    expect(instance.errorState).toBe(false);
    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBe("");
    expect(instance.pickerRef.value).toBeNull();
    expect(emitSpy).toHaveBeenCalled();
  });

  it("parses input using component format prop (DD/MM/YYYY should not swap day/month)", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" format="DD/MM/YYYY h:mm A" input-should-format="false"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.selectedSeconds = 0;

    // Set initial value to July 5th, 2023 at 12:00 AM
    instance.handleInputChange({
      target: { value: "05/07/2023 12:00 AM" }
    } as any);

    // Verify it parsed as July 5th (month = 6 in JS, as months are 0-indexed)
    expect(instance.selectedDate.getDate()).toBe(5);
    expect(instance.selectedDate.getMonth()).toBe(6); // July = 6
    expect(instance.selectedDate.getFullYear()).toBe(2023);
    expect(instance.selectedHours).toBe(0);
    expect(instance.selectedMinutes).toBe(0);

    // Now change time to 1:00 AM - date should remain July 5th
    instance.handleInputChange({
      target: { value: "05/07/2023 1:00 AM" }
    } as any);

    // Date should still be July 5th, NOT May 7th (swapped)
    expect(instance.selectedDate.getDate()).toBe(5);
    expect(instance.selectedDate.getMonth()).toBe(6); // July = 6, NOT May = 4
    expect(instance.selectedDate.getFullYear()).toBe(2023);
    expect(instance.selectedHours).toBe(1);
    expect(instance.selectedMinutes).toBe(0);

    // Verify the formatted value maintains DD/MM/YYYY format
    expect(instance.internalValue).toBe("05/07/2023 1:00 AM");
  });

  it("formats range and single values in the input", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "" } as HTMLInputElement;

    instance.internalValue = "2024-03-15T14:30:00";
    instance.formatInput();
    expect(instance.inputRef.value).toContain("Mar");

    instance.internalValue = ["2024-03-15T09:00:00", "2024-03-16T17:00:00"];
    instance.formatInput();
    expect(instance.inputRef.value).toContain(instance.timesLabels.to);

    instance.internalValue = null;
    const previous = instance.inputRef.value;
    instance.formatInput();
    expect(instance.inputRef.value).toBe(previous);
  });

  it("clears value, picker, and input via clearValue", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T14:30:00"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "something" } as HTMLInputElement;
    instance.pickerRef = { value: new Date("2024-03-15") };
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    await instance.clearValue();

    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBeUndefined();
    expect(instance.selectedDate).toBeUndefined();
    expect(instance.inputRef.value).toBe("");
    expect(instance.pickerRef.value).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("clears value when calendar emits undefined (clear button clicked in modal)", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T14:30:00" show-clear-button="true"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    instance.inputRef = { value: "Mar 15, 2024 2:30 PM" } as HTMLInputElement;
    instance.pickerRef = { value: new Date("2024-03-15") };
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    // Verify initial value exists
    expect(instance.value).toBe("2024-03-15T14:30:00");
    expect(instance.internalValue).toBe("2024-03-15T14:30:00");

    // Simulate the calendar's clear button emitting undefined
    await instance.handlePickerSelection(undefined);

    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBeUndefined();
    expect(instance.selectedDate).toBeUndefined();
    expect(instance.inputRef.value).toBe("");
    expect(instance.pickerRef.value).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("clears value with complex config: disable-freeform-input, input-should-format=false, timezone format", async () => {
    const page = await createPage(
      `<tabworthy-times
        id="setup-form-end-at"
        show-clear-button="true"
        show-year-stepper="true"
        show-month-stepper="true"
        show-today-button="true"
        input-should-format="false"
        disable-freeform-input="true"
        show-close-button="true"
        show-seconds="false"
        min-date="2024-11-11"
        format="DD/MM/YYYY h:mm A Z"
      ></tabworthy-times>`
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    // Simulate opening the modal and selecting a date
    instance.pickerRef = { value: null };
    await instance.handlePickerSelection("2024-11-15");
    await page.waitForChanges();

    // Verify a value was set
    expect(instance.value).toBeTruthy();
    expect(instance.internalValue).toBeTruthy();
    expect(instance.selectedDate).toBeInstanceOf(Date);

    // Simulate clicking the clear button in the modal
    await instance.handlePickerSelection(undefined);
    await page.waitForChanges();

    // Verify value was cleared
    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBeUndefined();
    expect(instance.selectedDate).toBeUndefined();
    expect(instance.inputRef.value).toBe("");
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("handles clear when no value was set (opens modal then clicks clear)", async () => {
    const page = await createPage(
      `<tabworthy-times
        id="setup-form-end-at"
        show-clear-button="true"
        show-year-stepper="true"
        show-month-stepper="true"
        show-today-button="true"
        input-should-format="false"
        disable-freeform-input="true"
        show-close-button="true"
        show-seconds="false"
        min-date="2024-11-11"
        format="DD/MM/YYYY h:mm A Z"
      ></tabworthy-times>`
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    // No initial value set - verify initial state
    expect(instance.value).toBeUndefined();
    expect(instance.internalValue).toBeNull();
    expect(instance.selectedDate).toBeUndefined();

    // Simulate opening the modal (pickerRef is set)
    instance.pickerRef = { value: null };

    // Simulate clicking the clear button in the modal without selecting anything first
    await instance.handlePickerSelection(undefined);
    await page.waitForChanges();

    // Should not throw error and should remain in cleared state
    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBeUndefined();
    expect(instance.selectedDate).toBeUndefined();
    expect(instance.inputRef.value).toBe("");
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("clearValue does not throw when inputRef is not initialized", async () => {
    const page = await createPage(
      `<tabworthy-times
        id="test"
        show-clear-button="true"
        input-should-format="false"
        disable-freeform-input="true"
        format="DD/MM/YYYY h:mm A Z"
      ></tabworthy-times>`
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    // Temporarily remove inputRef to simulate edge case
    const originalInputRef = instance.inputRef;
    instance.inputRef = undefined;

    // Should not throw when inputRef is undefined
    await expect(instance.clearValue()).resolves.not.toThrow();

    // Restore inputRef
    instance.inputRef = originalInputRef;

    // Verify state is cleared
    expect(instance.internalValue).toBeNull();
    expect(instance.value).toBeUndefined();
    expect(instance.selectedDate).toBeUndefined();
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("renders calendar button, custom content, and error message", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" calendar-button-content="<span>📅</span>"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    const calendarButton = page.root?.querySelector(
      ".tabworthy-times__calendar-button"
    );
    expect(calendarButton?.getAttribute("aria-label")).toBe("Choose time");

    instance.errorState = true;
    instance.errorMessage = "Bad datetime";
    await page.waitForChanges();

    expect(
      page.root?.querySelector(".tabworthy-times__calendar-button")
    ).toBeTruthy();
    expect(
      page.root?.querySelector(".tabworthy-times__input-error")?.textContent
    ).toContain("Bad datetime");

    instance.inline = true;
    await page.waitForChanges();
    expect(
      page.root?.querySelector(".tabworthy-times__calendar-button")
    ).toBeFalsy();
  });

  it("does not set aria-label on calendar button when no custom content", async () => {
    const page = await createPage();

    const calendarButton = page.root?.querySelector(
      ".tabworthy-times__calendar-button"
    );
    expect(calendarButton?.getAttribute("aria-label")).toBeNull();
  });

  it("wires modal and calendar event handlers from render", async () => {
    const page = await createPage(
      '<tabworthy-times id="time"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    const yearSpy = jest.fn();
    instance.changeYear = { emit: yearSpy };
    instance.pickerRef = { modalIsOpen: false };

    const modal = page.root?.querySelector(
      "tabworthy-dates-modal"
    ) as HTMLElement;
    modal.dispatchEvent(new CustomEvent("opened"));
    expect(instance.pickerRef.modalIsOpen).toBe(true);
    modal.dispatchEvent(new CustomEvent("closed"));
    expect(instance.pickerRef.modalIsOpen).toBe(false);

    const calendar = page.root?.querySelector(
      "tabworthy-dates-calendar"
    ) as HTMLElement;
    instance.handlePickerSelection = jest.fn();
    calendar.dispatchEvent(
      new CustomEvent("selectDate", { detail: "2026-04-08" })
    );
    calendar.dispatchEvent(
      new CustomEvent("changeMonth", { detail: { month: 4, year: 2026 } })
    );
    calendar.dispatchEvent(
      new CustomEvent("changeYear", { detail: { year: 2030 } })
    );

    expect(instance.handlePickerSelection).toHaveBeenCalledWith("2026-04-08");
    expect(yearSpy).toHaveBeenCalledWith({ year: 2030 });
  });

  it("closes the modal when the calendar requests close", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" value="2024-03-15T14:30:00"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    const closeSpy = jest.fn();
    instance.modalRef = { close: closeSpy };

    const calendar = page.root?.querySelector(
      "tabworthy-dates-calendar"
    ) as HTMLElement;
    calendar.dispatchEvent(new CustomEvent("requestClose"));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("renders error block without id attribute when id is missing", async () => {
    const page = await createPage("<tabworthy-times></tabworthy-times>");
    const instance = page.rootInstance as any;
    instance.errorState = true;
    instance.errorMessage = "err";
    await page.waitForChanges();

    const error = page.root?.querySelector(".tabworthy-times__input-error");
    expect(error?.textContent).toContain("err");
    expect(error?.id).toBe("");
  });

  it("should format input on blur if input-should-format is true", async () => {
    const page = await newSpecPage({
      components: [TabworthyTimes],
      html: `<tabworthy-times id="test-times" value="2026-02-19T15:30:00" format="YYYY-MM-DDTHH:mm:ss"></tabworthy-times>`
    });
    const input = page.root?.shadowRoot
      ? page.root.shadowRoot.querySelector("input")
      : page.root?.querySelector("input");
    // Simulate user changing the value to a valid date string
    input!.value = "2026-02-19T15:30:00";
    input?.dispatchEvent(new Event("change"));
    // Simulate blur event
    input?.dispatchEvent(new Event("blur"));
    await page.waitForChanges();
    // Should be formatted (lll format)
    expect(input?.value).toContain("Feb"); // e.g. 'Feb 19, 2026'
  });

  it("should NOT format input on blur if input-should-format is false", async () => {
    const page = await newSpecPage({
      components: [TabworthyTimes],
      html: `<tabworthy-times id="test-times" value="2026-02-19T15:30:00" format="YYYY-MM-DDTHH:mm:ss" input-should-format="false"></tabworthy-times>`
    });
    const input = page.root?.shadowRoot
      ? page.root.shadowRoot.querySelector("input")
      : page.root?.querySelector("input");
    // Simulate user changing the value to a valid date string
    input!.value = "2026-02-19T15:30:00";
    input?.dispatchEvent(new Event("change"));
    // Simulate blur event
    input?.dispatchEvent(new Event("blur"));
    await page.waitForChanges();
    // Should remain as entered
    expect(input?.value).toBe("2026-02-19T15:30:00");
  });

  it("should set error state when valid input is changed to garbage (invalid datetime)", async () => {
    const page = await createPage(
      '<tabworthy-times id="test-times" format="YYYY-MM-DDTHH:mm:ss"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    instance.inputRef = { value: "" } as HTMLInputElement;
    instance.selectedSeconds = 0;

    // First, enter a valid datetime
    instance.handleInputChange({
      target: { value: "2026-02-19T15:30:00" }
    } as any);
    await page.waitForChanges();

    // Verify valid input is accepted
    expect(instance.errorState).toBe(false);
    expect(instance.selectedHours).toBe(15);
    expect(instance.selectedMinutes).toBe(30);
    expect(instance.internalValue).toContain("2026-02-19T15:30:00");

    // Now change a number to a letter (garbage input)
    instance.handleInputChange({
      target: { value: "2026-02-19T1X:30:00" }
    } as any);
    await page.waitForChanges();

    // Verify error state is set
    expect(instance.errorState).toBe(true);
    expect(instance.errorMessage).toBe(instance.timesLabels.invalidDateError);
  });

  it("handlePickerSelection mutates internalValue correctly based on specified format", async () => {
    const page = await createPage(
      "<tabworthy-times id='test' value='01/01/2024 14:30:00' format='DD/MM/YYYY HH:mm:ss'></tabworthy-times>"
    );
    const instance = page.rootInstance as any;
    instance.inputShouldFormat = false;
    instance.pickerRef = { value: null };

    // Simulate calendar date selection (calendar emits ISO strings)
    await instance.handlePickerSelection("2024-01-02");

    expect(instance.internalValue).toBe("02/01/2024 14:30:00");
  });

  it("disable-freeform-input disables input", async () => {
    const page = await createPage(
      '<tabworthy-times id="test" disable-freeform-input></tabworthy-dates>'
    );
    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("toDate converts arrays and empty values", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    const range = instance.toDate([
      "2024-03-15T10:30:00",
      "2024-03-16T11:45:00"
    ]);

    expect(Array.isArray(range)).toBe(true);
    expect((range as Date[])[0]).toBeInstanceOf(Date);
    expect((range as Date[])[1]).toBeInstanceOf(Date);
    expect(instance.toDate(undefined)).toBeNull();
  });

  it("shows selected date class in calendar when value is preselected", async () => {
    const page = await newSpecPage({
      components: [TabworthyTimes, TabworthyDatesCalendar],
      html: `<tabworthy-times id="test-times" value="2024-03-15T14:30:00" format="YYYY-MM-DDTHH:mm:ss"></tabworthy-times>`
    });

    await page.waitForChanges();

    const selectedDate = page.root?.querySelector(
      ".tabworthy-dates-calendar__date--selected"
    );
    expect(selectedDate).toBeTruthy();
    expect(selectedDate?.getAttribute("data-date")).toBe("2024-03-15");
  });

  it("renders only the time picker when timeOnly is enabled", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" time-only format="HH:mm:ss" value="14:30:00"></tabworthy-times>'
    );

    expect(page.root?.hasAttribute("time-only")).toBe(true);
    expect(page.root?.querySelector("tabworthy-dates-calendar")).toBeNull();
    expect(page.root?.querySelector("tabworthy-times-picker")).toBeTruthy();
  });

  it("emits a time-only value when time is changed without a selected calendar date", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" time-only format="HH:mm:ss" input-should-format="false"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    instance.inputRef = { value: "" } as HTMLInputElement;
    const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

    instance.handleTimeChange({
      detail: { hours: 20, minutes: 15, seconds: 30 }
    });

    expect(instance.internalValue).toBe("20:15:30");
    expect(instance.value).toBe("20:15:30");
    expect(emitSpy).toHaveBeenCalledWith("20:15:30");
  });

  it("parses time-only input using the configured time format", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" time-only format="HH:mm:ss" input-should-format="false"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    instance.inputRef = { value: "" } as HTMLInputElement;

    instance.handleInputChange({ target: { value: "08:05:00" } } as any);

    expect(instance.selectedHours).toBe(8);
    expect(instance.selectedMinutes).toBe(5);
    expect(instance.internalValue).toBe("08:05:00");
  });

  it("wires timeOnly modal open state to the times picker", async () => {
    const page = await createPage(
      '<tabworthy-times id="time" time-only format="HH:mm:ss"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;
    instance.timePickerRef = { modalIsOpen: false };

    const modal = page.root?.querySelector(
      "tabworthy-dates-modal"
    ) as HTMLElement;
    modal.dispatchEvent(new CustomEvent("opened"));
    expect(instance.timePickerRef.modalIsOpen).toBe(true);
    modal.dispatchEvent(new CustomEvent("closed"));
    expect(instance.timePickerRef.modalIsOpen).toBe(false);
  });

  it("passes showCloseButton prop to calendar component", async () => {
    const page = await createPage(
      '<tabworthy-times id="test" show-close-button="true"></tabworthy-times>'
    );
    const instance = page.rootInstance as any;

    expect(instance.showCloseButton).toBe(true);
  });

  it("does not have showCloseButton enabled by default", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    expect(instance.showCloseButton).toBe(false);
  });

  describe("showSeconds mode", () => {
    it("does not show seconds by default", async () => {
      const page = await createPage();
      const instance = page.rootInstance as any;

      expect(instance.showSeconds).toBe(false);
    });

    it("respects showSeconds prop", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.showSeconds).toBe(true);
    });

    it("initializes selectedSeconds to current time when no value provided", async () => {
      const now = new Date();
      const page = await createPage(
        '<tabworthy-times id="test" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.selectedSeconds).toBeGreaterThanOrEqual(0);
      expect(instance.selectedSeconds).toBeLessThanOrEqual(59);

      // Verify the seconds is close to current time (within 5 seconds tolerance)
      expect(
        Math.abs(instance.selectedSeconds - now.getSeconds())
      ).toBeLessThanOrEqual(5);
    });

    it("parses seconds from value prop", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" value="2024-03-15T14:30:45"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.selectedSeconds).toBe(45);
    });

    it("updates selectedSeconds via time picker event", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" value="2024-03-15T14:30:00" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.handleTimeChange({
        detail: { hours: 14, minutes: 30, seconds: 55 }
      });

      expect(instance.selectedSeconds).toBe(55);
    });

    it("includes seconds in formatted output", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedHours = 10;
      instance.selectedMinutes = 30;
      instance.selectedSeconds = 45;
      instance.updateValue(new Date("2024-03-15"));

      expect(instance.internalValue).toContain("2024-03-15T10:30:45");
    });

    it("includes seconds in range mode output", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" range show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedHours = 10;
      instance.selectedMinutes = 30;
      instance.selectedSeconds = 15;
      instance.updateValue([new Date("2024-03-15"), new Date("2024-03-16")]);

      expect(instance.internalValue[0]).toContain("2024-03-15T10:30:15");
      expect(instance.internalValue[1]).toContain("2024-03-16T10:30:15");
    });

    it("passes showSeconds and seconds to times-picker component", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" show-seconds="true" value="2024-03-15T14:30:45"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.showSeconds).toBe(true);
      expect(instance.selectedSeconds).toBe(45);
    });

    it("does not update seconds when event detail has no seconds", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" value="2024-03-15T14:30:45"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.selectedSeconds).toBe(45);

      instance.handleTimeChange({ detail: { hours: 15, minutes: 0 } });

      // Seconds should remain unchanged
      expect(instance.selectedSeconds).toBe(45);
    });

    it("clears seconds when clearValue is called", async () => {
      const page = await createPage(
        '<tabworthy-times id="test" value="2024-03-15T14:30:45" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      expect(instance.selectedSeconds).toBe(45);

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.pickerRef = { value: new Date("2024-03-15") };
      await instance.clearValue();

      // After clearing, selectedSeconds should be reset on next value sync
      expect(instance.internalValue).toBeNull();
    });
  });

  describe("errorChange event", () => {
    it("emits errorChange with invalid reason for garbage input", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "not a datetime" }
      } as any);

      expect(errorSpy).toHaveBeenCalledWith({
        reason: "invalid",
        message: instance.timesLabels.invalidDateError
      });
    });

    it("emits errorChange with minDate reason when date is before minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-05-15T10:00:00" }
      } as any);

      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "minDate"
        })
      );
      expect(errorSpy.mock.calls[0][0].message).toContain("Jun 1, 2024");
    });

    it("emits errorChange with maxDate reason when date is after maxDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-07-15T10:00:00" }
      } as any);

      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "maxDate"
        })
      );
      expect(errorSpy.mock.calls[0][0].message).toContain("Jun 30, 2024");
    });

    it("uses function-valued min/max labels for typed input errors", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" locale="de-DE" min-date="2024-06-01T12:30:00" max-date="2024-06-30T17:45:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const minDateError = jest.fn((date: string) => `MIN(${date})`);
      const maxDateError = jest.fn((date: string) => `MAX(${date})`);
      const labels: TimesLabels = {
        ...(instance.timesLabels as TimesLabels),
        minDateError,
        maxDateError
      };
      page.root!.timesLabels = labels;
      await page.waitForChanges();
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-01T11:00:00" }
      } as any);
      const localizedMin = formatBoundaryDate(
        "de-DE",
        new Date(2024, 5, 1, 12, 30),
        true
      );
      expect(minDateError).toHaveBeenCalledWith(localizedMin);
      expect(errorSpy).toHaveBeenLastCalledWith({
        reason: "minDate",
        message: `MIN(${localizedMin})`
      });

      instance.handleInputChange({
        target: { value: "2024-06-30T18:00:00" }
      } as any);
      const localizedMax = formatBoundaryDate(
        "de-DE",
        new Date(2024, 5, 30, 17, 45),
        true
      );
      expect(maxDateError).toHaveBeenCalledWith(localizedMax);
      expect(errorSpy).toHaveBeenLastCalledWith({
        reason: "maxDate",
        message: `MAX(${localizedMax})`
      });
    });

    it("emits errorChange with disabledDate reason when date is disabled", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.disableDate = () => true;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-15T10:00:00" }
      } as any);

      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith({
        reason: "disabledDate",
        message: instance.timesLabels.disabledDateError
      });
    });

    it("does not emit errorChange for valid input", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedSeconds = 0;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-15T10:00:00" }
      } as any);

      expect(instance.errorState).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("does not emit errorChange when input is cleared", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2024-03-15T10:30:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.pickerRef = { value: new Date("2024-03-15") };
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({ target: { value: "" } } as any);

      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("displays error message for out-of-bounds date in render", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;

      instance.handleInputChange({
        target: { value: "2024-05-15T10:00:00" }
      } as any);
      await page.waitForChanges();

      const errorEl = page.root?.querySelector(".tabworthy-times__input-error");
      expect(errorEl).toBeTruthy();
      expect(errorEl?.textContent).toContain("Please fill in a date after");
    });

    it("accepts a date within minDate/maxDate bounds without error", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-01-01" max-date="2024-12-31"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedSeconds = 0;

      instance.handleInputChange({
        target: { value: "2024-06-15T10:00:00" }
      } as any);

      expect(instance.errorState).toBe(false);
      expect(instance.internalValue).toContain("2024-06-15");
    });

    it("rejects datetime before minDate with time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T12:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-01T11:00:00" }
      } as any);

      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "minDate" })
      );
    });

    it("accepts datetime at exactly the minDate with time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T12:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedSeconds = 0;

      instance.handleInputChange({
        target: { value: "2024-06-01T12:00:00" }
      } as any);

      expect(instance.errorState).toBe(false);
    });

    it("rejects datetime after maxDate with time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30T17:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-30T18:00:00" }
      } as any);

      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "maxDate" })
      );
    });

    it("accepts datetime at exactly the maxDate with time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30T17:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedSeconds = 0;

      instance.handleInputChange({
        target: { value: "2024-06-30T17:00:00" }
      } as any);

      expect(instance.errorState).toBe(false);
    });

    it("accepts same-day datetime when only date-only minDate is set", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      instance.selectedSeconds = 0;

      instance.handleInputChange({
        target: { value: "2024-06-01T00:00:00" }
      } as any);

      expect(instance.errorState).toBe(false);
    });

    it("includes time in error message when minDate has time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T12:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-01T11:00:00" }
      } as any);

      const msg = errorSpy.mock.calls[0][0].message;
      expect(msg).toContain("Jun");
      expect(msg).toContain("12");
      expect(msg).not.toMatch(/:\d{2}:\d{2}/);
    });

    it("includes seconds in error message when showSeconds is true and minDate has time", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T12:30:45" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-06-01T11:00:00" }
      } as any);

      const msg = errorSpy.mock.calls[0][0].message;
      expect(msg).toContain("45");
    });

    it("shows date-only in error message when minDate has no time component", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01" show-seconds="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.inputRef = { value: "" } as HTMLInputElement;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      instance.handleInputChange({
        target: { value: "2024-05-15T10:00:00" }
      } as any);

      const msg = errorSpy.mock.calls[0][0].message;
      expect(msg).toContain("Jun 1, 2024");
      expect(msg).not.toContain(":");
    });
  });

  describe("effective time bounds", () => {
    it("returns minTime when selectedDate is on the same day as minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T10:30:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-01T14:00:00");
      const result = instance.getEffectiveMinTime();

      expect(result).toEqual({ hours: 10, minutes: 30, seconds: 0 });
    });

    it("returns undefined minTime when selectedDate is on a different day", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T10:30:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-02T14:00:00");
      const result = instance.getEffectiveMinTime();

      expect(result).toBeUndefined();
    });

    it("returns maxTime when selectedDate is on the same day as maxDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30T17:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-30T12:00:00");
      const result = instance.getEffectiveMaxTime();

      expect(result).toEqual({ hours: 17, minutes: 0, seconds: 0 });
    });

    it("returns undefined maxTime when selectedDate is on a different day", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30T17:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-29T12:00:00");
      const result = instance.getEffectiveMaxTime();

      expect(result).toBeUndefined();
    });

    it("returns undefined when no selectedDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01T10:00:00" max-date="2024-06-30T17:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = undefined;

      expect(instance.getEffectiveMinTime()).toBeUndefined();
      expect(instance.getEffectiveMaxTime()).toBeUndefined();
    });

    it("returns undefined when minDate/maxDate have no time (date-only boundary)", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-01T14:00:00");
      const minResult = instance.getEffectiveMinTime();
      // date-only minDate parses with time 00:00:00 — so returns bounds at midnight
      expect(minResult).toEqual({ hours: 0, minutes: 0, seconds: 0 });

      instance.selectedDate = new Date("2024-06-30T14:00:00");
      const maxResult = instance.getEffectiveMaxTime();
      expect(maxResult).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });
  });

  describe("time picker disabled when date is out of bounds", () => {
    it("reports out of bounds when selectedDate is before minDate day", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-15T10:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-10T08:00:00");
      expect(instance.isDateOutOfBounds()).toBe(true);
    });

    it("reports out of bounds when selectedDate is after maxDate day", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-15T18:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-20T08:00:00");
      expect(instance.isDateOutOfBounds()).toBe(true);
    });

    it("does not report out of bounds when selectedDate is on the same day as minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-15T10:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-15T08:00:00");
      expect(instance.isDateOutOfBounds()).toBe(false);
    });

    it("does not report out of bounds when selectedDate is on the same day as maxDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-15T18:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-15T20:00:00");
      expect(instance.isDateOutOfBounds()).toBe(false);
    });

    it("does not report out of bounds when selectedDate is within range", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = new Date("2024-06-15T12:00:00");
      expect(instance.isDateOutOfBounds()).toBe(false);
    });

    it("does not report out of bounds when no selectedDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedDate = undefined;
      expect(instance.isDateOutOfBounds()).toBe(false);
    });

    it("disables the time picker when date is before minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-15T10:00:00" value="2024-06-10T08:00:00"></tabworthy-times>'
      );
      await page.waitForChanges();

      const picker = page.root?.querySelector("tabworthy-times-picker");
      expect(picker?.getAttribute("disabled")).not.toBeNull();
    });

    it("disables the time picker when date is after maxDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-15T18:00:00" value="2024-06-20T08:00:00"></tabworthy-times>'
      );
      await page.waitForChanges();

      const picker = page.root?.querySelector("tabworthy-times-picker");
      expect(picker?.getAttribute("disabled")).not.toBeNull();
    });

    it("does not disable the time picker when date is within range", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01" max-date="2024-06-30" value="2024-06-15T12:00:00"></tabworthy-times>'
      );
      await page.waitForChanges();

      const picker = page.root?.querySelector("tabworthy-times-picker");
      // disabled attribute should be absent or "false"
      const disabledAttr = picker?.getAttribute("disabled");
      expect(disabledAttr === null || disabledAttr === "false").toBe(true);
    });
  });

  describe("handlePickerSelection validation", () => {
    it("rejects picker selection before minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2024-06-01"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handlePickerSelection("2024-05-15");
      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "minDate" })
      );
    });

    it("rejects picker selection after maxDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handlePickerSelection("2024-07-15");
      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "maxDate" })
      );
    });

    it("uses function-valued min/max labels for picker errors", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" locale="de-DE" min-date="2024-06-01" max-date="2024-06-30"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const minDateError = jest.fn((date: string) => `MIN(${date})`);
      const maxDateError = jest.fn((date: string) => `MAX(${date})`);
      const labels: TimesLabels = {
        ...(instance.timesLabels as TimesLabels),
        minDateError,
        maxDateError
      };
      page.root!.timesLabels = labels;
      await page.waitForChanges();
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handlePickerSelection("2024-05-15");
      const localizedMin = formatBoundaryDate("de-DE", new Date(2024, 5, 1));
      expect(minDateError).toHaveBeenCalledWith(localizedMin);
      expect(errorSpy).toHaveBeenLastCalledWith({
        reason: "minDate",
        message: `MIN(${localizedMin})`
      });

      await instance.handlePickerSelection("2024-07-15");
      const localizedMax = formatBoundaryDate("de-DE", new Date(2024, 5, 30));
      expect(maxDateError).toHaveBeenCalledWith(localizedMax);
      expect(errorSpy).toHaveBeenLastCalledWith({
        reason: "maxDate",
        message: `MAX(${localizedMax})`
      });
    });

    it("rejects picker selection of disabled date", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.disableDate = () => true;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handlePickerSelection("2024-06-15");
      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "disabledDate" })
      );
    });

    it("rejects range picker selection before minDate", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" range min-date="2024-06-01"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const errorSpy = jest.spyOn(instance.errorChange, "emit");

      await instance.handlePickerSelection("2024-05-10,2024-06-15");
      expect(instance.errorState).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "minDate" })
      );
    });

    it("clamps time to minTime when selecting boundary day with earlier time", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2026-04-22T16:09:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      // Simulate current selection at 14:53 (before min time of 16:09)
      instance.selectedHours = 14;
      instance.selectedMinutes = 53;
      instance.selectedSeconds = 0;

      await instance.handlePickerSelection("2026-04-22");

      // Should clamp to 16:09, not stay at 14:53
      expect(instance.selectedHours).toBe(16);
      expect(instance.selectedMinutes).toBe(9);
    });

    it("clamps time to maxTime when selecting boundary day with later time", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" max-date="2026-04-22T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedHours = 18;
      instance.selectedMinutes = 30;
      instance.selectedSeconds = 0;

      await instance.handlePickerSelection("2026-04-22");

      expect(instance.selectedHours).toBe(14);
      expect(instance.selectedMinutes).toBe(0);
    });

    it("does not clamp time when selecting non-boundary day", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" min-date="2026-04-20T16:09:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      instance.selectedHours = 10;
      instance.selectedMinutes = 0;
      instance.selectedSeconds = 0;

      await instance.handlePickerSelection("2026-04-22");

      // Should keep 10:00 since April 22 is not the min boundary day
      expect(instance.selectedHours).toBe(10);
      expect(instance.selectedMinutes).toBe(0);
    });

    it("re-emits when clicking the same date again", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      const emitSpy = jest.spyOn(instance.selectDateTime, "emit");

      await instance.handlePickerSelection("2026-04-22");
      expect(emitSpy).toHaveBeenCalledTimes(1);

      // Click the same date again — should still emit
      await instance.handlePickerSelection("2026-04-22");
      expect(emitSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("revertInput", () => {
    it("reverts value and syncs internal state", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10 14:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      // Simulate a user change
      instance.value = "2026-04-20 16:00";
      instance.internalValue = "2026-04-20 16:00";

      await instance.revertInput("2026-04-10 14:00");

      expect(instance.value).toBe("2026-04-10 14:00");
    });

    it("clears error state when clearError is true", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.errorState = true;

      await instance.revertInput("2026-04-10 14:00", true);

      expect(instance.errorState).toBe(false);
    });

    it("does not clear error state when clearError is false", async () => {
      const page = await createPage(
        '<tabworthy-times id="time"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.errorState = true;

      await instance.revertInput("2026-04-10 14:00", false);

      expect(instance.errorState).toBe(true);
    });

    it("handles undefined value", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10 14:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      await instance.revertInput(undefined);

      expect(instance.value).toBeUndefined();
    });

    it("updates calendar picker when reverting to a new value", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.pickerRef = { value: null };

      await instance.revertInput("2026-04-20T16:30:00");

      expect(instance.pickerRef.value).toBeInstanceOf(Date);
      expect(instance.pickerRef.value.getDate()).toBe(20);
    });

    it("clears calendar picker when reverting to undefined", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.pickerRef = { value: new Date("2026-04-10") };

      await instance.revertInput(undefined);

      expect(instance.pickerRef.value).toBeNull();
    });

    it("clears input field when reverting to undefined", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.inputRef = { value: "Apr 10, 2026 2:00 PM" } as HTMLInputElement;

      await instance.revertInput(undefined);

      expect(instance.inputRef.value).toBe("");
    });

    it("updates time state when reverting to a different datetime", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;

      await instance.revertInput("2026-04-20T09:45:30");

      expect(instance.selectedHours).toBe(9);
      expect(instance.selectedMinutes).toBe(45);
      expect(instance.selectedSeconds).toBe(30);
      expect(instance.selectedDate).toBeInstanceOf(Date);
    });

    it("formats input display when reverting with inputShouldFormat enabled", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" input-should-format="true"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      instance.inputRef = { value: "" } as HTMLInputElement;

      await instance.revertInput("2026-04-20T16:30:00");

      expect(instance.inputRef.value).toBeTruthy();
    });

    it("updates visible input when reverting an emitted typed blur without display formatting", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="21/04/2026 2:53 PM" format="DD/MM/YYYY h:mm A" input-should-format="false"></tabworthy-times>'
      );
      const input = page.root?.querySelector("input") as HTMLInputElement;

      page.root?.addEventListener("selectDateTime", () => {
        void (page.root as HTMLTabworthyTimesElement).revertInput(
          "21/04/2026 2:53 PM"
        );
      });

      input.value = "20/04/2026 2:53 PM";
      input.dispatchEvent(new Event("change"));
      input.dispatchEvent(new Event("blur"));
      await page.waitForChanges();

      expect(input.value).toBe("21/04/2026 2:53 PM");
    });

    it("resets selectedDate when reverting to undefined", async () => {
      const page = await createPage(
        '<tabworthy-times id="time" value="2026-04-10T14:00:00"></tabworthy-times>'
      );
      const instance = page.rootInstance as any;
      expect(instance.selectedDate).toBeInstanceOf(Date);

      await instance.revertInput(undefined);

      expect(instance.selectedDate).toBeUndefined();
    });
  });
});
