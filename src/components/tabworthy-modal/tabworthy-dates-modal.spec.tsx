// Mock problematic dependencies that Jest can't parse
jest.mock("@a11y/focus-trap", () => ({}));
jest.mock("aria-hidden", () => ({
  hideOthers: jest.fn(() => jest.fn()) // hideOthers returns an undo function
}));

import { newSpecPage } from "@stencil/core/testing";
import { TabworthyDatesModal } from "./tabworthy-dates-modal";
import { hideOthers } from "aria-hidden";

/**
 * Component tests for TabworthyDatesModal
 */
describe("tabworthy-dates-modal", () => {
  it("should render with default props", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    expect(page.root).toBeTruthy();
    expect(page.rootInstance).toBeInstanceOf(TabworthyDatesModal);
  });

  it("should open when open method is called", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    await page.rootInstance.open();
    await page.waitForChanges();

    const state = await page.rootInstance.getState();
    expect(state).toBe(true);
  });

  it("should be closed by default", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    const state = await page.rootInstance.getState();
    expect(state).toBe(false);
  });

  it("should handle label prop", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Select Dates"></tabworthy-dates-modal>`
    });

    expect(page.rootInstance.label).toBe("Select Dates");
  });

  it("should toggle state with open and close methods", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    let state = await page.rootInstance.getState();
    expect(state).toBe(false);

    await page.rootInstance.open();
    await page.waitForChanges();
    state = await page.rootInstance.getState();
    expect(state).toBe(true);

    await page.rootInstance.close();
    await page.waitForChanges();
    state = await page.rootInstance.getState();
    expect(state).toBe(false);
  });

  it("should support inline mode", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal" inline></tabworthy-dates-modal>`
    });

    expect(page.rootInstance.inline).toBe(true);
    const state = await page.rootInstance.getState();
    expect(state).toBe(true); // inline mode should be showing by default

    await page.rootInstance.open();
    await page.rootInstance.close();
    expect(await page.rootInstance.getState()).toBe(true);
  });

  it("should set trigger element and focus it when closing", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    const trigger = document.createElement("button");
    trigger.focus = jest.fn();

    await page.rootInstance.setTriggerElement(trigger);
    await page.rootInstance.open();
    await page.rootInstance.close();

    expect(trigger.focus).toHaveBeenCalled();
  });

  it("closes on escape key and outside click", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"><div class="inside"></div></tabworthy-dates-modal>`
    });

    const closeSpy = jest.spyOn(page.rootInstance, "close");
    await page.rootInstance.open();

    page.rootInstance.onKeyDown({ code: "Escape" } as KeyboardEvent);
    expect(closeSpy).toHaveBeenCalledTimes(1);

    await page.rootInstance.open();
    page.rootInstance.handleClick({ target: document.body });
    expect(closeSpy).toHaveBeenCalledTimes(2);

    const inside = page.root?.querySelector(".inside") as HTMLElement;
    page.rootInstance.handleClick({ target: inside });
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("calls aria-hidden undo function after opening", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    const undo = jest.fn();
    (hideOthers as jest.Mock).mockReturnValue(undo);

    await page.rootInstance.open();
    await page.rootInstance.close();

    expect(hideOthers).toHaveBeenCalled();
    expect(undo).toHaveBeenCalled();
  });
});
