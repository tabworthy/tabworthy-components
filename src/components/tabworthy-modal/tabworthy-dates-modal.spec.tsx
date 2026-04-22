// Mock problematic dependencies that Jest can't parse
jest.mock("@a11y/focus-trap", () => ({}));
jest.mock("aria-hidden", () => ({
  hideOthers: jest.fn(() => jest.fn()) // hideOthers returns an undo function
}));

import { newSpecPage } from "@stencil/core/testing";
import { TabworthyDatesModal } from "./tabworthy-dates-modal";
import { hideOthers } from "aria-hidden";

const setAppendTo = (
  modal: TabworthyDatesModal,
  value: string | HTMLElement
) => {
  Object.defineProperty(modal, "appendTo", {
    configurable: true,
    value,
    writable: true
  });
};

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

  it("ignores non-escape keys and clicks inside the original parent", async () => {
    const page = await newSpecPage({
      components: [TabworthyDatesModal],
      html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
    });

    const closeSpy = jest.spyOn(page.rootInstance, "close");
    const originalParent = page.doc.createElement("div");
    const insideOriginalParent = page.doc.createElement("button");
    originalParent.appendChild(insideOriginalParent);
    (page.rootInstance as any).originalParent = originalParent;
    (page.rootInstance as any).showing = true;

    page.rootInstance.onKeyDown({ code: "Enter" } as KeyboardEvent);
    page.rootInstance.handleClick({
      target: insideOriginalParent
    } as MouseEvent);

    expect(closeSpy).not.toHaveBeenCalled();
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

  describe("getAppendToElement", () => {
    it("returns null when appendTo is not set", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const result = (page.rootInstance as any).getAppendToElement();
      expect(result).toBeNull();
    });

    it('returns document.body when appendTo is "body"', async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      setAppendTo(page.rootInstance, "body");
      const result = (page.rootInstance as any).getAppendToElement();
      expect(result).toBe(document.body);
    });

    it("returns element matching CSS selector", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const container = page.doc.createElement("div");
      container.id = "portal-target";
      page.doc.body.appendChild(container);

      setAppendTo(page.rootInstance, "#portal-target");
      const result = (page.rootInstance as any).getAppendToElement();
      expect(result).toBe(container);

      page.doc.body.removeChild(container);
    });

    it("returns HTMLElement directly when appendTo is an element", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const container = page.doc.createElement("div");
      setAppendTo(page.rootInstance, container);
      const result = (page.rootInstance as any).getAppendToElement();
      expect(result).toBe(container);
    });
  });

  describe("setupPortal", () => {
    it("moves host element to appendTo target", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const container = page.doc.createElement("div");
      page.doc.body.appendChild(container);

      setAppendTo(page.rootInstance, container);
      const host = page.root as HTMLElement;
      const originalParent = host.parentElement;

      (page.rootInstance as any).setupPortal();

      expect(container.contains(host)).toBe(true);
      expect((page.rootInstance as any).originalParent).toBe(originalParent);

      // Cleanup
      (page.rootInstance as any).cleanupPortal();
      page.doc.body.removeChild(container);
    });

    it("stores original next sibling", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const wrapper = page.doc.createElement("div");
      const sibling = page.doc.createElement("span");
      page.doc.body.appendChild(wrapper);

      const host = page.root as HTMLElement;
      wrapper.appendChild(host);
      wrapper.appendChild(sibling);

      const container = page.doc.createElement("div");
      page.doc.body.appendChild(container);

      setAppendTo(page.rootInstance, container);
      (page.rootInstance as any).setupPortal();

      expect((page.rootInstance as any).originalNextSibling).toBe(sibling);

      // Cleanup
      (page.rootInstance as any).cleanupPortal();
      page.doc.body.removeChild(container);
      page.doc.body.removeChild(wrapper);
    });

    it("does nothing when appendTo is not set", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const host = page.root as HTMLElement;
      const originalParent = host.parentElement;

      (page.rootInstance as any).setupPortal();

      expect(host.parentElement).toBe(originalParent);
      expect((page.rootInstance as any).originalParent).toBeNull();
    });

    it("restores the host with appendChild when no original next sibling exists", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const host = page.root as HTMLElement;
      const container = page.doc.createElement("div");
      page.doc.body.appendChild(container);
      container.appendChild(host);

      const appendSpy = jest.spyOn(page.doc.body, "appendChild");
      (page.rootInstance as any).originalParent = page.doc.body;
      (page.rootInstance as any).originalNextSibling = null;

      (page.rootInstance as any).cleanupPortal();

      expect(appendSpy).toHaveBeenCalledWith(host);
      expect(host.parentElement).toBe(page.doc.body);
      page.doc.body.removeChild(container);
    });
  });

  describe("createPopperInstance", () => {
    it("creates a popper instance and sets positioned when trigger and body exist", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const trigger = document.createElement("button");
      await page.rootInstance.setTriggerElement(trigger);
      (page.rootInstance as any).bodyRef = document.createElement("div");

      (page.rootInstance as any).createPopperInstance();

      expect((page.rootInstance as any).popperInstance).toBeTruthy();
      expect(page.rootInstance.positioned).toBe(true);
    });

    it("uses fixed strategy when appendTo is set", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const trigger = document.createElement("button");
      await page.rootInstance.setTriggerElement(trigger);
      (page.rootInstance as any).bodyRef = document.createElement("div");
      setAppendTo(page.rootInstance, "body");

      (page.rootInstance as any).createPopperInstance();

      expect((page.rootInstance as any).popperInstance).toBeTruthy();
      expect(page.rootInstance.positioned).toBe(true);
    });

    it("does not create popper when triggerElement is missing", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      (page.rootInstance as any).bodyRef = document.createElement("div");
      (page.rootInstance as any).createPopperInstance();

      expect((page.rootInstance as any).popperInstance).toBeNull();
    });

    it("does not create popper when bodyRef is missing", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const trigger = document.createElement("button");
      await page.rootInstance.setTriggerElement(trigger);
      (page.rootInstance as any).createPopperInstance();

      expect((page.rootInstance as any).popperInstance).toBeNull();
    });
  });

  describe("destroyPopperInstance", () => {
    it("destroys an existing popper instance and sets to null", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const mockDestroy = jest.fn();
      (page.rootInstance as any).popperInstance = {
        destroy: mockDestroy,
        forceUpdate: jest.fn(),
        update: jest.fn()
      };

      (page.rootInstance as any).destroyPopperInstance();

      expect(mockDestroy).toHaveBeenCalled();
      expect((page.rootInstance as any).popperInstance).toBeNull();
    });

    it("does nothing when no popper instance exists", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      // popperInstance is null by default
      (page.rootInstance as any).destroyPopperInstance();

      expect((page.rootInstance as any).popperInstance).toBeNull();
    });
  });

  describe("updatePosition", () => {
    it("calls popper update when instance exists", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      (page.rootInstance as any).popperInstance = {
        destroy: jest.fn(),
        forceUpdate: jest.fn(),
        update: mockUpdate
      };

      await page.rootInstance.updatePosition();

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("cleanupPortal restores element before originalNextSibling", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const instance = page.rootInstance as any;
      const parent = document.createElement("div");
      const sibling = document.createElement("span");
      parent.appendChild(sibling);
      const insertSpy = jest.spyOn(parent, "insertBefore");

      instance.originalParent = parent;
      instance.originalNextSibling = sibling;
      instance.cleanupPortal();

      expect(insertSpy).toHaveBeenCalledWith(instance.hostElement, sibling);
      expect(instance.originalParent).toBeNull();
      expect(instance.originalNextSibling).toBeNull();
    });

    it("handleClick closes modal when clicking outside all elements", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const instance = page.rootInstance as any;
      instance.showing = true;
      const closeSpy = jest
        .spyOn(instance, "close")
        .mockImplementation(() => Promise.resolve());

      const outsideEl = document.createElement("div");
      document.body.appendChild(outsideEl);

      instance.handleClick({ target: outsideEl } as any);
      expect(closeSpy).toHaveBeenCalled();

      document.body.removeChild(outsideEl);
    });

    it("handleClick does not close when clicking on trigger element", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const instance = page.rootInstance as any;
      instance.showing = true;
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      instance.triggerElement = trigger;

      const closeSpy = jest
        .spyOn(instance, "close")
        .mockImplementation(() => Promise.resolve());

      instance.handleClick({ target: trigger } as any);
      expect(closeSpy).not.toHaveBeenCalled();

      document.body.removeChild(trigger);
    });

    it("handleClick does not close when clicking inside originalParent", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const instance = page.rootInstance as any;
      instance.showing = true;
      const parent = document.createElement("div");
      const child = document.createElement("span");
      parent.appendChild(child);
      document.body.appendChild(parent);
      instance.originalParent = parent;

      const closeSpy = jest
        .spyOn(instance, "close")
        .mockImplementation(() => Promise.resolve());

      instance.handleClick({ target: child } as any);
      expect(closeSpy).not.toHaveBeenCalled();

      document.body.removeChild(parent);
    });

    it("skips disconnected cleanup while the portal is moving", async () => {
      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const destroySpy = jest.spyOn(
        page.rootInstance as any,
        "destroyPopperInstance"
      );
      const cleanupSpy = jest.spyOn(page.rootInstance as any, "cleanupPortal");
      (page.rootInstance as any).isMovingPortal = true;

      page.rootInstance.disconnectedCallback();

      expect(destroySpy).not.toHaveBeenCalled();
      expect(cleanupSpy).not.toHaveBeenCalled();
    });

    it("sets up the portal and schedules popper creation when the dialog body renders", async () => {
      const originalRaf = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn(
        (callback: FrameRequestCallback) => {
          callback(0);
          return 1;
        }
      ) as typeof requestAnimationFrame;

      const page = await newSpecPage({
        components: [TabworthyDatesModal],
        html: `<tabworthy-dates-modal label="Test modal"></tabworthy-dates-modal>`
      });

      const instance = page.rootInstance as any;
      const setupSpy = jest.spyOn(instance, "setupPortal");
      const createSpy = jest
        .spyOn(instance, "createPopperInstance")
        .mockImplementation(() => undefined);

      try {
        await page.rootInstance.setTriggerElement(
          document.createElement("button")
        );
        await page.rootInstance.open();
        await page.waitForChanges();

        expect(setupSpy).toHaveBeenCalled();
        expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
        expect(createSpy).toHaveBeenCalled();
      } finally {
        global.requestAnimationFrame = originalRaf;
      }
    });
  });
});
