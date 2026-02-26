import { h, Host } from "@stencil/core";
const defaultLabels = {
    hours: "Hours",
    minutes: "Minutes",
    am: "AM",
    pm: "PM",
    timePicker: "Time picker",
    incrementHours: "Increment hours",
    decrementHours: "Decrement hours",
    incrementMinutes: "Increment minutes",
    decrementMinutes: "Decrement minutes"
};
export class TabworthyTimesPicker {
    constructor() {
        // Current time value (24-hour format)
        this.hours = 12;
        this.minutes = 0;
        this.useTwelveHourFormat = false;
        // Labels for accessibility and i18n
        this.labels = defaultLabels;
        // Hide labels visually but keep them for screen readers
        this.labelsSrOnly = true;
        this.disabled = false;
        this.elementClassName = "tabworthy-times-picker";
        this.internalHours = this.hours;
        this.internalMinutes = this.minutes;
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
    }
    watchHours(newValue) {
        this.internalHours = newValue;
        this.period = newValue >= 12 ? "PM" : "AM";
    }
    watchMinutes(newValue) {
        this.internalMinutes = newValue;
    }
    componentWillLoad() {
        this.internalHours = this.hours;
        this.internalMinutes = this.minutes;
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
        return (h(Host, { key: '5c9fbbe95d08e086bf78761da0375526f5042d15', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: 'f914ccebcf2025226762b1446944be41b555b5ea', class: `${this.elementClassName}__container` }, h("div", { key: 'a17ed2def130bbe92a17dd733f1b516d68ae98f3', class: `${this.elementClassName}__field` }, h("label", { key: '513ca90795cca3c209df22def8fae8dd377d74ef', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: '3f7448b3161d594e3d601700e1a703a3f2857ffe', class: `${this.elementClassName}__control` }, h("button", { key: '19f8cf8fdfc931e0baa10b98864589990d628b7f', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled, "aria-label": this.labels.incrementHours }, h("svg", { key: 'fb12854d35131adad4250bf24e25936ad583f74f', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '8176d2b9d15e81ef7c700064cadd2b83b8572593', points: "18 15 12 9 6 15" }))), h("input", { key: '66986ad937685f83bf1bc999c4aabf5f2ed9d3d9', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: 'd225e66235e04132bf461bb6e73377a823db1b9f', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled, "aria-label": this.labels.decrementHours }, h("svg", { key: '387c4d7ddb7097da7032345db6c09db5e0ea0d0b', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '4c307b1ecb096d3c4d42ed7c79b0c8cde004842a', points: "6 9 12 15 18 9" }))))), h("div", { key: '9c8101ae559b74d985286688e3147aacc80ab448', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: '8a49a068478e1fda98634e1d74bb399b5ae1a5f4', class: `${this.elementClassName}__field` }, h("label", { key: '3c585236e76192d10f013aff1a765f9b31e9bce6', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: '8d567d355ae2f34c51c057c81ea0921a8de6f012', class: `${this.elementClassName}__control` }, h("button", { key: 'a061d7d4b66b787d4478d54bc36525e5d9bf7e61', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled, "aria-label": this.labels.incrementMinutes }, h("svg", { key: '148244241427e2bca0f6fc7147f9ca5a329c4480', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'd10fa3e7a7815b8806d583041aeae70b4de0e267', points: "18 15 12 9 6 15" }))), h("input", { key: 'db14c0a90805afede369a9e0878191537e9eef9f', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: '1820f55ac22cd78494a40fa7b5f2e1c1ea191a18', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled, "aria-label": this.labels.decrementMinutes }, h("svg", { key: '9135d7673f58babaf44b0c33ad1755b3097aea01', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'f36192868f379fc2abe3b2deade678eeab725ee1', points: "6 9 12 15 18 9" }))))), this.useTwelveHourFormat && (h("div", { key: '6bf685eaed72c157b8c01c40e8b84bace096d417', class: `${this.elementClassName}__period` }, h("button", { key: '107a2a21de03626e15b35cd850f5ee8a2eb09f8e', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: '62ad24e781b8da40699e4f91acbc20eeef1c2f65', type: "button", class: {
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
            "labels": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TimesPickerLabels",
                    "resolved": "TimesPickerLabels",
                    "references": {
                        "TimesPickerLabels": {
                            "location": "local",
                            "path": "/Users/damirbogdanov_1/work/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
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
                            "path": "/Users/damirbogdanov_1/work/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
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
            }];
    }
}
