import { h, Host } from "@stencil/core";
const defaultLabels = {
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    am: "AM",
    pm: "PM",
    timePicker: "Time picker",
    incrementHours: "Increment hours",
    decrementHours: "Decrement hours",
    incrementMinutes: "Increment minutes",
    decrementMinutes: "Decrement minutes",
    incrementSeconds: "Increment seconds",
    decrementSeconds: "Decrement seconds"
};
export class TabworthyTimesPicker {
    constructor() {
        // Current time value (24-hour format)
        this.hours = 12;
        this.minutes = 0;
        this.seconds = 0;
        this.useTwelveHourFormat = false;
        this.showSeconds = false;
        // Labels for accessibility and i18n
        this.labels = defaultLabels;
        // Hide labels visually but keep them for screen readers
        this.labelsSrOnly = true;
        this.disabled = false;
        this.elementClassName = "tabworthy-times-picker";
        this.internalHours = this.hours;
        this.internalMinutes = this.minutes;
        this.internalSeconds = this.seconds;
        this.period = this.hours >= 12 ? "PM" : "AM";
        this.handleHourChange = (e) => {
            const value = parseInt(e.target.value, 10);
            if (this.useTwelveHourFormat) {
                // Convert to 24-hour format based on period
                if (this.period === "AM") {
                    this.internalHours = value === 12 ? 0 : value;
                }
                else {
                    this.internalHours = value === 12 ? 12 : value + 12;
                }
            }
            else {
                this.internalHours = value;
            }
            this.emitTimeChange();
        };
        this.handleMinuteChange = (e) => {
            this.internalMinutes = parseInt(e.target.value, 10);
            this.emitTimeChange();
        };
        this.handlePeriodChange = (period) => {
            if (this.period === period || !this.useTwelveHourFormat)
                return;
            this.period = period;
            // Convert hours based on new period
            const displayHours = this.getDisplayHours();
            if (period === "AM") {
                this.internalHours = displayHours === 12 ? 0 : displayHours;
            }
            else {
                this.internalHours = displayHours === 12 ? 12 : displayHours + 12;
            }
            this.emitTimeChange();
        };
        this.handleHourIncrement = () => {
            if (this.useTwelveHourFormat) {
                const displayHours = this.getDisplayHours();
                const newDisplayHours = displayHours === 12 ? 1 : displayHours + 1;
                if (this.period === "AM") {
                    this.internalHours = newDisplayHours === 12 ? 0 : newDisplayHours;
                }
                else {
                    this.internalHours = newDisplayHours === 12 ? 12 : newDisplayHours + 12;
                }
            }
            else {
                this.internalHours = (this.internalHours + 1) % 24;
            }
            this.emitTimeChange();
        };
        this.handleHourDecrement = () => {
            if (this.useTwelveHourFormat) {
                const displayHours = this.getDisplayHours();
                const newDisplayHours = displayHours === 1 ? 12 : displayHours - 1;
                if (this.period === "AM") {
                    this.internalHours = newDisplayHours === 12 ? 0 : newDisplayHours;
                }
                else {
                    this.internalHours = newDisplayHours === 12 ? 12 : newDisplayHours + 12;
                }
            }
            else {
                this.internalHours =
                    this.internalHours === 0 ? 23 : this.internalHours - 1;
            }
            this.emitTimeChange();
        };
        this.handleMinuteIncrement = () => {
            this.internalMinutes = (this.internalMinutes + 1) % 60;
            this.emitTimeChange();
        };
        this.handleMinuteDecrement = () => {
            this.internalMinutes =
                this.internalMinutes === 0 ? 59 : this.internalMinutes - 1;
            this.emitTimeChange();
        };
        this.handleSecondChange = (e) => {
            this.internalSeconds = parseInt(e.target.value, 10);
            this.emitTimeChange();
        };
        this.handleSecondIncrement = () => {
            this.internalSeconds = (this.internalSeconds + 1) % 60;
            this.emitTimeChange();
        };
        this.handleSecondDecrement = () => {
            this.internalSeconds =
                this.internalSeconds === 0 ? 59 : this.internalSeconds - 1;
            this.emitTimeChange();
        };
    }
    watchHours(newValue) {
        this.internalHours = newValue;
        this.period = newValue >= 12 ? "PM" : "AM";
    }
    watchMinutes(newValue) {
        this.internalMinutes = newValue;
    }
    watchSeconds(newValue) {
        this.internalSeconds = newValue;
    }
    componentWillLoad() {
        this.internalHours = this.hours;
        this.internalMinutes = this.minutes;
        this.internalSeconds = this.seconds;
        this.period = this.hours >= 12 ? "PM" : "AM";
    }
    getDisplayHours() {
        if (!this.useTwelveHourFormat) {
            return this.internalHours;
        }
        if (this.internalHours === 0)
            return 12;
        if (this.internalHours > 12)
            return this.internalHours - 12;
        return this.internalHours;
    }
    get24HourValue() {
        if (!this.useTwelveHourFormat) {
            return this.internalHours;
        }
        const displayHours = this.getDisplayHours();
        if (this.period === "AM") {
            return displayHours === 12 ? 0 : displayHours;
        }
        else {
            return displayHours === 12 ? 12 : displayHours + 12;
        }
    }
    emitTimeChange() {
        this.timeChanged.emit({
            hours: this.get24HourValue(),
            minutes: this.internalMinutes,
            seconds: this.showSeconds ? this.internalSeconds : undefined,
            period: this.useTwelveHourFormat ? this.period : undefined
        });
    }
    padZero(num) {
        return num.toString().padStart(2, "0");
    }
    render() {
        const displayHours = this.getDisplayHours();
        const maxHours = this.useTwelveHourFormat ? 12 : 23;
        const minHours = this.useTwelveHourFormat ? 1 : 0;
        return (h(Host, { key: '878156f105b2fb61aae67f866c1c436f038d1671', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: '7b6265d1de95da5423d0d7fcfc6da5e283b64650', class: `${this.elementClassName}__container` }, h("div", { key: '6e64ffa764916fb2bad7b88c30eed4ce3de141ed', class: `${this.elementClassName}__field` }, h("label", { key: '0b9f82f319299fc3f177ec131f3bcb2d911cae6c', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: '0b7c4a24255319fe373aacf275583a6ccf1415ea', class: `${this.elementClassName}__control` }, h("button", { key: '24aff5877ad7cb189a6a9118f45e912ee2f97bec', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled, "aria-label": this.labels.incrementHours }, h("svg", { key: '681c818b4e10bc442aca0795024153dda43e6e27', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '0f86f34c93f99536623d793429bae7109aa29996', points: "18 15 12 9 6 15" }))), h("input", { key: '26043b87943641bdab9322413a36e0019980ef87', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: 'd9617f2300e5457bd6480136d33905b35a2c2aba', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled, "aria-label": this.labels.decrementHours }, h("svg", { key: '468f599326f2a01c873e963ef30904e66dead729', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '0c54d3e34df989d2514dc95c3e660d94bda4819d', points: "6 9 12 15 18 9" }))))), h("div", { key: '0435c24eb991f0746f1388d440e175d20ba4230a', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: '1dfb26b32d394101e9a85845d7cb2588c7c2fc63', class: `${this.elementClassName}__field` }, h("label", { key: '06e3318c7cd7cd56bc9b1f2616520af38e22501e', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: '933a0911a02b79fbcd573e0f0ed942fe1f23b7e8', class: `${this.elementClassName}__control` }, h("button", { key: 'e3a124aab9297ae89ed8deafdc1f2e4066ede58b', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled, "aria-label": this.labels.incrementMinutes }, h("svg", { key: 'cb33d7fd82b3e9e0293a83c80d0f4c750e381e03', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'd4fe518f8a5872da32e7093c0e5e6e7f168f7bfe', points: "18 15 12 9 6 15" }))), h("input", { key: '74bb5772b8c12697148e68fbf203184e097bfe40', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: 'c93e42de64a96a379405942fd7bcd2e4c9430c77', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled, "aria-label": this.labels.decrementMinutes }, h("svg", { key: '0d9eb6746bf467c2275447ec8d6a63f8b17f63a4', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'beb0425b60d2277477c6ffb5b72ce89ccd7bed20', points: "6 9 12 15 18 9" }))))), this.showSeconds && [
            h("div", { key: 'b686b7c464e70764bb8dcbec246c72bee6fa51b6', class: `${this.elementClassName}__separator` }, ":"),
            h("div", { key: '9dadc9f5a410e40775bd5b28144ee62971448680', class: `${this.elementClassName}__field` }, h("label", { key: '233e50d7ddf4ea413ee652d20b917081485dbf93', htmlFor: `${this.elementClassName}-seconds`, class: {
                    [`${this.elementClassName}__label`]: true,
                    [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
                } }, this.labels.seconds), h("div", { key: 'df35e6750eeef49671e6a5f233e00a253459554d', class: `${this.elementClassName}__control` }, h("button", { key: '521ba9fa8eb10dbf5981c4bab9687479f7888ac9', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleSecondIncrement, disabled: this.disabled, "aria-label": this.labels.incrementSeconds }, h("svg", { key: '84d4ac4697aaf7c9042e301b629a254e4ceffc6a', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '2af46da2a6c4c994ae67c44edb0b4180a6125336', points: "18 15 12 9 6 15" }))), h("input", { key: 'bee75b6dd68f723482c295af51250a94df35ab30', id: `${this.elementClassName}-seconds`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalSeconds), min: 0, max: 59, onInput: this.handleSecondChange, disabled: this.disabled, "aria-label": this.labels.seconds }), h("button", { key: 'fe1288605003497b92e739f4cec01f160e5a161a', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleSecondDecrement, disabled: this.disabled, "aria-label": this.labels.decrementSeconds }, h("svg", { key: 'ca3a8aa73620bc12095f4c6c9bdfd2c33901a6ff', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '3b68faee709705c929791e9cc7f9e24738f035a1', points: "6 9 12 15 18 9" })))))
        ], this.useTwelveHourFormat && (h("div", { key: '13f65cc5b94a8c498fd233bc72cbd3c9977c7541', class: `${this.elementClassName}__period` }, h("button", { key: '3d854b9b5aee10039b38af52513f12cf68e4c657', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: 'de12f50f898625cbd5b6afb65e2f396441ab5cf0', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "PM"
            }, onClick: () => this.handlePeriodChange("PM"), disabled: this.disabled, "aria-label": this.labels.pm, "aria-pressed": this.period === "PM" }, this.labels.pm))))));
    }
    static get is() { return "tabworthy-times-picker"; }
    static get encapsulation() { return "scoped"; }
    static get properties() {
        return {
            "hours": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "hours",
                "defaultValue": "12"
            },
            "minutes": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "minutes",
                "defaultValue": "0"
            },
            "seconds": {
                "type": "number",
                "mutable": true,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "seconds",
                "defaultValue": "0"
            },
            "useTwelveHourFormat": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "use-twelve-hour-format",
                "defaultValue": "false"
            },
            "showSeconds": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-seconds",
                "defaultValue": "false"
            },
            "labels": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TimesPickerLabels",
                    "resolved": "TimesPickerLabels",
                    "references": {
                        "TimesPickerLabels": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
                            "id": "src/components/tabworthy-times-picker/tabworthy-times-picker.tsx::TimesPickerLabels"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "defaultValue": "defaultLabels"
            },
            "labelsSrOnly": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "labels-sr-only",
                "defaultValue": "true"
            },
            "disabled": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "elementClassName": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "element-class-name",
                "defaultValue": "\"tabworthy-times-picker\""
            }
        };
    }
    static get states() {
        return {
            "internalHours": {},
            "internalMinutes": {},
            "internalSeconds": {},
            "period": {}
        };
    }
    static get events() {
        return [{
                "method": "timeChanged",
                "name": "timeChanged",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "TimeValue",
                    "resolved": "TimeValue",
                    "references": {
                        "TimeValue": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
                            "id": "src/components/tabworthy-times-picker/tabworthy-times-picker.tsx::TimeValue"
                        }
                    }
                }
            }];
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "hours",
                "methodName": "watchHours"
            }, {
                "propName": "minutes",
                "methodName": "watchMinutes"
            }, {
                "propName": "seconds",
                "methodName": "watchSeconds"
            }];
    }
}
