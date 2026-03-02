import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import "@a11y/focus-trap";
import { hideOthers } from "aria-hidden";
import {
  createPopper,
  Instance as PopperInstance,
  Placement
} from "@popperjs/core";

/**
 * @slot slot - The dialog content
 */
@Component({
  shadow: true,
  styleUrl: "tabworthy-dates-modal.css",
  tag: "tabworthy-dates-modal"
})
export class TabworthyDatesModal {
  // Mandatory for accessibility
  @Prop() label!: string;
  @Prop() inline?: boolean = false;
  /** Preferred placement of the dropdown (Popper.js placement) */
  @Prop() placement: Placement = "bottom-start";
  /** Offset from the trigger element [skidding, distance] */
  @Prop() offset: [number, number] = [0, 8];
  /**
   * Element to append the dropdown to. Use "body" to append to document.body,
   * or pass a CSS selector or HTMLElement. When set, the dropdown will be
   * portaled to escape overflow:hidden containers.
   */
  @Prop() appendTo?: string | HTMLElement;

  @State() closing = false;
  @State() showing = this.inline || false;
  @State() positioned = false;

  @Event() opened!: EventEmitter;
  @Event() closed!: EventEmitter;

  @Element() hostElement!: HTMLElement;

  private triggerElement!: HTMLElement;
  private el!: HTMLElement;
  private bodyRef!: HTMLDivElement;
  private originalParent: HTMLElement | null = null;
  private originalNextSibling: Node | null = null;
  private isMovingPortal = false;
  private undo!: () => void;
  private popperInstance: PopperInstance | null = null;

  @Watch("showing")
  watchShowing(newValue: boolean) {
    if (newValue) {
      // Reset positioned state - portal setup happens in render ref callback
      this.positioned = false;
    } else {
      this.destroyPopperInstance();
      this.cleanupPortal();
      this.positioned = false;
    }
  }

  private getAppendToElement(): HTMLElement | null {
    if (!this.appendTo) return null;

    if (this.appendTo === "body") {
      return document.body;
    }

    if (typeof this.appendTo === "string") {
      return document.querySelector(this.appendTo);
    }

    return this.appendTo;
  }

  private setupPortal() {
    const appendToEl = this.getAppendToElement();
    if (!appendToEl) return;

    // Store original position so we can restore later
    this.originalParent = this.hostElement.parentElement;
    this.originalNextSibling = this.hostElement.nextSibling;

    // Guard against triggering disconnectedCallback during move
    this.isMovingPortal = true;
    appendToEl.appendChild(this.hostElement);
    this.isMovingPortal = false;
  }

  private cleanupPortal() {
    // Guard against recursion - moving element triggers disconnectedCallback
    if (this.isMovingPortal) return;

    // Move host back to original position
    if (this.originalParent) {
      this.isMovingPortal = true;
      if (this.originalNextSibling) {
        this.originalParent.insertBefore(
          this.hostElement,
          this.originalNextSibling
        );
      } else {
        this.originalParent.appendChild(this.hostElement);
      }
      this.originalParent = null;
      this.originalNextSibling = null;
      this.isMovingPortal = false;
    }
  }

  private createPopperInstance() {
    if (!this.triggerElement || !this.bodyRef) return;

    // Use fixed strategy when portaling to escape scroll containers
    const useFixed = !!this.appendTo;
    // When portaled, use viewport boundary; otherwise use clipping parents
    const boundary = useFixed ? "viewport" : "clippingParents";

    this.popperInstance = createPopper(this.triggerElement, this.bodyRef, {
      placement: this.placement,
      strategy: useFixed ? "fixed" : "absolute",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: this.offset
          }
        },
        {
          name: "flip",
          options: {
            fallbackPlacements: ["top-start", "top-end", "bottom-end"],
            boundary
          }
        },
        {
          name: "preventOverflow",
          options: {
            boundary,
            altAxis: true,
            padding: 8
          }
        },
        {
          name: "computeStyles",
          options: {
            // Use GPU acceleration for smooth animations
            gpuAcceleration: true
          }
        },
        {
          // Custom modifier to ensure initial position is applied immediately
          name: "applyStyles",
          enabled: true
        }
      ]
    });

    // Force immediate position update
    this.popperInstance.forceUpdate();
    // Mark as positioned to show the element
    this.positioned = true;
  }

  private destroyPopperInstance() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = null;
    }
  }

  /**
   * Open the dialog.
   */
  @Method()
  async open() {
    if (this.inline) return;
    this.showing = true;
    this.undo = hideOthers(this.el);
    this.opened.emit(undefined);
  }

  /**
   * Close the dialog.
   */
  @Method()
  async close() {
    if (this.inline) return;
    this.showing = false;
    this.closed.emit(undefined);
    this.undo?.();
    if (this.triggerElement) this.triggerElement.focus();
  }

  disconnectedCallback() {
    // Skip cleanup if we're in the middle of portal operations
    if (this.isMovingPortal) return;
    this.destroyPopperInstance();
    this.cleanupPortal();
  }

  @Method()
  async getState() {
    return this.showing;
  }

  @Method()
  async setTriggerElement(element: HTMLElement) {
    this.triggerElement = element;
  }

  /** Force update the popper position */
  @Method()
  async updatePosition() {
    await this.popperInstance?.update();
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.close();
    }
  };

  @Listen("click", { capture: true, target: "window" })
  handleClick(event: MouseEvent) {
    if (this.showing) {
      const target = event.target as Node;
      // Check if click is inside the host element, trigger element, or original parent (when portaled)
      const clickedInside =
        this.hostElement.contains(target) ||
        this.triggerElement?.contains(target) ||
        // When portaled, also check the original parent to avoid closing on container clicks
        (this.originalParent && this.originalParent.contains(target));
      if (!clickedInside) {
        this.close();
      }
    }
  }

  render() {
    return (
      <Host showing={this.showing} ref={(r) => r && (this.el = r)}>
        {!this.inline && this.showing && (
          <div
            part="body"
            ref={(r) => {
              if (r) {
                this.bodyRef = r;
                // Setup portal and create popper when ref is set
                if (
                  this.showing &&
                  this.triggerElement &&
                  !this.popperInstance
                ) {
                  // Setup portal first (move element to body), then create popper
                  this.setupPortal();
                  // Use double RAF to ensure DOM is fully settled after portal move
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      this.createPopperInstance();
                    });
                  });
                }
              }
            }}
            style={{ visibility: this.positioned ? "visible" : "hidden" }}
            onKeyDown={this.onKeyDown}
            role="dialog"
            tabindex={-1}
            aria-hidden={!this.showing}
            aria-label={this.label}
            aria-modal={this.showing}
          >
            <focus-trap>
              <div part="content">
                <slot />
              </div>
            </focus-trap>
          </div>
        )}
        {this.inline && (
          <div part="content">
            <slot />
          </div>
        )}
      </Host>
    );
  }
}
