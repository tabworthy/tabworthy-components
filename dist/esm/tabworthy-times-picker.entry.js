import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-CwtZ_Lud.js';

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
const TabworthyTimesPicker = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.timeChanged = createEvent(this, "timeChanged", 7);
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
        this.modalIsOpen = false;
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
    watchModalIsOpen() {
        if (this.modalIsOpen === true) {
            this.moveFocusOnModalOpen = true;
        }
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
    componentDidRender() {
        if (this.moveFocusOnModalOpen) {
            setTimeout(() => {
                this.focusHoursInput();
                this.moveFocusOnModalOpen = false;
            }, 100);
        }
    }
    focusHoursInput() {
        var _a;
        (_a = this.hoursInputRef) === null || _a === void 0 ? void 0 : _a.focus();
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
        return (h(Host, { key: 'c307a1b94d1ec25702c286c7f36e4746df8c6bb7', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: 'c446911a0ddcb6282ab5507d359d56a42f533db3', class: `${this.elementClassName}__container` }, h("div", { key: '302c7e7e0c1bf71629ef2a71bb564f9571aad7be', class: `${this.elementClassName}__field` }, h("label", { key: '8ce64af4f416c3cdc0dd8943fc02ab9016d62099', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: '3f541e096c7bb3f436f358800588d5da7fccb34e', class: `${this.elementClassName}__control` }, h("button", { key: '31039ad972122c2a6f963190d38f379bb7dce71f', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled || this.isAtMaxHour(), "aria-label": this.labels.incrementHours }, h("svg", { key: '4b16f261f4fecc91973d858b6235fc8aac4f7605', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'fe60640cfa75911b862913a3076cbeea037a38f7', points: "18 15 12 9 6 15" }))), h("input", { key: 'a3a7eed2efc8b1789de698771e82e3f31f50e885', id: `${this.elementClassName}-hours`, ref: (el) => (this.hoursInputRef = el), type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: '421b70976c21b2b33e21962780d13609a6b762a5', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled || this.isAtMinHour(), "aria-label": this.labels.decrementHours }, h("svg", { key: 'ab87c0de149d43edcbebd1b2d4d00e4a3ebed5b3', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '32f2d112c44434249d506d1e8222e25b34fb0d44', points: "6 9 12 15 18 9" }))))), h("div", { key: '54449a42e67f6f3c2318310bc12eeba24cebc56f', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: 'f65d84751223424c3649d0fb9589cf3c1af091eb', class: `${this.elementClassName}__field` }, h("label", { key: '911244fd360371ee26b97eb9690c7b04340d6e88', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: 'e5574834dd59e9c08dcee56b07bf8bf186f7ba4b', class: `${this.elementClassName}__control` }, h("button", { key: '2b091d643aa785b8ddeae55dd8c523cd5282719d', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled || this.isAtMaxMinute(), "aria-label": this.labels.incrementMinutes }, h("svg", { key: '23668a0f1299f86901d0e32e9f7f37bacd376665', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '7f030c2d35147651ad86352c65dc6f8f00b2ba93', points: "18 15 12 9 6 15" }))), h("input", { key: 'b73ed30b3a7d25ef84bab23afa45172ce5d03944', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: '7ce7a36ef59e44afd474c427250adc352a8a6694', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled || this.isAtMinMinute(), "aria-label": this.labels.decrementMinutes }, h("svg", { key: '49bcd0c73fde1f77c0d42978a76086abb5be6cc4', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'c503c319467e0aac6883db25b7d84a1d752aeaf9', points: "6 9 12 15 18 9" }))))), this.showSeconds && [
            h("div", { key: 'be25b2045f9e74b0414e55f8d508f7c192e1772e', class: `${this.elementClassName}__separator` }, ":"),
            h("div", { key: '85ceb01427ea52c231f1b6a3d78c95c6d603215c', class: `${this.elementClassName}__field` }, h("label", { key: '1a1adf9081b3e763e4fbc45b8bab812ae869edbb', htmlFor: `${this.elementClassName}-seconds`, class: {
                    [`${this.elementClassName}__label`]: true,
                    [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
                } }, this.labels.seconds), h("div", { key: 'abce976c9d3143819c41ff64b54dfbcea41ddd88', class: `${this.elementClassName}__control` }, h("button", { key: '1416ee09b69a6d62d8ecd1394bb375fc01601e4a', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleSecondIncrement, disabled: this.disabled || this.isAtMaxSecond(), "aria-label": this.labels.incrementSeconds }, h("svg", { key: '1ab4adae2efa4a54286605be221cf2d424e98deb', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '61ef61c721a39732a3aacdc9db5b63950796706b', points: "18 15 12 9 6 15" }))), h("input", { key: 'd5b40cf419b007e28f7f69ffe333601fcc3c701e', id: `${this.elementClassName}-seconds`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalSeconds), min: 0, max: 59, onInput: this.handleSecondChange, disabled: this.disabled, "aria-label": this.labels.seconds }), h("button", { key: '177306df5ba004bbd58df462a7d010f8903656eb', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleSecondDecrement, disabled: this.disabled || this.isAtMinSecond(), "aria-label": this.labels.decrementSeconds }, h("svg", { key: '971169fce6fee5ccb8241faef04d633a0396e347', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '4c31a4b794cc6b421e8e2b3cdb322d584fe40e81', points: "6 9 12 15 18 9" })))))
        ], this.useTwelveHourFormat && (h("div", { key: 'b6e9916c6d14aaac6aa3ee1f1c3bd2624f01a344', class: `${this.elementClassName}__period` }, h("button", { key: 'c476a13007f840b5f9e5f058623b1846b33b72cf', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: 'f4cc8df59e07cb53e9b72f376a17e10df357a335', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "PM"
            }, onClick: () => this.handlePeriodChange("PM"), disabled: this.disabled, "aria-label": this.labels.pm, "aria-pressed": this.period === "PM" }, this.labels.pm))))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "modalIsOpen": [{
                "watchModalIsOpen": 0
            }],
        "hours": [{
                "watchHours": 0
            }],
        "minutes": [{
                "watchMinutes": 0
            }],
        "seconds": [{
                "watchSeconds": 0
            }]
    }; }
};

export { TabworthyTimesPicker as tabworthy_times_picker };
