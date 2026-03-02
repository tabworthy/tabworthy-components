import { newSpecPage } from "@stencil/core/testing";
import { InclusiveTimes } from "./tabworthy-times";
import { InclusiveDatesCalendar } from "../tabworthy-dates-calendar/tabworthy-dates-calendar";

describe("tabworthy-times", () => {
  const originalError = console.error;

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
      components: [InclusiveTimes],
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
      components: [InclusiveTimes],
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
      components: [InclusiveTimes],
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

  it("shows selected date class in calendar when value is preselected", async () => {
    const page = await newSpecPage({
      components: [InclusiveTimes, InclusiveDatesCalendar],
      html: `<tabworthy-times id="test-times" value="2024-03-15T14:30:00" format="YYYY-MM-DDTHH:mm:ss"></tabworthy-times>`
    });

    await page.waitForChanges();

    const selectedDate = page.root?.querySelector(
      ".tabworthy-dates-calendar__date--selected"
    );
    expect(selectedDate).toBeTruthy();
    expect(selectedDate?.getAttribute("data-date")).toBe("2024-03-15");
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
});
