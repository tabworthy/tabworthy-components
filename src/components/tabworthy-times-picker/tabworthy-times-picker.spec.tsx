import { newSpecPage } from "@stencil/core/testing";
import { TabworthyTimesPicker } from "./tabworthy-times-picker";

type TimeChangedDetail = {
  hours: number;
  minutes: number;
  seconds?: number;
  period?: "AM" | "PM";
};

describe("tabworthy-times-picker", () => {
  const createPage = async (
    html = `<tabworthy-times-picker></tabworthy-times-picker>`
  ) => {
    return newSpecPage({
      components: [TabworthyTimesPicker],
      html
    });
  };

  it("renders with default props", async () => {
    const page = await createPage();

    expect(page.root).toBeTruthy();
    expect(page.rootInstance).toBeInstanceOf(TabworthyTimesPicker);
    expect(page.rootInstance.hours).toBe(12);
    expect(page.rootInstance.minutes).toBe(0);
  });

  it("renders 12-hour mode controls", async () => {
    const page = await createPage();
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();

    expect(page.rootInstance.useTwelveHourFormat).toBe(true);
    expect(
      page.root?.querySelector(".tabworthy-times-picker__period")
    ).toBeTruthy();
  });

  it("respects disabled and labelsSrOnly props", async () => {
    const page = await createPage();
    page.rootInstance.disabled = true;
    page.rootInstance.labelsSrOnly = false;
    await page.waitForChanges();

    const labels = page.root?.querySelectorAll("label") ?? [];
    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    const minuteInput = page.root?.querySelector(
      "#tabworthy-times-picker-minutes"
    ) as HTMLInputElement;

    expect(page.rootInstance.disabled).toBe(true);
    expect(page.rootInstance.labelsSrOnly).toBe(false);
    expect(hourInput.disabled).toBe(true);
    expect(minuteInput.disabled).toBe(true);
    expect(
      Array.from(labels).every(
        (label) =>
          !label.classList.contains("tabworthy-times-picker__label--sr-only")
      )
    ).toBe(true);
  });

  it("focuses the hours input when the modal opens", async () => {
    const page = await createPage();
    const instance = page.rootInstance as any;
    const focus = jest.fn();

    instance.hoursInputRef = { focus };
    jest.useFakeTimers();
    instance.modalIsOpen = true;
    instance.watchModalIsOpen();
    instance.componentDidRender();
    jest.runAllTimers();

    expect(focus).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("supports custom labels and class name", async () => {
    const page = await createPage(
      `<tabworthy-times-picker element-class-name="custom-picker"></tabworthy-times-picker>`
    );
    page.rootInstance.labels = {
      hours: "Horas",
      minutes: "Minutos",
      am: "AM",
      pm: "PM",
      timePicker: "Selector de hora",
      incrementHours: "Incrementar horas",
      decrementHours: "Decrementar horas",
      incrementMinutes: "Incrementar minutos",
      decrementMinutes: "Decrementar minutos"
    };
    await page.waitForChanges();

    expect(page.root?.classList.contains("custom-picker")).toBe(true);
    expect(page.root?.getAttribute("aria-label")).toBe("Selector de hora");
    expect(page.root?.querySelector("label")?.textContent?.trim()).toBe(
      "Horas"
    );
    expect(page.root?.querySelector(".custom-picker__container")).toBeTruthy();
  });

  it("emits hour increment/decrement events in 12-hour mode", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="11" minutes="30"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;

    increment.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 30,
      period: "AM"
    });

    decrement.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 11,
      minutes: 30,
      period: "AM"
    });
  });

  it("emits minute increment/decrement events in 24-hour mode", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="10" minutes="59"></tabworthy-times-picker>`
    );
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment minutes"]'
    ) as HTMLButtonElement;
    const decrement = page.root?.querySelector(
      '[aria-label="Decrement minutes"]'
    ) as HTMLButtonElement;

    increment.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 10,
      minutes: 0,
      period: undefined
    });

    decrement.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 10,
      minutes: 59,
      period: undefined
    });
  });

  it("toggles AM/PM and does not emit for no-op toggle", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="10" minutes="30"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const pmButton = page.root?.querySelector(
      '[aria-label="PM"]'
    ) as HTMLButtonElement;
    const amButton = page.root?.querySelector(
      '[aria-label="AM"]'
    ) as HTMLButtonElement;

    pmButton.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 22,
      minutes: 30,
      period: "PM"
    });

    amButton.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 10,
      minutes: 30,
      period: "AM"
    });

    const calls = handler.mock.calls.length;
    amButton.click();
    await page.waitForChanges();
    expect(handler.mock.calls.length).toBe(calls);
  });

  it("handles hour input in 12-hour mode", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="10" minutes="30"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    const pmButton = page.root?.querySelector(
      '[aria-label="PM"]'
    ) as HTMLButtonElement;

    hourInput.value = "12";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 30,
      period: "AM"
    });

    pmButton.click();
    await page.waitForChanges();

    hourInput.value = "1";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 13,
      minutes: 30,
      period: "PM"
    });
  });

  it("handles edge transitions in 12-hour mode", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="0" minutes="0"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;

    increment.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 1,
      minutes: 0,
      period: "AM"
    });

    decrement.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 0,
      period: "AM"
    });

    page.rootInstance.hours = 12;
    page.rootInstance.minutes = 0;
    await page.waitForChanges();

    const decrementAtNoon = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrementAtNoon.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 23,
      minutes: 0,
      period: "PM"
    });
  });

  it("increments PM hours in 12-hour mode", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="13" minutes="0"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    increment.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 14,
      minutes: 0,
      period: "PM"
    });
  });

  it("handles 24-hour rollovers and direct inputs", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="23" minutes="59"></tabworthy-times-picker>`
    );
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const incrementHour = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    const decrementHour = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    const minuteInput = page.root?.querySelector(
      "#tabworthy-times-picker-minutes"
    ) as HTMLInputElement;
    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;

    incrementHour.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 59,
      period: undefined
    });

    decrementHour.click();
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 23,
      minutes: 59,
      period: undefined
    });

    minuteInput.value = "0";
    minuteInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 23,
      minutes: 0,
      period: undefined
    });

    hourInput.value = "5";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();
    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 5,
      minutes: 0,
      period: undefined
    });
  });

  it("reacts to watched hour/minute prop changes", async () => {
    const page = await createPage(
      `<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>`
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();

    page.rootInstance.hours = 15;
    page.rootInstance.minutes = 45;
    await page.waitForChanges();

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    const minuteInput = page.root?.querySelector(
      "#tabworthy-times-picker-minutes"
    ) as HTMLInputElement;
    const pmButton = page.root?.querySelector(
      '.tabworthy-times-picker__period-button--active[aria-label="PM"]'
    );

    expect(hourInput.value).toBe("03");
    expect(minuteInput.value).toBe("45");
    expect(pmButton).toBeTruthy();
  });

  describe("showSeconds mode", () => {
    it("does not render seconds control by default", async () => {
      const page = await createPage();
      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      );
      expect(secondsInput).toBeNull();
    });

    it("renders seconds control when showSeconds is true", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true"></tabworthy-times-picker>`
      );
      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      );
      expect(secondsInput).toBeTruthy();
    });

    it("respects initial seconds prop value", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" seconds="45"></tabworthy-times-picker>`
      );
      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      ) as HTMLInputElement;
      expect(secondsInput.value).toBe("45");
    });

    it("emits seconds in timeChanged event when showSeconds is true", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" hours="10" minutes="30" seconds="15"></tabworthy-times-picker>`
      );
      const handler = jest.fn();
      page.root?.addEventListener("timeChanged", ((
        event: CustomEvent<TimeChangedDetail>
      ) => handler(event.detail)) as EventListener);

      const increment = page.root?.querySelector(
        '[aria-label="Increment seconds"]'
      ) as HTMLButtonElement;

      increment.click();
      await page.waitForChanges();
      expect(handler.mock.calls.at(-1)?.[0]).toEqual({
        hours: 10,
        minutes: 30,
        seconds: 16,
        period: undefined
      });
    });

    it("increments seconds and wraps at 60", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" seconds="59"></tabworthy-times-picker>`
      );
      const handler = jest.fn();
      page.root?.addEventListener("timeChanged", ((
        event: CustomEvent<TimeChangedDetail>
      ) => handler(event.detail)) as EventListener);

      const increment = page.root?.querySelector(
        '[aria-label="Increment seconds"]'
      ) as HTMLButtonElement;

      increment.click();
      await page.waitForChanges();
      expect(handler.mock.calls.at(-1)?.[0].seconds).toBe(0);
    });

    it("decrements seconds and wraps at 0", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" seconds="0"></tabworthy-times-picker>`
      );
      const handler = jest.fn();
      page.root?.addEventListener("timeChanged", ((
        event: CustomEvent<TimeChangedDetail>
      ) => handler(event.detail)) as EventListener);

      const decrement = page.root?.querySelector(
        '[aria-label="Decrement seconds"]'
      ) as HTMLButtonElement;

      decrement.click();
      await page.waitForChanges();
      expect(handler.mock.calls.at(-1)?.[0].seconds).toBe(59);
    });

    it("handles direct seconds input", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" seconds="30"></tabworthy-times-picker>`
      );
      const handler = jest.fn();
      page.root?.addEventListener("timeChanged", ((
        event: CustomEvent<TimeChangedDetail>
      ) => handler(event.detail)) as EventListener);

      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      ) as HTMLInputElement;

      secondsInput.value = "45";
      secondsInput.dispatchEvent(new Event("input"));
      await page.waitForChanges();

      expect(handler.mock.calls.at(-1)?.[0].seconds).toBe(45);
    });

    it("does not include seconds in event when showSeconds is false", async () => {
      const page = await createPage(
        `<tabworthy-times-picker hours="10" minutes="30"></tabworthy-times-picker>`
      );
      const handler = jest.fn();
      page.root?.addEventListener("timeChanged", ((
        event: CustomEvent<TimeChangedDetail>
      ) => handler(event.detail)) as EventListener);

      const increment = page.root?.querySelector(
        '[aria-label="Increment minutes"]'
      ) as HTMLButtonElement;

      increment.click();
      await page.waitForChanges();
      expect(handler.mock.calls.at(-1)?.[0].seconds).toBeUndefined();
    });

    it("reacts to watched seconds prop changes", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" seconds="10"></tabworthy-times-picker>`
      );

      page.rootInstance.seconds = 55;
      await page.waitForChanges();

      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      ) as HTMLInputElement;
      expect(secondsInput.value).toBe("55");
    });

    it("renders seconds label with correct aria-label", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true"></tabworthy-times-picker>`
      );

      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      ) as HTMLInputElement;
      expect(secondsInput.getAttribute("aria-label")).toBe("Seconds");
    });

    it("disables seconds controls when disabled prop is true", async () => {
      const page = await createPage(
        `<tabworthy-times-picker show-seconds="true" disabled="true"></tabworthy-times-picker>`
      );

      const secondsInput = page.root?.querySelector(
        "#tabworthy-times-picker-seconds"
      ) as HTMLInputElement;
      const incrementBtn = page.root?.querySelectorAll(
        '[aria-label="Increment seconds"]'
      )[0] as HTMLButtonElement;
      const decrementBtn = page.root?.querySelectorAll(
        '[aria-label="Decrement seconds"]'
      )[0] as HTMLButtonElement;

      expect(secondsInput.disabled).toBe(true);
      expect(incrementBtn.getAttribute("disabled")).not.toBeNull();
      expect(decrementBtn.getAttribute("disabled")).not.toBeNull();
    });
  });

  describe("minTime/maxTime bounds", () => {
    it("clamps time to minTime when set below minimum", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="10" minutes="30"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;

      const emitSpy = jest.spyOn(instance.timeChanged, "emit");

      instance.minTime = { hours: 10, minutes: 30, seconds: 0 };
      instance.internalHours = 9;
      instance.internalMinutes = 0;
      instance.emitTimeChange();

      const emitted = emitSpy.mock.calls[0][0] as TimeChangedDetail;
      expect(emitted.hours).toBe(10);
      expect(emitted.minutes).toBe(30);
    });

    it("clamps time to maxTime when set above maximum", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="14" minutes="0"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;

      const emitSpy = jest.spyOn(instance.timeChanged, "emit");

      instance.maxTime = { hours: 17, minutes: 0, seconds: 0 };
      instance.internalHours = 18;
      instance.internalMinutes = 30;
      instance.emitTimeChange();

      const emitted = emitSpy.mock.calls[0][0] as TimeChangedDetail;
      expect(emitted.hours).toBe(17);
      expect(emitted.minutes).toBe(0);
    });

    it("does not clamp when time is within bounds", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="12" minutes="0"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;

      const emitSpy = jest.spyOn(instance.timeChanged, "emit");

      instance.minTime = { hours: 10, minutes: 0 };
      instance.maxTime = { hours: 17, minutes: 0 };
      instance.internalHours = 12;
      instance.internalMinutes = 30;
      instance.emitTimeChange();

      const emitted = emitSpy.mock.calls[0][0] as TimeChangedDetail;
      expect(emitted.hours).toBe(12);
      expect(emitted.minutes).toBe(30);
    });

    it("disables hour increment button at maxTime hour", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="17" minutes="0"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.maxTime = { hours: 17, minutes: 0 };
      await page.waitForChanges();

      const incrementBtn = page.root?.querySelector(
        '[aria-label="Increment hours"]'
      ) as HTMLButtonElement;
      expect(incrementBtn.getAttribute("disabled")).not.toBeNull();
    });

    it("disables hour decrement button at minTime hour", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.minTime = { hours: 10, minutes: 0 };
      await page.waitForChanges();

      const decrementBtn = page.root?.querySelector(
        '[aria-label="Decrement hours"]'
      ) as HTMLButtonElement;
      expect(decrementBtn.getAttribute("disabled")).not.toBeNull();
    });

    it("disables minute increment at maxTime boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="17" minutes="30"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.maxTime = { hours: 17, minutes: 30 };
      await page.waitForChanges();

      const incrementBtn = page.root?.querySelectorAll(
        '[aria-label="Increment minutes"]'
      )[0] as HTMLButtonElement;
      expect(incrementBtn.getAttribute("disabled")).not.toBeNull();
    });

    it("disables minute decrement at minTime boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="10" minutes="15"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.minTime = { hours: 10, minutes: 15 };
      await page.waitForChanges();

      const decrementBtn = page.root?.querySelectorAll(
        '[aria-label="Decrement minutes"]'
      )[0] as HTMLButtonElement;
      expect(decrementBtn.getAttribute("disabled")).not.toBeNull();
    });

    it("does not disable minute buttons when hour is not at boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="12" minutes="30"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.minTime = { hours: 10, minutes: 15 };
      instance.maxTime = { hours: 17, minutes: 45 };
      await page.waitForChanges();

      const incrementBtn = page.root?.querySelectorAll(
        '[aria-label="Increment minutes"]'
      )[0] as HTMLButtonElement;
      const decrementBtn = page.root?.querySelectorAll(
        '[aria-label="Decrement minutes"]'
      )[0] as HTMLButtonElement;
      expect(incrementBtn.getAttribute("disabled")).toBeNull();
      expect(decrementBtn.getAttribute("disabled")).toBeNull();
    });

    it("clamps seconds at minTime boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="10" minutes="30" seconds="20" show-seconds="true"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;

      const emitSpy = jest.spyOn(instance.timeChanged, "emit");

      instance.minTime = { hours: 10, minutes: 30, seconds: 30 };
      instance.internalHours = 10;
      instance.internalMinutes = 30;
      instance.internalSeconds = 20;
      instance.emitTimeChange();

      const emitted = emitSpy.mock.calls[0][0] as TimeChangedDetail;
      expect(emitted.seconds).toBe(30);
    });

    it("clamps to maxTime when seconds exceed boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="17" minutes="45" seconds="50" show-seconds="true"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;

      const emitSpy = jest.spyOn(instance.timeChanged, "emit");

      instance.maxTime = { hours: 17, minutes: 45, seconds: 30 };
      instance.internalHours = 17;
      instance.internalMinutes = 45;
      instance.internalSeconds = 50;
      instance.emitTimeChange();

      const emitted = emitSpy.mock.calls[0][0] as TimeChangedDetail;
      expect(emitted.seconds).toBe(30);
    });

    it("disables second decrement button at minTime seconds boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="10" minutes="30" seconds="30" show-seconds="true"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.minTime = { hours: 10, minutes: 30, seconds: 30 };
      await page.waitForChanges();

      const decrementBtn = page.root?.querySelector(
        '[aria-label="Decrement seconds"]'
      ) as HTMLButtonElement;
      expect(decrementBtn.getAttribute("disabled")).not.toBeNull();
    });

    it("disables second increment button at maxTime seconds boundary", async () => {
      const page = await createPage(
        '<tabworthy-times-picker hours="17" minutes="45" seconds="30" show-seconds="true"></tabworthy-times-picker>'
      );
      const instance = page.rootInstance as any;
      instance.maxTime = { hours: 17, minutes: 45, seconds: 30 };
      await page.waitForChanges();

      const incrementBtn = page.root?.querySelector(
        '[aria-label="Increment seconds"]'
      ) as HTMLButtonElement;
      expect(incrementBtn.getAttribute("disabled")).not.toBeNull();
    });
  });

  it("handlePeriodChange is a no-op when not in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>'
    );
    const instance = page.rootInstance as any;
    const emitSpy = jest.spyOn(instance.timeChanged, "emit");

    instance.handlePeriodChange("PM");
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("toggles from 12 AM to 12 PM via period change", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="0" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const pmButton = page.root?.querySelector(
      '[aria-label="PM"]'
    ) as HTMLButtonElement;
    pmButton.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 12,
      minutes: 0,
      period: "PM"
    });
  });

  it("toggles from 12 PM to 12 AM via period change", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="12" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const amButton = page.root?.querySelector(
      '[aria-label="AM"]'
    ) as HTMLButtonElement;
    amButton.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 0,
      period: "AM"
    });
  });

  it("decrements PM hours from 1 PM to 12 PM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="13" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrement.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 12,
      minutes: 0,
      period: "PM"
    });
  });

  it("increments PM hours from 11 PM to 12 PM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="23" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    increment.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 12,
      minutes: 0,
      period: "PM"
    });
  });

  it("decrements AM hours from 1 AM to 12 AM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="1" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrement.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 0,
      period: "AM"
    });
  });

  it("handles hour input of 12 in PM mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="13" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;

    hourInput.value = "12";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 12,
      minutes: 0,
      period: "PM"
    });
  });

  it("initializes period to AM when hours < 12", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="8" minutes="0"></tabworthy-times-picker>'
    );
    expect(page.rootInstance.period).toBe("AM");
  });

  it("ignores NaN input for hours", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>'
    );
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    hourInput.value = "abc";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores NaN input for seconds", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="10" minutes="0" seconds="0" show-seconds="true"></tabworthy-times-picker>'
    );
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const secondsInput = page.root?.querySelector(
      "#tabworthy-times-picker-seconds"
    ) as HTMLInputElement;
    secondsInput.value = "xyz";
    secondsInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler).not.toHaveBeenCalled();
  });

  it("decrements PM hours from 3 PM to 2 PM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="15" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrement.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 14,
      minutes: 0,
      period: "PM"
    });
  });

  it("increments AM hours from 11 AM to 12 AM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="11" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    increment.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 0,
      minutes: 0,
      period: "AM"
    });
  });

  it("ignores NaN input for minutes", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>'
    );
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const minuteInput = page.root?.querySelector(
      "#tabworthy-times-picker-minutes"
    ) as HTMLInputElement;
    minuteInput.value = "abc";
    minuteInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler).not.toHaveBeenCalled();
  });

  it("handles non-12 hour input in AM mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="10" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    hourInput.value = "5";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 5,
      minutes: 0,
      period: "AM"
    });
  });

  it("handles non-12 hour input in PM mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="13" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const hourInput = page.root?.querySelector(
      "#tabworthy-times-picker-hours"
    ) as HTMLInputElement;
    hourInput.value = "5";
    hourInput.dispatchEvent(new Event("input"));
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 17,
      minutes: 0,
      period: "PM"
    });
  });

  it("decrements AM hours from 5 AM to 4 AM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="5" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrement.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 4,
      minutes: 0,
      period: "AM"
    });
  });

  it("increments AM hours from 5 AM to 6 AM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="5" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    increment.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 6,
      minutes: 0,
      period: "AM"
    });
  });

  it("increments PM hours from 12 PM to 1 PM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="12" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const increment = page.root?.querySelector(
      '[aria-label="Increment hours"]'
    ) as HTMLButtonElement;
    increment.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 13,
      minutes: 0,
      period: "PM"
    });
  });

  it("decrements PM hours from 12 PM to 11 AM in 12-hour mode", async () => {
    const page = await createPage(
      '<tabworthy-times-picker hours="12" minutes="0"></tabworthy-times-picker>'
    );
    page.rootInstance.useTwelveHourFormat = true;
    await page.waitForChanges();
    const handler = jest.fn();
    page.root?.addEventListener("timeChanged", ((
      event: CustomEvent<TimeChangedDetail>
    ) => handler(event.detail)) as EventListener);

    const decrement = page.root?.querySelector(
      '[aria-label="Decrement hours"]'
    ) as HTMLButtonElement;
    decrement.click();
    await page.waitForChanges();

    expect(handler.mock.calls.at(-1)?.[0]).toEqual({
      hours: 23,
      minutes: 0,
      period: "PM"
    });
  });
});
