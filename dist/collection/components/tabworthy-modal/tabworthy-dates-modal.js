import { h, Host } from "@stencil/core";
import "@a11y/focus-trap";
import { hideOthers } from "aria-hidden";
import { createPopper } from "@popperjs/core";
/**
 * @slot slot - The dialog content
 */
export class TabworthyDatesModal {
    constructor() {
        this.inline = false;
        /** Preferred placement of the dropdown (Popper.js placement) */
        this.placement = "bottom-start";
        /** Offset from the trigger element [skidding, distance] */
        this.offset = [0, 8];
        this.closing = false;
        this.showing = this.inline || false;
        this.positioned = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.isMovingPortal = false;
        this.popperInstance = null;
        this.onKeyDown = (event) => {
            if (event.code === "Escape") {
                this.close();
            }
        };
    }
    watchShowing(newValue) {
        if (newValue) {
            // Reset positioned state - portal setup happens in render ref callback
            this.positioned = false;
        }
        else {
            this.destroyPopperInstance();
            this.cleanupPortal();
            this.positioned = false;
        }
    }
    getAppendToElement() {
        if (!this.appendTo)
            return null;
        if (this.appendTo === "body") {
            return document.body;
        }
        if (typeof this.appendTo === "string") {
            return document.querySelector(this.appendTo);
        }
        return this.appendTo;
    }
    setupPortal() {
        const appendToEl = this.getAppendToElement();
        if (!appendToEl)
            return;
        // Store original position so we can restore later
        this.originalParent = this.hostElement.parentElement;
        this.originalNextSibling = this.hostElement.nextSibling;
        // Guard against triggering disconnectedCallback during move
        this.isMovingPortal = true;
        appendToEl.appendChild(this.hostElement);
        this.isMovingPortal = false;
    }
    cleanupPortal() {
        // Guard against recursion - moving element triggers disconnectedCallback
        if (this.isMovingPortal)
            return;
        // Move host back to original position
        if (this.originalParent) {
            this.isMovingPortal = true;
            if (this.originalNextSibling) {
                this.originalParent.insertBefore(this.hostElement, this.originalNextSibling);
            }
            else {
                this.originalParent.appendChild(this.hostElement);
            }
            this.originalParent = null;
            this.originalNextSibling = null;
            this.isMovingPortal = false;
        }
    }
    createPopperInstance() {
        if (!this.triggerElement || !this.bodyRef)
            return;
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
    destroyPopperInstance() {
        if (this.popperInstance) {
            this.popperInstance.destroy();
            this.popperInstance = null;
        }
    }
    /**
     * Open the dialog.
     */
    async open() {
        if (this.inline)
            return;
        this.showing = true;
        this.undo = hideOthers(this.el);
        this.opened.emit(undefined);
    }
    /**
     * Close the dialog.
     */
    async close() {
        var _a;
        if (this.inline)
            return;
        this.showing = false;
        this.closed.emit(undefined);
        (_a = this.undo) === null || _a === void 0 ? void 0 : _a.call(this);
        if (this.triggerElement)
            this.triggerElement.focus();
    }
    disconnectedCallback() {
        // Skip cleanup if we're in the middle of portal operations
        if (this.isMovingPortal)
            return;
        this.destroyPopperInstance();
        this.cleanupPortal();
    }
    async getState() {
        return this.showing;
    }
    async setTriggerElement(element) {
        this.triggerElement = element;
    }
    /** Force update the popper position */
    async updatePosition() {
        var _a;
        await ((_a = this.popperInstance) === null || _a === void 0 ? void 0 : _a.update());
    }
    handleClick(event) {
        var _a;
        if (this.showing) {
            const target = event.target;
            // Check if click is inside the host element, trigger element, or original parent (when portaled)
            const clickedInside = this.hostElement.contains(target) ||
                ((_a = this.triggerElement) === null || _a === void 0 ? void 0 : _a.contains(target)) ||
                // When portaled, also check the original parent to avoid closing on container clicks
                (this.originalParent && this.originalParent.contains(target));
            if (!clickedInside) {
                this.close();
            }
        }
    }
    render() {
        return (h(Host, { key: '488fb845bb3a168c45f715b5f7315a80e1857589', showing: this.showing, ref: (r) => r && (this.el = r) }, !this.inline && this.showing && (h("div", { key: 'd6263beffa3dbeaa7f0e5e65c1f2627c07164648', part: "body", ref: (r) => {
                if (r) {
                    this.bodyRef = r;
                    // Setup portal and create popper when ref is set
                    if (this.showing &&
                        this.triggerElement &&
                        !this.popperInstance) {
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
            }, style: { visibility: this.positioned ? "visible" : "hidden" }, onKeyDown: this.onKeyDown, role: "dialog", tabindex: -1, "aria-hidden": !this.showing, "aria-label": this.label, "aria-modal": this.showing }, h("focus-trap", { key: '7ffb9cc684198ab9f3b127a4abe5f60f3241cd49' }, h("div", { key: 'c6c7c14220c01969f3a5c92dda882685f4c43268', part: "content" }, h("slot", { key: 'a1e6ce7ed152f61b3970e20b40e36bb13ee7580a' }))))), this.inline && (h("div", { key: '632750cfce76139771642e03051f5c4a654db56a', part: "content" }, h("slot", { key: 'c1aa297a6ffdeee55840a9e05adddb7220e7f954' })))));
    }
    static get is() { return "tabworthy-dates-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["tabworthy-dates-modal.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["tabworthy-dates-modal.css"]
        };
    }
    static get properties() {
        return {
            "label": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "label"
            },
            "inline": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "inline",
                "defaultValue": "false"
            },
            "placement": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "Placement",
                    "resolved": "\"auto\" | \"auto-end\" | \"auto-start\" | \"bottom\" | \"bottom-end\" | \"bottom-start\" | \"left\" | \"left-end\" | \"left-start\" | \"right\" | \"right-end\" | \"right-start\" | \"top\" | \"top-end\" | \"top-start\"",
                    "references": {
                        "Placement": {
                            "location": "import",
                            "path": "@popperjs/core",
                            "id": "node_modules::Placement",
                            "referenceLocation": "Placement"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Preferred placement of the dropdown (Popper.js placement)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "placement",
                "defaultValue": "\"bottom-start\""
            },
            "offset": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "[number, number]",
                    "resolved": "[number, number]",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Offset from the trigger element [skidding, distance]"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[0, 8]"
            },
            "appendTo": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string | HTMLElement",
                    "resolved": "HTMLElement | string",
                    "references": {
                        "HTMLElement": {
                            "location": "global",
                            "id": "global::HTMLElement"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Element to append the dropdown to. Use \"body\" to append to document.body,\nor pass a CSS selector or HTMLElement. When set, the dropdown will be\nportaled to escape overflow:hidden containers."
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "append-to"
            }
        };
    }
    static get states() {
        return {
            "closing": {},
            "showing": {},
            "positioned": {}
        };
    }
    static get events() {
        return [{
                "method": "opened",
                "name": "opened",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                }
            }, {
                "method": "closed",
                "name": "closed",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                }
            }];
    }
    static get methods() {
        return {
            "open": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Open the dialog.",
                    "tags": []
                }
            },
            "close": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Close the dialog.",
                    "tags": []
                }
            },
            "getState": {
                "complexType": {
                    "signature": "() => Promise<boolean>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<boolean>"
                },
                "docs": {
                    "text": "",
                    "tags": []
                }
            },
            "setTriggerElement": {
                "complexType": {
                    "signature": "(element: HTMLElement) => Promise<void>",
                    "parameters": [{
                            "name": "element",
                            "type": "HTMLElement",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "HTMLElement": {
                            "location": "global",
                            "id": "global::HTMLElement"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "",
                    "tags": []
                }
            },
            "updatePosition": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Force update the popper position",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "hostElement"; }
    static get watchers() {
        return [{
                "propName": "showing",
                "methodName": "watchShowing"
            }];
    }
    static get listeners() {
        return [{
                "name": "click",
                "method": "handleClick",
                "target": "window",
                "capture": true,
                "passive": false
            }];
    }
}
