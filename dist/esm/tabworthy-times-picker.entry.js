import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-CwtZ_Lud.js';

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
const InclusiveTimesPicker = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.timeChanged = createEvent(this, "timeChanged", 7);
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
        return (h(Host, { key: '6ccec0415bd1c35275e125355f69e871a2b3dc18', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: '52849e2d4e8ad6183d3017277f11fbd5bc3643c5', class: `${this.elementClassName}__container` }, h("div", { key: '9aa3980e371db20ae4ed4f590a0e9f49aa3d40cd', class: `${this.elementClassName}__field` }, h("label", { key: '77ea146e2d05b4bedec83a8d03096a6c51b6fd36', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: 'cf88cc85dce2a2e11e5e0ca61ab23d5bcc71b7be', class: `${this.elementClassName}__control` }, h("button", { key: 'e2e68d9e5ed00a2a72f4a019a59d7fa683a8d56c', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled, "aria-label": this.labels.incrementHours }, h("svg", { key: '269a5595fd1baf1ace113beb3147542353927c75', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '1d2c3fca6e81b9fdaab6f9b9f2c19f55b1af0ef5', points: "18 15 12 9 6 15" }))), h("input", { key: '53a57e4c6e1a40dcb89ecd11cd1cba0f6205c470', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: 'ab36448a4f79a29592124dee72fa8e96f121f646', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled, "aria-label": this.labels.decrementHours }, h("svg", { key: '705e207ffc41a38bff7d8739e02605e536e75a92', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'c8c08acec53576456b330c4f40a7879556704d0f', points: "6 9 12 15 18 9" }))))), h("div", { key: '3b8c0125c18518463de020682de4620d918a3463', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: 'c54430db728d8f48320f4e4983a1d67a1ec8c78e', class: `${this.elementClassName}__field` }, h("label", { key: 'b47c7ae65c0b34b70673a8bd60c3b1496acf9540', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: '9a4434d935f34bfd910e2ab7656fc125c05de9ca', class: `${this.elementClassName}__control` }, h("button", { key: 'fcc7800df89c4739c257a5733affdabc8aca1e25', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled, "aria-label": this.labels.incrementMinutes }, h("svg", { key: '80b692e16555612a179fec5734c79966d0c5967a', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '086fbe45c600657c2f6bf37e8415b87e8d763c3e', points: "18 15 12 9 6 15" }))), h("input", { key: 'dc610011944c2ad1bf3aa68937265bdf835ba009', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: 'd2cabe46d53e0cbd2b58140f6a55217dd69a3c5e', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled, "aria-label": this.labels.decrementMinutes }, h("svg", { key: '2e5e67efccb2a66a0c4a1377d3941d12b4bd7947', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '3da5561fb1f5bf1b07eb48de6e020047c1956158', points: "6 9 12 15 18 9" }))))), this.useTwelveHourFormat && (h("div", { key: '24c87e5e371f8a10816afcebb3dc2f7843fa89f5', class: `${this.elementClassName}__period` }, h("button", { key: '014126a0d5470d56ae384e12b2e196c3a9132700', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: 'cf9f1f261456d7b5f64bf4b7d9ddbbb2e86d4447', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "PM"
            }, onClick: () => this.handlePeriodChange("PM"), disabled: this.disabled, "aria-label": this.labels.pm, "aria-pressed": this.period === "PM" }, this.labels.pm))))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "hours": [{
                "watchHours": 0
            }],
        "minutes": [{
                "watchMinutes": 0
            }]
    }; }
};

export { InclusiveTimesPicker as tabworthy_times_picker };
