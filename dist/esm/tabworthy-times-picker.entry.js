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
        return (h(Host, { key: '372c9246a2607ae7553b61ba7445086000193ed1', class: this.elementClassName, "aria-label": this.labels.timePicker }, h("div", { key: 'fc8ea016f0c0cef3496024285fada802395011ac', class: `${this.elementClassName}__container` }, h("div", { key: '235d60b72a515d2b935a736bef6768b057714a53', class: `${this.elementClassName}__field` }, h("label", { key: '9f9c5cfee7fb8a44d9b4902809805b5aa2568f18', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), h("div", { key: 'c5e369d24840f55c994d8a546bcca3569e2619ef', class: `${this.elementClassName}__control` }, h("button", { key: '51f6278e8af5d4ec0b6ad11e2e1b90ec642adb08', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled, "aria-label": this.labels.incrementHours }, h("svg", { key: '2bd03474f449be514d4a83e00606d476120d7bae', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'c50112d7748c97e93e4fa0a567ef2a74609e295b', points: "18 15 12 9 6 15" }))), h("input", { key: 'a157d44b72d46e6e67b91ac8d00caa5f8df046e7', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), h("button", { key: '63a18713421f84b35b8a9bcef4c10213086bab8e', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled, "aria-label": this.labels.decrementHours }, h("svg", { key: '3e6c61c533b9ae91d1f35d424c54602b5bd1252c', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'cfe2fe7edfc882bd03ffbb1c7a282b73afac42ac', points: "6 9 12 15 18 9" }))))), h("div", { key: 'e1956c2fa548d3e011ec7a9f88f837e8482280b2', class: `${this.elementClassName}__separator` }, ":"), h("div", { key: '6e8292b63371a4a37fb6afca9a3668e87d583fde', class: `${this.elementClassName}__field` }, h("label", { key: '876283ccffdce8688ac400d4c46d7f99735da14a', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), h("div", { key: 'afdfa8c592b9b90c62fd1fb77a2494977f4edcd2', class: `${this.elementClassName}__control` }, h("button", { key: '06d2051e46aa19299ce8a59fe0d474d26f905ed9', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled, "aria-label": this.labels.incrementMinutes }, h("svg", { key: '28e6fda7aeb3246e639c0e5e76853576815c1fd1', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: '43df9c8fcfc53ff8ebbd0879abd4d1ebc056b9ba', points: "18 15 12 9 6 15" }))), h("input", { key: '6b2eb0ac1dbe34304f349b4780e0ae9553cf955d', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), h("button", { key: '65e5c108a5cd0451512a1d6c717d1176092e7efb', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled, "aria-label": this.labels.decrementMinutes }, h("svg", { key: 'fb53625bccc3aef8447e70bf7c7b00bc7df03830', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'ee6274f6d2035243412e992ceec7ae7aecf8793f', points: "6 9 12 15 18 9" }))))), this.showSeconds && [
            h("div", { key: '3ee853ccf77f36e4937736a1451eaaaf4aae1ba9', class: `${this.elementClassName}__separator` }, ":"),
            h("div", { key: 'ea499addc6e546945a9b9c835793c3f7485f1410', class: `${this.elementClassName}__field` }, h("label", { key: 'b63a52658e5ddd90615668be5dc2e457e8217cd9', htmlFor: `${this.elementClassName}-seconds`, class: {
                    [`${this.elementClassName}__label`]: true,
                    [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
                } }, this.labels.seconds), h("div", { key: 'b812f8b2f952f7da2bfd20b4e8daf0f346dfd10e', class: `${this.elementClassName}__control` }, h("button", { key: 'a62b3ef2176f5ffd75ee32335c86e65d549f2ba4', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleSecondIncrement, disabled: this.disabled, "aria-label": this.labels.incrementSeconds }, h("svg", { key: 'd12fd6645379007b36692b1a2de07d8dd33687a4', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'ef1d5818d98c0c35d7b6317f6ee952d13b0c1d33', points: "18 15 12 9 6 15" }))), h("input", { key: '68b25324d43824686b933ad9f83d58eb4d71bb0d', id: `${this.elementClassName}-seconds`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalSeconds), min: 0, max: 59, onInput: this.handleSecondChange, disabled: this.disabled, "aria-label": this.labels.seconds }), h("button", { key: 'fa0fa372e836f05964a5ccb60ed1e8a235e24d8b', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleSecondDecrement, disabled: this.disabled, "aria-label": this.labels.decrementSeconds }, h("svg", { key: '2af2b80fe0853cc908e4eeccbfa4b99c758df941', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, h("polyline", { key: 'b4c2c5729a9c0fd129371a17e23026f975dd296a', points: "6 9 12 15 18 9" })))))
        ], this.useTwelveHourFormat && (h("div", { key: '6ad19983d00af5cca81dc8753791116e07f98cd1', class: `${this.elementClassName}__period` }, h("button", { key: '05817e47857832d21380a425ccf149f9d10a328a', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), h("button", { key: '7cff09015ab14acb9d40bd8a5d2f249f84d763b8', type: "button", class: {
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
            }],
        "seconds": [{
                "watchSeconds": 0
            }]
    }; }
};

export { TabworthyTimesPicker as tabworthy_times_picker };
