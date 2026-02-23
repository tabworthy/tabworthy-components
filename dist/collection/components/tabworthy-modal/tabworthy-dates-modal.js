import { h, Host } from "@stencil/core";
import "@a11y/focus-trap";
import { hideOthers } from "aria-hidden";
/**
 * @slot slot - The dialog content
 */
export class InclusiveDatesModal {
    constructor() {
        this.inline = false;
        this.closing = false;
        this.showing = this.inline || false;
        this.onKeyDown = (event) => {
            if (event.code === "Escape") {
                this.close();
            }
        };
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
        if (this.inline)
            return;
        this.showing = false;
        this.closed.emit(undefined);
        this.undo();
        if (this.triggerElement)
            this.triggerElement.focus();
    }
    async getState() {
        return this.showing;
    }
    async setTriggerElement(element) {
        this.triggerElement = element;
    }
    handleClick(event) {
        if (this.showing && !this.el.contains(event.target)) {
            this.close();
        }
    }
    render() {
        return (h(Host, { key: 'e5e440df97f5b2f51f742892ca591aff3a3e51a9', showing: this.showing, ref: (r) => r && (this.el = r) }, !this.inline && this.showing && (h("div", { key: 'f3b5f92b0f3b8eb54f665a14fcaa1616d59b182b', part: "body", onKeyDown: this.onKeyDown, role: "dialog", tabindex: -1, "aria-hidden": !this.showing, "aria-label": this.label, "aria-modal": this.showing }, h("focus-trap", { key: 'f94c02a8db391d671adc08ac1742dc6fabca72d3' }, h("div", { key: '888259505b6a2416674523d6a6924272b676daad', part: "content" }, h("slot", { key: 'e4e141ecae238f68fdde53baca66f478ebb93f88' }))))), this.inline && (h("div", { key: 'f2e7fb2614274d5dc7d03f10a0ee760363438435', part: "content" }, h("slot", { key: 'f845ef9c46b146ac916c90bb2fcec1f357aee5ee' })))));
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
            }
        };
    }
    static get states() {
        return {
            "closing": {},
            "showing": {}
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
            }
        };
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
