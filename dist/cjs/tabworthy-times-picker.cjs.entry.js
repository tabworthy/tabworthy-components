'use strict';

var index = require('./index-B1s0tI-Z.js');

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
        index.registerInstance(this, hostRef);
        this.timeChanged = index.createEvent(this, "timeChanged", 7);
        // Current time value (24-hour format)
        this.hours = 12;
        this.minutes = 0;
        this.seconds = 0;
        this.useTwelveHourFormat = false;
        // Show seconds control
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
        return (index.h(index.Host, { key: 'be075e309d41904bf237c3a4b31b063ac4d1a7e0', class: this.elementClassName, "aria-label": this.labels.timePicker }, index.h("div", { key: '39d3a55428ad6f567490aa9a55ab94766de39e7f', class: `${this.elementClassName}__container` }, index.h("div", { key: '5efcc6b13a4473d5d889689d205128b328ae9417', class: `${this.elementClassName}__field` }, index.h("label", { key: 'f2e760229dd54d2265539e924dc133eda7f53fb8', htmlFor: `${this.elementClassName}-hours`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.hours), index.h("div", { key: 'a1f92371d923c50adb423d8fa36d84fe632fcdcb', class: `${this.elementClassName}__control` }, index.h("button", { key: 'ce1a13d5d97f664cd5a7ef9ac144cb2d7a76b0e3', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleHourIncrement, disabled: this.disabled, "aria-label": this.labels.incrementHours }, index.h("svg", { key: '9f4f27bc5e3ecc1da7f9520c5a67bef79b546229', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: '2537a3c151f846b52f427bff20145dd581b2db7b', points: "18 15 12 9 6 15" }))), index.h("input", { key: 'dbe3c7e05bf44f2942f38e397fa8abcd5ec9a080', id: `${this.elementClassName}-hours`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(displayHours), min: minHours, max: maxHours, onInput: this.handleHourChange, disabled: this.disabled, "aria-label": this.labels.hours }), index.h("button", { key: '69e610902e8324369a57f5943699f019533f9b0a', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleHourDecrement, disabled: this.disabled, "aria-label": this.labels.decrementHours }, index.h("svg", { key: 'fd3a91c8c82abb4ba948c1735a4d6b1ab9879452', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: 'f2fb31860bc57fe95b78e0331d4dce611976f1cc', points: "6 9 12 15 18 9" }))))), index.h("div", { key: '5f488705145ebbaaba10f7e0370dd614e5ac9c91', class: `${this.elementClassName}__separator` }, ":"), index.h("div", { key: 'c886bc72ad9098a1015d97cdb64d609d10b4b7c0', class: `${this.elementClassName}__field` }, index.h("label", { key: '3590285320f4ee5403e41cceb964aa2440ee3caa', htmlFor: `${this.elementClassName}-minutes`, class: {
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
            } }, this.labels.minutes), index.h("div", { key: '0e4271bc5e35b9664ef599af056c997a0b09c64f', class: `${this.elementClassName}__control` }, index.h("button", { key: '29d095829fb141f2f2495a5cbc4bb7f28f39b54b', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleMinuteIncrement, disabled: this.disabled, "aria-label": this.labels.incrementMinutes }, index.h("svg", { key: '683cb78389935a9a68e59d875df60dc168ca5a4b', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: '21084833e0479ace54ee23b2b9a39276752d6467', points: "18 15 12 9 6 15" }))), index.h("input", { key: '07d608da760816c37ae394fe5798ad25ca0c17db', id: `${this.elementClassName}-minutes`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalMinutes), min: 0, max: 59, onInput: this.handleMinuteChange, disabled: this.disabled, "aria-label": this.labels.minutes }), index.h("button", { key: '07aee6f5f9b6cfe23fa50ae9ad2319f627c9efe2', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleMinuteDecrement, disabled: this.disabled, "aria-label": this.labels.decrementMinutes }, index.h("svg", { key: '3e284e93b451ab57b0c4e0a29b8c3953f5a79033', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: '589c1da5150f4b3def68b9dcb14f2ee56b9022e2', points: "6 9 12 15 18 9" }))))), this.showSeconds && [
            index.h("div", { key: '717844859ad07d5912fdd0b386151aeb40ccbf94', class: `${this.elementClassName}__separator` }, ":"),
            index.h("div", { key: 'a27907f31a3d71abb9f7c5bce411569ddd22594d', class: `${this.elementClassName}__field` }, index.h("label", { key: 'c6312aeccdfe835aa0bd02bc7078b4a30aa70921', htmlFor: `${this.elementClassName}-seconds`, class: {
                    [`${this.elementClassName}__label`]: true,
                    [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
                } }, this.labels.seconds), index.h("div", { key: 'c347d3847e999a900cba2410dbc2c5711d01d746', class: `${this.elementClassName}__control` }, index.h("button", { key: 'b0862893f9d99e6ef7da0cfc02f6a6e1f0bc4443', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--increment`, onClick: this.handleSecondIncrement, disabled: this.disabled, "aria-label": this.labels.incrementSeconds }, index.h("svg", { key: 'b4032699911ed9e589c015b4c3b9d31766b53d38', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: '5bfbeefa5ea9d4901a7bc08de5bf01578fbf6cec', points: "18 15 12 9 6 15" }))), index.h("input", { key: '3c7e4e5b4f7a162e9ce9efa815d1c180ff5395d2', id: `${this.elementClassName}-seconds`, type: "number", class: `${this.elementClassName}__input`, value: this.padZero(this.internalSeconds), min: 0, max: 59, onInput: this.handleSecondChange, disabled: this.disabled, "aria-label": this.labels.seconds }), index.h("button", { key: '6f5a37921ef128033fe8241b63903739f0ddc245', type: "button", class: `${this.elementClassName}__button ${this.elementClassName}__button--decrement`, onClick: this.handleSecondDecrement, disabled: this.disabled, "aria-label": this.labels.decrementSeconds }, index.h("svg", { key: '5c24cc5df194f53889ec353a5527c239df94a380', fill: "none", height: "16", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "16" }, index.h("polyline", { key: '090946e452acf54e8bc491094573368160f55cbe', points: "6 9 12 15 18 9" })))))
        ], this.useTwelveHourFormat && (index.h("div", { key: '4bbd646f21dc099efc94e86b05ce35e22c28ee16', class: `${this.elementClassName}__period` }, index.h("button", { key: '3b41814b8fe32ffe3ef898fe816cc027440c6c2b', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "AM"
            }, onClick: () => this.handlePeriodChange("AM"), disabled: this.disabled, "aria-label": this.labels.am, "aria-pressed": this.period === "AM" }, this.labels.am), index.h("button", { key: 'fd9052000876c0516e13ab701a4e5164a7d72112', type: "button", class: {
                [`${this.elementClassName}__period-button`]: true,
                [`${this.elementClassName}__period-button--active`]: this.period === "PM"
            }, onClick: () => this.handlePeriodChange("PM"), disabled: this.disabled, "aria-label": this.labels.pm, "aria-pressed": this.period === "PM" }, this.labels.pm))))));
    }
    get el() { return index.getElement(this); }
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

exports.tabworthy_times_picker = TabworthyTimesPicker;
