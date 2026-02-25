import {
  Component,
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
export class InclusiveDatesModal {
  // Mandatory for accessibility
  @Prop() label!: string;
  @Prop() inline?: boolean = false;
  /** Preferred placement of the dropdown (Popper.js placement) */
  @Prop() placement: Placement = "bottom-start";
  /** Offset from the trigger element [skidding, distance] */
  @Prop() offset: [number, number] = [0, 8];

  @State() closing = false;
  @State() showing = this.inline || false;
  @State() positioned = false;

  @Event() opened!: EventEmitter;
  @Event() closed!: EventEmitter;

  private triggerElement!: HTMLElement;
  private el!: HTMLElement;
  private bodyRef!: HTMLDivElement;
  private undo!: () => void;
  private popperInstance: PopperInstance | null = null;

  @Watch("showing")
  watchShowing(newValue: boolean) {
    if (newValue) {
      // Reset positioned state
      this.positioned = false;
      // Defer popper creation to next frame to ensure DOM is ready
      requestAnimationFrame(() => {
        this.createPopperInstance();
      });
    } else {
      this.destroyPopperInstance();
      this.positioned = false;
    }
  }

  private createPopperInstance() {
    if (!this.triggerElement || !this.bodyRef) return;

    this.popperInstance = createPopper(this.triggerElement, this.bodyRef, {
      placement: this.placement,
      strategy: "absolute",
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
            boundary: "clippingParents"
          }
        },
        {
          name: "preventOverflow",
          options: {
            boundary: "clippingParents",
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
    this.destroyPopperInstance();
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
    if (this.showing && !this.el.contains(event.target as Node)) {
      this.close();
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
                // Create popper when ref is set
                if (
                  this.showing &&
                  this.triggerElement &&
                  !this.popperInstance
                ) {
                  requestAnimationFrame(() => {
                    this.createPopperInstance();
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
