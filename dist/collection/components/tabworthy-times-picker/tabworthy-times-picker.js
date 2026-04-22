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
            if (isNaN(value))
                return;
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
            const value = parseInt(e.target.value, 10);
            if (isNaN(value))
                return;
            this.internalMinutes = value;
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
            const value = parseInt(e.target.value, 10);
            if (isNaN(value))
                return;
            this.internalSeconds = value;
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
        this.clampToBounds();
        this.timeChanged.emit({
            hours: this.get24HourValue(),
            minutes: this.internalMinutes,
            seconds: this.showSeconds ? this.internalSeconds : undefined,
            period: this.useTwelveHourFormat ? this.period : undefined
        });
    }
    clampToBounds() {
        var _a, _b;
        const h = this.get24HourValue();
        const m = this.internalMinutes;
        const s = this.internalSeconds;
        if (this.minTime) {
            const minS = (_a = this.minTime.seconds) !== null && _a !== void 0 ? _a : 0;
            if (h < this.minTime.hours ||
                (h === this.minTime.hours && m < this.minTime.minutes) ||
                (h === this.minTime.hours && m === this.minTime.minutes && s < minS)) {
                this.setInternal24Hours(this.minTime.hours);
                this.internalMinutes = this.minTime.minutes;
                this.internalSeconds = minS;
            }
        }
        if (this.maxTime) {
            const maxS = (_b = this.maxTime.seconds) !== null && _b !== void 0 ? _b : 59;
            const curH = this.get24HourValue();
            const curM = this.internalMinutes;
            const curS = this.internalSeconds;
            if (curH > this.maxTime.hours ||
                (curH === this.maxTime.hours && curM > this.maxTime.minutes) ||
                (curH === this.maxTime.hours &&
                    curM === this.maxTime.minutes &&
                    curS > maxS)) {
                this.setInternal24Hours(this.maxTime.hours);
                this.internalMinutes = this.maxTime.minutes;
                this.internalSeconds = maxS;
            }
        }
    }
    setInternal24Hours(h24) {
        this.internalHours = h24;
        this.period = h24 >= 12 ? "PM" : "AM";
    }
    isAtMinHour() {
        return !!this.minTime && this.get24HourValue() <= this.minTime.hours;
    }
    isAtMaxHour() {
        return !!this.maxTime && this.get24HourValue() >= this.maxTime.hours;
    }
    isAtMinMinute() {
        return (this.isAtMinHour() &&
            !!this.minTime &&
            this.internalMinutes <= this.minTime.minutes);
    }
    isAtMaxMinute() {
        return (this.isAtMaxHour() &&
            !!this.maxTime &&
            this.internalMinutes >= this.maxTime.minutes);
    }
    isAtMinSecond() {
        var _a;
        return (this.isAtMinMinute() &&
            !!this.minTime &&
            this.internalSeconds <= ((_a = this.minTime.seconds) !== null && _a !== void 0 ? _a : 0));
    }
    isAtMaxSecond() {
        var _a;
        return (this.isAtMaxMinute() &&
            !!this.maxTime &&
            this.internalSeconds >= ((_a = this.maxTime.seconds) !== null && _a !== void 0 ? _a : 59));
    }
    padZero(num) {
        return num.toString().padStart(2, "0");
    }
    render() {
        const displayHours = this.getDisplayHours();
        const maxHours = this.useTwelveHourFormat ? 12 : 23;
        const minHours = this.useTwelveHourFormat ? 1 : 0;
        return (h(Host, { key: '190cabad78886b1902d70c42c6c5b1f4ee90e5fe', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: '98b3d39baf501aeb9894949e807a365e26253fbc', class: `${this.elementClassName}__container` }, h("div", { key: '6697b77b177164a36297f911572d89beaa01cf23', class: `${this.elementClassName}__field` }, h("label", { key: '43f6e821b49f19041422741840439081f819f71c', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: 'a0e177ded2a849c22e41dbca95bad0888f7f956c', class: `${this.elementClassName}__control` }, h("button", { key: 'b12c268cc84f11ee078ba9285ae6d9cc605761e4', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled || this.isAtMaxHour(), "aria-label": this.labels.incrementHours }, h("svg", { key: '598eff59b528ec28a0e5b34924e77a4f632ba6ca', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '279b80304fc77a2fd74e26a2aba89f12155f9334', points: "18 15 12 9 6 15" }))), h("input", { key: '93f17e7c848d40bd513ad7af9f29d39586391573', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: 'ba8f6463ee850c6349cad839eb851c67e0cb4d1e', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled || this.isAtMinHour(), "aria-label": this.labels.decrementHours }, h("svg", { key: '21e585fbd6a9aa2b957e817ec55ab2ec01cf2fc4', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '742b64bddf3873a7bea1c10ed93b9b1e99588ede', points: "6 9 12 15 18 9" }))))), h("div", { key: 'f81f40c465cc84a5d02b9904631d3d24e33150e3', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: 'd028bae721c1c9c2cc7290cd19f7050a901f4a4e', class: `${this.elementClassName}__field` }, h("label", { key: '3c88a3fa04ed2a65f72c48ded459e19d580f9c36', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: 'dbd89633addd003b2e42414b587d03a6e65e9239', class: `${this.elementClassName}__control` }, h("button", { key: 'b113074a58889691dd5452a6353b691336f5ae14', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled || this.isAtMaxMinute(), "aria-label": this.labels.incrementMinutes }, h("svg", { key: '0d724c0e5110dd29ab4cedc005595d4e57fd3d06', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'dbc89190f6fe10bb8c8074252b83ab3397112de4', points: "18 15 12 9 6 15" }))), h("input", { key: '65a9a61218d443676a8a2d03d4922b2303a484c5', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: '3f72a62add15d9288b421b84e791ba40b9acf569', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled || this.isAtMinMinute(), "aria-label": this.labels.decrementMinutes }, h("svg", { key: '04eef7d1d332459e5191962c411aa9c83ace8b84', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '56045b19ec716a82f21406b647762ba0efcd8170', points: "6 9 12 15 18 9" }))))), this.showSeconds && [
            h("div", { key: '9c2619ccebd147e626e10a21fb1a5fa1268128f3', class: `${this.elementClassName}__separator` }, ":"),
            h("div", { key: 'dea8135d47a06d9624b480aa6123350a0899ca02', class: `${this.elementClassName}__field` }, h("label", { key: 'afaa88b59df63091088620ff2a49bf8472f4401f', htmlFor: `${this.elementClassName}-seconds`, class: {
                    [`${this.elementClassName}__label`]: true,
                    [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
                } }, this.labels.seconds), h("div", { key: 'c2ed4d63a95a65bdc26926932e705744bbe776c5', class: `${this.elementClassName}__control` }, h("button", { key: '40d510ae7008802ce09ec98c9912f2f91cdb2db7', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleSecondIncrement, disabled: this.disabled || this.isAtMaxSecond(), "aria-label": this.labels.incrementSeconds }, h("svg", { key: 'fd3324d15759c7f2a752b6a32303c8eaddb0e588', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '5e2dad75d96a521f56f616bc2b88e4baa6c0eb50', points: "18 15 12 9 6 15" }))), h("input", { key: 'b1b517bb8147a45632388f432ae0e3595467ebce', id: `${this.elementClassName}-seconds`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalSeconds), min: 0, max: 59, onInput: this.handleSecondChange, disabled: this.disabled, "aria-label": this.labels.seconds }), h("button", { key: '7b82e86f2da4bd5c0f65c95cbcb26252e357625d', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleSecondDecrement, disabled: this.disabled || this.isAtMinSecond(), "aria-label": this.labels.decrementSeconds }, h("svg", { key: 'c3b5ae33c5475b448c1a5e7fe3bb4748318441fb', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '3bb717320e078f5fa36912f15995ed604d9f702b', points: "6 9 12 15 18 9" })))))
        ], this.useTwelveHourFormat && (h("div", { key: 'ec583890c2f7d97c6a6196f3556dfd76c8209227', class: `${this.elementClassName}__period` }, h("button", { key: 'e99d9b41ded6b138660f2777f60991bf3af12182', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: '3a3cbc3b47b0218694db2c8909da97ea50e521f2', type: "button", class: {
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
            },
            "minTime": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TimeBounds",
                    "resolved": "TimeBounds",
                    "references": {
                        "TimeBounds": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
                            "id": "src/components/tabworthy-times-picker/tabworthy-times-picker.tsx::TimeBounds"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "maxTime": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TimeBounds",
                    "resolved": "TimeBounds",
                    "references": {
                        "TimeBounds": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-times-picker/tabworthy-times-picker.tsx",
                            "id": "src/components/tabworthy-times-picker/tabworthy-times-picker.tsx::TimeBounds"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
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
