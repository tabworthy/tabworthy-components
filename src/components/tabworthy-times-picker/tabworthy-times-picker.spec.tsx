import { newSpecPage } from "@stencil/core/testing";
import { InclusiveTimesPicker } from "./tabworthy-times-picker";

type TimeChangedDetail = {
  hours: number;
  minutes: number;
  period?: "AM" | "PM";
};

describe("tabworthy-times-picker", () => {
  const createPage = async (
    html = `<tabworthy-times-picker></tabworthy-times-picker>`
  ) => {
    return newSpecPage({
      components: [InclusiveTimesPicker],
      html
    });
  };

  it("renders with default props", async () => {
    const page = await createPage();

    expect(page.root).toBeTruthy();
    expect(page.rootInstance).toBeInstanceOf(InclusiveTimesPicker);
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
});
