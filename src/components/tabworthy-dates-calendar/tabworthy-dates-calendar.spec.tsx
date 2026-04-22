import { newSpecPage } from "@stencil/core/testing";
import { TabworthyDatesCalendar } from "./tabworthy-dates-calendar";

describe("tabworthy-dates-calendar", () => {
  const createPage = async (
    html = `<tabworthy-dates-calendar></tabworthy-dates-calendar>`
  ) => {
    return newSpecPage({
      components: [TabworthyDatesCalendar],
      html
    });
  };

  it("renders with defaults and initializes current date/weekdays", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    expect(page.root).toBeTruthy();
    expect(instance.currentDate).toBeInstanceOf(Date);
    expect(Array.isArray(instance.weekdays)).toBe(true);
  });

  it("initializes currentDate from startDate when provided", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-06-20"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    expect(instance.currentDate).toBeInstanceOf(Date);
    expect(instance.currentDate.getFullYear()).toBe(2024);
    expect(instance.currentDate.getMonth()).toBe(5); // June
    expect(instance.currentDate.getDate()).toBe(20);
  });

  it("initializes currentDate to today when startDate is not provided", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesCalendar],
      html: `<tabworthy-dates-calendar></tabworthy-dates-calendar>`,
      supportsShadowDom: false
    });
    const instance = page.rootInstance as any;

    instance.startDate = undefined;
    instance.init();

    const today = new Date();
    expect(instance.currentDate).toBeInstanceOf(Date);
    expect(instance.currentDate.getFullYear()).toBe(today.getFullYear());
    expect(instance.currentDate.getMonth()).toBe(today.getMonth());
    expect(instance.currentDate.getDate()).toBe(today.getDate());
  });

  it("watches modal, locale, firstDayOfWeek, range, startDate, and value", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.modalIsOpen = true;
    instance.watchModalIsOpen();
    expect(instance.moveFocusOnModalOpen).toBe(true);

    const oldWeekdays = instance.weekdays;
    instance.firstDayOfWeek = 1;
    instance.watchFirstDayOfWeek();
    expect(instance.weekdays).not.toBe(oldWeekdays);

    instance.locale = undefined;
    instance.watchLocale();
    expect(instance.locale).toBeTruthy();

    const emitSpy = jest.spyOn(instance.selectDate, "emit");
    instance.range = true;
    instance.watchRange();
    expect(instance.value).toBeUndefined();
    expect(emitSpy).toHaveBeenCalledWith(undefined);

    instance.startDate = "2024-03-15";
    instance.watchStartDate();
    expect(instance.currentDate).toBeInstanceOf(Date);

    instance.value = [new Date("2024-03-10"), new Date("2024-03-12")];
    instance.watchValue();
    expect(instance.currentDate.getDate()).toBe(10);

    instance.value = new Date("2024-03-20");
    instance.watchValue();
    expect(instance.currentDate.getDate()).toBe(20);
  });

  it("focuses date when requested from lifecycle flags", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    const focusSpy = jest.fn();
    jest
      .spyOn(page.root!, "querySelector")
      .mockReturnValue({ focus: focusSpy } as any);

    instance.moveFocusAfterMonthChanged = true;
    instance.componentDidRender();
    expect(focusSpy).toHaveBeenCalled();

    jest.useFakeTimers();
    instance.moveFocusOnModalOpen = true;
    instance.componentDidRender();
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it("returns calendar title and rows", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const title = instance.getTitle();
    const rows = instance.getCalendarRows();

    expect(title).toContain("2024");
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(3);
  });

  it("pads compact months to six calendar rows to avoid layout shifting", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2021-02-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const rows = instance.getCalendarRows();
    const renderedRows = page.root?.querySelectorAll("tbody tr");
    const lastRowDates = rows[5].map((date: Date) => ({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    }));

    expect(rows).toHaveLength(6);
    rows.forEach((row: Date[]) => expect(row).toHaveLength(7));
    expect(renderedRows).toHaveLength(6);
    expect(lastRowDates).toEqual([
      { day: 7, month: 2, year: 2021 },
      { day: 8, month: 2, year: 2021 },
      { day: 9, month: 2, year: 2021 },
      { day: 10, month: 2, year: 2021 },
      { day: 11, month: 2, year: 2021 },
      { day: 12, month: 2, year: 2021 },
      { day: 13, month: 2, year: 2021 }
    ]);
  });

  it("returns undefined title when current date is missing", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    instance.currentDate = undefined;
    expect(instance.getTitle()).toBeUndefined();
  });

  it("updates current date with bounds and emits month change", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar min-date="2024-03-01" max-date="2024-03-31" start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const emitSpy = jest.spyOn(instance.changeMonth, "emit");
    const focusSpy = jest
      .spyOn(instance, "focusDate")
      .mockImplementation(() => undefined);

    instance.updateCurrentDate(new Date("2024-02-01"), true);
    expect(instance.currentDate.getMonth()).toBe(2);

    instance.updateCurrentDate(new Date("2024-04-20"), true);
    expect(instance.currentDate.getMonth()).toBe(2);

    instance.updateCurrentDate(new Date("2024-03-20"), true);
    expect(focusSpy).toHaveBeenCalled();

    instance.updateCurrentDate(new Date("2024-05-01"));
    expect(emitSpy).toHaveBeenCalled();
  });

  it("selects single dates and ignores disabled/same-date selections", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;
    instance.range = false;

    const emitSpy = jest.spyOn(instance.selectDate, "emit");

    instance.disableDate = () => true;
    instance.onSelectDate(new Date("2024-03-16"));
    expect(emitSpy).not.toHaveBeenCalled();

    instance.disableDate = () => false;
    instance.onSelectDate(new Date("2024-03-16"));
    expect(instance.value).toBeInstanceOf(Date);
    expect(emitSpy).toHaveBeenCalled();

    emitSpy.mockClear();
    instance.onSelectDate(new Date("2024-03-16"));
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("selects ranges and normalizes inverted range order", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar range start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.spyOn(instance.selectDate, "emit");

    instance.onSelectDate(new Date("2024-03-20"));
    expect(instance.value).toEqual([new Date("2024-03-20")]);

    instance.onSelectDate(new Date("2024-03-18"));
    expect(Array.isArray(instance.value)).toBe(true);
    expect(instance.value[0].getDate()).toBe(18);
    expect(instance.value[1].getDate()).toBe(20);
    expect(emitSpy).toHaveBeenCalled();
  });

  it("marks dates within a complete range as selected", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar range start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    // Set a complete range (2 dates)
    instance.value = [new Date("2024-03-10"), new Date("2024-03-20")];
    await page.waitForChanges();

    // A date in the middle of the range should be selected
    const middleDate = page.root?.querySelector('[data-date="2024-03-15"]');
    expect(middleDate?.getAttribute("aria-selected")).toBe("true");

    // Start and end dates should also be selected
    const startDate = page.root?.querySelector('[data-date="2024-03-10"]');
    const endDate = page.root?.querySelector('[data-date="2024-03-20"]');
    expect(startDate?.getAttribute("aria-selected")).toBe("true");
    expect(endDate?.getAttribute("aria-selected")).toBe("true");
  });

  it("handles next/previous/today/clear operations", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const updateSpy = jest.spyOn(instance, "updateCurrentDate");
    const emitSpy = jest.spyOn(instance.selectDate, "emit");

    instance.nextMonth();
    instance.previousMonth();
    instance.nextYear();
    instance.previousYear();
    instance.showToday();

    expect(updateSpy).toHaveBeenCalled();

    instance.clear();
    expect(instance.value).toBeUndefined();
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it("handles click selection and ignores invalid click targets", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const selectSpy = jest.spyOn(instance, "onSelectDate");
    const updateSpy = jest.spyOn(instance, "updateCurrentDate");

    instance.onClick({ target: { closest: () => null } } as any);
    expect(selectSpy).not.toHaveBeenCalled();

    instance.onClick({
      target: {
        closest: () => ({ dataset: { date: "2024-03-16" } })
      }
    } as any);

    expect(updateSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();

    instance.disabled = true;
    selectSpy.mockClear();
    instance.onClick({
      target: {
        closest: () => ({ dataset: { date: "2024-03-17" } })
      }
    } as any);
    expect(selectSpy).not.toHaveBeenCalled();
  });

  it("handles month and year selectors with bounds", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar min-date="2024-03-01" max-date="2024-03-31" start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const updateSpy = jest.spyOn(instance, "updateCurrentDate");
    const changeYearSpy = jest.spyOn(instance.changeYear, "emit");

    instance.onMonthSelect({ target: { value: "4" } } as any);
    expect(updateSpy).toHaveBeenCalled();

    updateSpy.mockClear();
    instance.currentDate = new Date("2025-01-01");
    instance.onMonthSelect({ target: { value: "3" } } as any);
    expect(updateSpy).not.toHaveBeenCalled();

    instance.currentDate = new Date("2024-03-15");
    instance.onYearSelect({ target: { value: "2024" } } as any);
    expect(changeYearSpy).toHaveBeenCalledWith({ year: 2024 });

    // Test year select with out-of-bounds year
    updateSpy.mockClear();
    changeYearSpy.mockClear();
    instance.currentDate = new Date("2025-06-15");
    instance.onYearSelect({ target: { value: "2025" } } as any);
    expect(changeYearSpy).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation and date selection keys", async () => {
    const page = await createPage(
      '<tabworthy-dates-calendar start-date="2024-03-15"></tabworthy-dates-calendar>'
    );
    const instance = page.rootInstance as any;

    const updateSpy = jest.spyOn(instance, "updateCurrentDate");
    const selectSpy = jest.spyOn(instance, "onSelectDate");

    const fire = (code: string, shiftKey = false) => {
      const preventDefault = jest.fn();
      instance.onKeyDown({ code, shiftKey, preventDefault } as any);
      expect(preventDefault).toHaveBeenCalled();
    };

    fire("ArrowLeft");
    fire("ArrowRight");
    fire("ArrowUp");
    fire("ArrowDown");
    fire("PageUp");
    fire("PageUp", true);
    fire("PageDown");
    fire("PageDown", true);
    fire("Home");
    fire("End");
    fire("Space");
    fire("Enter");

    expect(updateSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();

    instance.disabled = true;
    updateSpy.mockClear();
    instance.onKeyDown({ code: "ArrowLeft", preventDefault: jest.fn() } as any);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("handles mouse enter/leave hover state", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;

    instance.onMouseEnter({
      target: { closest: () => ({ dataset: { date: "2024-03-20" } }) }
    } as any);
    expect(instance.hoveredDate).toBeInstanceOf(Date);

    instance.onMouseLeave();
    expect(instance.hoveredDate).toBeUndefined();

    instance.disabled = true;
    instance.onMouseEnter({
      target: { closest: () => ({ dataset: { date: "2024-03-21" } }) }
    } as any);
    expect(instance.hoveredDate).toBeUndefined();
  });

  it("renders footer controls and keyboard hint toggle", async () => {
    const matchMediaMock = jest.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock
    });

    const page = await createPage(
      "<tabworthy-dates-calendar show-today-button show-clear-button show-keyboard-hint inline></tabworthy-dates-calendar>"
    );

    expect(
      page.root?.querySelector(".tabworthy-dates-calendar__today-button")
    ).toBeTruthy();
    expect(
      page.root?.querySelector(".tabworthy-dates-calendar__clear-button")
    ).toBeTruthy();
    expect(
      page.root?.querySelector(".tabworthy-dates-calendar__keyboard-hint")
    ).toBeTruthy();

    matchMediaMock.mockReturnValue({ matches: true });
    await page.waitForChanges();
  });

  it("renders custom year stepper button content when provided", async () => {
    const page = await createPage(
      `<tabworthy-dates-calendar
        show-year-stepper
        previous-year-button-content="<span>PREV</span>"
        next-year-button-content="<span>NEXT</span>"
      ></tabworthy-dates-calendar>`
    );

    const prevYearButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__previous-year-button"
    );
    const nextYearButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__next-year-button"
    );

    expect(prevYearButton?.innerHTML).toContain("PREV");
    expect(nextYearButton?.innerHTML).toContain("NEXT");
  });

  it("renders range prompt text and triggers keyboard hint action", async () => {
    const matchMediaMock = jest.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock
    });

    const page = await createPage(
      "<tabworthy-dates-calendar range show-keyboard-hint></tabworthy-dates-calendar>"
    );
    const instance = page.rootInstance as any;
    instance.value = [new Date(instance.currentDate)];
    await page.waitForChanges();

    const selectedCellSr =
      page.root?.querySelector('[aria-selected="true"] .visually-hidden')
        ?.textContent || "";
    expect(selectedCellSr).toContain(instance.labels.chooseAsEndDate);

    const keyboardHint = page.root?.querySelector(
      ".tabworthy-dates-calendar__keyboard-hint"
    ) as HTMLButtonElement;
    keyboardHint.click();
    expect(keyboardHint).toBeTruthy();
  });

  it("renders close button when showCloseButton is true", async () => {
    const page = await createPage(
      "<tabworthy-dates-calendar show-close-button></tabworthy-dates-calendar>"
    );

    const closeButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__close-button"
    );
    expect(closeButton).toBeTruthy();
  });

  it("does not render close button when showCloseButton is false", async () => {
    const page = await createPage(
      "<tabworthy-dates-calendar></tabworthy-dates-calendar>"
    );

    const closeButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__close-button"
    );
    expect(closeButton).toBeFalsy();
  });

  it("emits requestClose event when close button is clicked", async () => {
    const page = await createPage(
      "<tabworthy-dates-calendar show-close-button></tabworthy-dates-calendar>"
    );
    const instance = page.rootInstance as any;

    const emitSpy = jest.spyOn(instance.requestClose, "emit");

    instance.close();

    expect(emitSpy).toHaveBeenCalled();
  });

  it("renders custom close button content when provided", async () => {
    const page = await createPage(
      `<tabworthy-dates-calendar show-close-button close-button-content="<span>X</span>"></tabworthy-dates-calendar>`
    );

    const closeButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__close-button"
    );
    expect(closeButton?.innerHTML).toContain("X");
    expect(closeButton?.getAttribute("aria-label")).toBe("Close");
  });

  it("renders aria-label on today button when custom content is provided", async () => {
    const page = await createPage(
      `<tabworthy-dates-calendar today-button-content="<span>T</span>"></tabworthy-dates-calendar>`
    );

    const todayButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__today-button"
    );
    expect(todayButton?.innerHTML).toContain("T");
    expect(todayButton?.getAttribute("aria-label")).toBe("Show today");
  });

  it("renders aria-label on clear button when custom content is provided", async () => {
    const page = await createPage(
      `<tabworthy-dates-calendar show-clear-button clear-button-content="<span>CLR</span>"></tabworthy-dates-calendar>`
    );

    const clearButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__clear-button"
    );
    expect(clearButton?.innerHTML).toContain("CLR");
    expect(clearButton?.getAttribute("aria-label")).toBe("Clear value");
  });

  it("does not set aria-label on footer buttons when no custom content", async () => {
    const page = await createPage(
      `<tabworthy-dates-calendar show-close-button show-clear-button></tabworthy-dates-calendar>`
    );

    const todayButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__today-button"
    );
    const clearButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__clear-button"
    );
    const closeButton = page.root?.querySelector(
      ".tabworthy-dates-calendar__close-button"
    );
    expect(todayButton?.getAttribute("aria-label")).toBeNull();
    expect(clearButton?.getAttribute("aria-label")).toBeNull();
    expect(closeButton?.getAttribute("aria-label")).toBeNull();
  });

  it("renders footer when only showCloseButton is true", async () => {
    const page = await createPage(
      "<tabworthy-dates-calendar show-close-button show-today-button='false' show-clear-button='false'></tabworthy-dates-calendar>"
    );

    const footer = page.root?.querySelector(
      ".tabworthy-dates-calendar__footer"
    );
    expect(footer).toBeTruthy();
  });

  describe("navigation button disabled state", () => {
    it("disables next month button when next month is beyond maxDate", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" min-date="2026-03-01" max-date="2026-03-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();

      const nextBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__next-month-button"
      );
      expect(nextBtn?.getAttribute("aria-disabled")).not.toBe("false");
    });

    it("disables previous month button when previous month is before minDate", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" min-date="2026-03-01" max-date="2026-03-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();

      const prevBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__previous-month-button"
      );
      expect(prevBtn?.getAttribute("aria-disabled")).not.toBe("false");
    });

    it("does not navigate forward when clicking next month button at max boundary", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" min-date="2026-03-01" max-date="2026-03-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();
      const instance = page.rootInstance as any;
      const monthBefore = instance.currentDate.getMonth();

      const nextBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__next-month-button"
      ) as HTMLButtonElement;
      nextBtn?.click();
      await page.waitForChanges();

      expect(instance.currentDate.getMonth()).toBe(monthBefore);
    });

    it("does not navigate backward when clicking previous month button at min boundary", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" min-date="2026-03-01" max-date="2026-03-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();
      const instance = page.rootInstance as any;
      const monthBefore = instance.currentDate.getMonth();

      const prevBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__previous-month-button"
      ) as HTMLButtonElement;
      prevBtn?.click();
      await page.waitForChanges();

      expect(instance.currentDate.getMonth()).toBe(monthBefore);
    });

    it("does not navigate when clicking next year button at max year boundary", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" show-year-stepper min-date="2026-01-01" max-date="2026-12-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();
      const instance = page.rootInstance as any;
      const yearBefore = instance.currentDate.getFullYear();

      const nextYearBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__next-year-button"
      ) as HTMLButtonElement;
      nextYearBtn?.click();
      await page.waitForChanges();

      expect(instance.currentDate.getFullYear()).toBe(yearBefore);
    });

    it("does not navigate when clicking previous year button at min year boundary", async () => {
      const page = await createPage(
        '<tabworthy-dates-calendar start-date="2026-03-15" show-year-stepper min-date="2026-01-01" max-date="2026-12-31"></tabworthy-dates-calendar>'
      );
      await page.waitForChanges();
      const instance = page.rootInstance as any;
      const yearBefore = instance.currentDate.getFullYear();

      const prevYearBtn = page.root?.querySelector(
        ".tabworthy-dates-calendar__previous-year-button"
      ) as HTMLButtonElement;
      prevYearBtn?.click();
      await page.waitForChanges();

      expect(instance.currentDate.getFullYear()).toBe(yearBefore);
    });
  });
});
