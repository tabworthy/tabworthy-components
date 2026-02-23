import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-zgp3PkTz.js';
import { g as getISODateString, r as removeTimezoneOffset, a as getNextMonth, b as getNextYear, c as getPreviousMonth, d as getPreviousYear, e as dateIsWithinBounds, f as getPreviousDay, h as getNextDay, s as subDays, i as addDays, j as getFirstOfMonth, k as getLastOfMonth, l as getWeekDays, m as getDaysOfMonth, n as dateIsWithinLowerBounds, o as dateIsWithinUpperBounds, p as getYear, q as getMonth, t as monthIsDisabled, u as getMonths, v as isSameDay, w as isDateInRange } from './utils-BVHu5CWV.js';

const tabworthyDatesCalendarCss = () => `.visually-hidden.sc-tabworthy-dates-calendar{position:absolute;overflow:hidden;width:1px;height:1px;white-space:nowrap;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%)}`;

const defaultLabels = {
    clearButton: "Clear value",
    monthSelect: "Select month",
    nextMonthButton: "Next month",
    nextYearButton: "Next year",
    picker: "Choose date",
    previousMonthButton: "Previous month",
    previousYearButton: "Previous year",
    todayButton: "Show today",
    yearSelect: "Select year",
    keyboardHint: "Keyboard commands",
    selected: "Selected date",
    chooseAsStartDate: "choose as start date",
    chooseAsEndDate: "choose as end date"
};
const InclusiveDatesCalendar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.selectDate = createEvent(this, "selectDate", 3);
        this.changeMonth = createEvent(this, "changeMonth", 3);
        this.changeYear = createEvent(this, "changeYear", 3);
        this.disabled = false;
        this.modalIsOpen = false;
        this.disableDate = () => false;
        this.elementClassName = "tabworthy-dates-calendar";
        this.firstDayOfWeek = 0;
        this.range = false;
        this.labels = defaultLabels;
        this.locale = (navigator === null || navigator === void 0 ? void 0 : navigator.language) || "en-US";
        this.inline = false;
        this.showClearButton = false;
        this.showMonthStepper = true;
        this.showTodayButton = true;
        this.showYearStepper = false;
        this.showKeyboardHint = false;
        this.showHiddenTitle = true;
        this.startDate = getISODateString(new Date());
        this.init = () => {
            this.currentDate = this.startDate
                ? removeTimezoneOffset(new Date(this.startDate))
                : new Date();
            this.updateWeekdays();
        };
        this.nextMonth = () => {
            this.updateCurrentDate(getNextMonth(this.currentDate));
        };
        this.nextYear = () => {
            this.updateCurrentDate(getNextYear(this.currentDate), false, true);
        };
        this.previousMonth = () => {
            this.updateCurrentDate(getPreviousMonth(this.currentDate));
        };
        this.previousYear = () => {
            this.updateCurrentDate(getPreviousYear(this.currentDate), false, true);
        };
        this.showToday = () => {
            this.updateCurrentDate(new Date(), true);
        };
        this.clear = () => {
            var _a;
            this.value = undefined;
            (_a = this.selectDate) === null || _a === void 0 ? void 0 : _a.emit(undefined);
        };
        this.onClick = (event) => {
            if (this.disabled) {
                return;
            }
            const target = event.target.closest("[data-date]");
            if (!Boolean(target)) {
                return;
            }
            const date = removeTimezoneOffset(new Date(target.dataset.date));
            this.updateCurrentDate(date);
            this.onSelectDate(date);
        };
        this.onMonthSelect = (event) => {
            const month = +event.target.value - 1;
            const date = new Date(this.currentDate);
            if (!dateIsWithinBounds(date, this.minDate, this.maxDate))
                return;
            date.setMonth(month);
            this.updateCurrentDate(date);
        };
        this.onYearSelect = (event) => {
            var _a;
            const year = +event.target.value;
            const date = new Date(this.currentDate);
            if (!dateIsWithinBounds(date, this.minDate, this.maxDate))
                return;
            date.setFullYear(year);
            (_a = this.changeYear) === null || _a === void 0 ? void 0 : _a.emit({ year });
            this.updateCurrentDate(date);
        };
        this.onKeyDown = (event) => {
            if (this.disabled) {
                return;
            }
            if (event.code === "ArrowLeft") {
                event.preventDefault();
                this.updateCurrentDate(getPreviousDay(this.currentDate), true);
            }
            else if (event.code === "ArrowRight") {
                event.preventDefault();
                this.updateCurrentDate(getNextDay(this.currentDate), true);
            }
            else if (event.code === "ArrowUp") {
                event.preventDefault();
                this.updateCurrentDate(subDays(this.currentDate, 7), true);
            }
            else if (event.code === "ArrowDown") {
                event.preventDefault();
                this.updateCurrentDate(addDays(this.currentDate, 7), true);
            }
            else if (event.code === "PageUp") {
                event.preventDefault();
                if (event.shiftKey) {
                    this.updateCurrentDate(getPreviousYear(this.currentDate), true);
                }
                else {
                    this.updateCurrentDate(getPreviousMonth(this.currentDate), true);
                }
            }
            else if (event.code === "PageDown") {
                event.preventDefault();
                if (event.shiftKey) {
                    this.updateCurrentDate(getNextYear(this.currentDate), true);
                }
                else {
                    this.updateCurrentDate(getNextMonth(this.currentDate), true);
                }
            }
            else if (event.code === "Home") {
                event.preventDefault();
                this.updateCurrentDate(getFirstOfMonth(this.currentDate), true);
            }
            else if (event.code === "End") {
                event.preventDefault();
                this.updateCurrentDate(getLastOfMonth(this.currentDate), true);
            }
            else if (event.code === "Space" || event.code === "Enter") {
                event.preventDefault();
                this.onSelectDate(this.currentDate);
            }
        };
        this.onMouseEnter = (event) => {
            var _a;
            if (this.disabled) {
                return;
            }
            const date = removeTimezoneOffset(new Date((_a = event.target.closest("td")) === null || _a === void 0 ? void 0 : _a.dataset.date));
            this.hoveredDate = date;
        };
        this.onMouseLeave = () => {
            this.hoveredDate = undefined;
        };
    }
    componentWillLoad() {
        this.init();
    }
    watchModalIsOpen() {
        if (this.modalIsOpen === true) {
            this.moveFocusOnModalOpen = true;
        }
    }
    watchFirstDayOfWeek() {
        this.updateWeekdays();
    }
    watchLocale() {
        if (!Boolean(this.locale)) {
            this.locale = (navigator === null || navigator === void 0 ? void 0 : navigator.language) || "en-US";
        }
        this.updateWeekdays();
    }
    watchRange() {
        var _a;
        this.value = undefined;
        (_a = this.selectDate) === null || _a === void 0 ? void 0 : _a.emit(undefined);
    }
    watchStartDate() {
        this.currentDate = this.startDate
            ? removeTimezoneOffset(new Date(this.startDate))
            : new Date();
    }
    watchValue() {
        if (Boolean(this.value)) {
            if (Array.isArray(this.value) && this.value.length >= 1) {
                this.currentDate = this.value[0];
            }
            else if (this.value instanceof Date) {
                this.currentDate = this.value;
            }
        }
    }
    componentDidRender() {
        if (this.moveFocusAfterMonthChanged) {
            this.focusDate(this.currentDate);
            this.moveFocusAfterMonthChanged = false;
        }
        if (this.moveFocusOnModalOpen) {
            // Timeout added to stop VoiceOver from crashing Safari when openin the calendar. TODO: Investigate a neater solution
            setTimeout(() => {
                this.focusDate(this.currentDate);
                this.moveFocusOnModalOpen = false;
            }, 100);
        }
    }
    updateWeekdays() {
        this.weekdays = getWeekDays(this.firstDayOfWeek, this.locale);
    }
    getClassName(element) {
        return Boolean(element)
            ? `${this.elementClassName}__${element}`
            : this.elementClassName;
    }
    getCalendarRows() {
        const daysOfMonth = getDaysOfMonth(this.currentDate, true, this.firstDayOfWeek === 0 ? 7 : this.firstDayOfWeek);
        const calendarRows = [];
        for (let i = 0; i < daysOfMonth.length; i += 7) {
            const row = daysOfMonth.slice(i, i + 7);
            calendarRows.push(row);
        }
        return calendarRows;
    }
    getTitle() {
        if (!Boolean(this.currentDate)) {
            return;
        }
        return Intl.DateTimeFormat(this.locale, {
            month: "long",
            year: "numeric"
        }).format(this.currentDate);
    }
    focusDate(date) {
        var _a;
        date &&
            ((_a = this.el
                .querySelector(`[data-date="${getISODateString(date)}"]`)) === null || _a === void 0 ? void 0 : _a.focus());
    }
    updateCurrentDate(date, moveFocus, emitChangeYear = false) {
        var _a, _b, _c;
        const month = date.getMonth();
        const year = date.getFullYear();
        if (!dateIsWithinLowerBounds(date, this.minDate))
            date = new Date(this.minDate);
        if (!dateIsWithinUpperBounds(date, this.maxDate))
            date = new Date(this.maxDate);
        const monthChanged = month !== ((_a = this.currentDate) === null || _a === void 0 ? void 0 : _a.getMonth()) ||
            year !== this.currentDate.getFullYear();
        if (monthChanged) {
            (_b = this.changeMonth) === null || _b === void 0 ? void 0 : _b.emit({ month: getMonth(date), year: getYear(date) });
            if (moveFocus) {
                this.moveFocusAfterMonthChanged = true;
            }
        }
        this.currentDate = date;
        if (moveFocus) {
            this.focusDate(this.currentDate);
        }
        if (emitChangeYear) {
            (_c = this.changeYear) === null || _c === void 0 ? void 0 : _c.emit({ year: getYear(date) });
        }
    }
    onSelectDate(date) {
        var _a, _b, _c, _d;
        if (this.disableDate(date) ||
            !dateIsWithinBounds(date, this.minDate, this.maxDate)) {
            return;
        }
        if (this.isRangeValue(this.value)) {
            const newValue = ((_a = this.value) === null || _a === void 0 ? void 0 : _a[0]) === undefined || this.value.length === 2
                ? [date]
                : [this.value[0], date];
            if (newValue.length === 2 && newValue[0] > newValue[1]) {
                newValue.reverse();
            }
            const isoValue = newValue[1] === undefined
                ? [getISODateString(newValue[0])]
                : [getISODateString(newValue[0]), getISODateString(newValue[1])];
            this.value = newValue;
            (_b = this.selectDate) === null || _b === void 0 ? void 0 : _b.emit(isoValue);
        }
        else {
            if (((_c = this.value) === null || _c === void 0 ? void 0 : _c.getTime()) === date.getTime()) {
                return;
            }
            this.value = date;
            (_d = this.selectDate) === null || _d === void 0 ? void 0 : _d.emit(getISODateString(date));
        }
    }
    isRangeValue(_value) {
        return !!this.range;
    }
    render() {
        var _a;
        const showFooter = this.showTodayButton || this.showClearButton || this.showKeyboardHint;
        const disabled = {
            year: {
                prev: this.disabled ||
                    (!!this.minDate &&
                        new Date(this.minDate).getFullYear() >
                            getPreviousYear(this.currentDate).getFullYear()),
                next: this.disabled ||
                    (!!this.maxDate &&
                        new Date(this.maxDate).getFullYear() <
                            getNextYear(this.currentDate).getFullYear())
            },
            month: {
                prev: this.disabled ||
                    monthIsDisabled(getPreviousMonth(this.currentDate).getMonth(), getPreviousMonth(this.currentDate).getFullYear(), this.minDate, this.maxDate),
                next: this.disabled ||
                    monthIsDisabled(getNextMonth(this.currentDate).getMonth(), getNextMonth(this.currentDate).getFullYear(), this.minDate, this.maxDate)
            }
        };
        return (h(Host, { key: 'cc8676fdeec05b5635c367353e7bb1b8c997dedd' }, h("div", { key: '4a4efc949f954772a55dad16e507a938b0308130', class: {
                [`${this.getClassName()}-wrapper`]: true,
                [`${this.getClassName()}-wrapper--inline`]: this.inline
            } }, h("div", { key: 'de0afeccacba5e76162a4d22041f3b65983e77fe', class: {
                [this.getClassName()]: true,
                [`${this.getClassName()}--disabled`]: this.disabled
            } }, h("div", { key: 'e8ed89a15cd32f629e559c9e9922c97816aff70c', class: this.getClassName("header") }, this.showHiddenTitle && (h("span", { key: '8a922cf4df9ee3f87a673cfaf2d04fe539305bbe', "aria-atomic": "true", "aria-live": "polite", class: "visually-hidden" }, this.getTitle())), this.showYearStepper && (h("button", { key: '225e73d3b12646781661d28057f4d9611e624c69', "aria-label": this.labels.previousYearButton, class: this.getClassName("previous-year-button"), "aria-disabled": disabled.year.prev, innerHTML: this.previousYearButtonContent || undefined, onClick: this.previousYear, type: "button" }, h("svg", { key: 'e0fd3f0d41f596b450642eb9c27c5958feb7ba30', fill: "none", height: "24", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "24" }, h("polyline", { key: '85735b11b068015e671f550639ded6193dfbab28', points: "11 17 6 12 11 7" }), h("polyline", { key: '19c3ffcbb7b98261be4b309a2bbbaa826ea1ad73', points: "18 17 13 12 18 7" })))), this.showMonthStepper && (h("button", { key: '4b687ad0f92198cb9a324b8c0d380ae0a31f2346', "aria-label": this.labels.previousMonthButton, class: this.getClassName("previous-month-button"), "aria-disabled": disabled.month.prev, innerHTML: this.previousMonthButtonContent || undefined, onClick: this.previousMonth, type: "button" }, h("svg", { key: 'a1931a36fddf8a84cc8f4d367b34b8b59d03cc09', fill: "none", height: "24", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "24" }, h("polyline", { key: 'e053a2405fb992e9eaeddf114b8da460b41ade13', points: "15 18 9 12 15 6" })))), h("span", { key: 'fbf8feee129211cf10f611c879288d76f7456c9d', class: this.getClassName("current-month") }, h("select", { key: 'ca2826280a1ab8065551fa908d40f96cc04d5464', "aria-label": this.labels.monthSelect, class: this.getClassName("month-select"), "aria-disabled": this.disabled, name: "month", onChange: this.onMonthSelect }, getMonths(this.locale).map((month, index) => {
            return (h("option", { key: month, selected: this.currentDate.getMonth() === index, value: index + 1, disabled: monthIsDisabled(index, this.currentDate.getFullYear(), this.minDate, this.maxDate) }, month));
        })), h("input", { key: 'b3f5b2dabeb38734d3602ac8aaff56a7d5a49393', "aria-label": this.labels.yearSelect, class: this.getClassName("year-select"), "aria-disabled": this.disabled, max: this.maxDate ? this.maxDate.slice(0, 4) : 9999, min: this.minDate ? this.minDate.slice(0, 4) : 1, name: "year", onChange: this.onYearSelect, type: "number", value: this.currentDate.getFullYear() })), this.showMonthStepper && (h("button", { key: '9312dc20b70fbda5bd86f25b230665a8f7f75386', "aria-label": this.labels.nextMonthButton, class: this.getClassName("next-month-button"), "aria-disabled": disabled.month.next, innerHTML: this.nextMonthButtonContent || undefined, onClick: this.nextMonth, type: "button" }, h("svg", { key: '82f1f31e919a2e316941824c0b0d59c5a1852f73', fill: "none", height: "24", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "24" }, h("polyline", { key: '3365487b15f4149b5ae035ca1f1364396c133ef0', points: "9 18 15 12 9 6" })))), this.showYearStepper && (h("button", { key: 'e83b33e034ee0fbd49e8aab90e1716ada40d2f19', "aria-label": this.labels.nextYearButton, class: this.getClassName("next-year-button"), "aria-disabled": disabled.year.next, innerHTML: this.nextYearButtonContent || undefined, onClick: this.nextYear, type: "button" }, h("svg", { key: '32b65eb085653d5c62e60262fc87f59b6d105e57', fill: "none", height: "24", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", stroke: "currentColor", viewBox: "0 0 24 24", width: "24" }, h("polyline", { key: 'eaa98641ba48a322fd7b3ac953d13104bb63aad3', points: "13 17 18 12 13 7" }), h("polyline", { key: '89b7de7ec2e24a01a808e885ac68a11c3779f9c2', points: "6 17 11 12 6 7" }))))), h("div", { key: 'a21c8a94b1ae0e5b66074d2ca956afac456f366f', class: this.getClassName("body") }, h("table", { key: '2968d8355122e3eb18de35b4c72d2404794f62e6', class: this.getClassName("calendar"), onKeyDown: this.onKeyDown, role: "grid", "aria-label": this.getTitle() }, h("thead", { key: '568a00357a3e64e692c80d90739c560513239c1d', class: this.getClassName("calendar-header") }, h("tr", { key: '4e80bf075ad630237b5ea156267a0c0d9d4f0423', class: this.getClassName("weekday-row") }, (_a = this.weekdays) === null || _a === void 0 ? void 0 : _a.map((weekday) => (h("th", { role: "columnheader", abbr: weekday[1], class: this.getClassName("weekday"), key: weekday[0], scope: "col" }, h("span", { "aria-hidden": "true" }, weekday[0]), h("span", { class: "visually-hidden" }, weekday[1])))))), h("tbody", { key: '26dfbb76ab92d065ab5f38b7135fced7738ca4a7' }, this.getCalendarRows().map((calendarRow) => {
            const rowKey = `row-${calendarRow[0].getMonth()}-${calendarRow[0].getDate()}`;
            return (h("tr", { class: this.getClassName("calendar-row"), key: rowKey }, calendarRow.map((day) => {
                var _a, _b, _c;
                const isCurrent = isSameDay(day, this.currentDate);
                const isOverflowing = day.getMonth() !== ((_a = this.currentDate) === null || _a === void 0 ? void 0 : _a.getMonth());
                const isSelected = Array.isArray(this.value)
                    ? isSameDay(day, this.value[0]) ||
                        (this.value[1] &&
                            dateIsWithinBounds(day, getISODateString(this.value[0]), getISODateString(this.value[1])))
                    : isSameDay(day, this.value);
                const isDisabled = this.disableDate(day) ||
                    !dateIsWithinBounds(day, this.minDate, this.maxDate);
                const isInRange = !this.isRangeValue(this.value)
                    ? false
                    : isDateInRange(day, {
                        from: (_b = this.value) === null || _b === void 0 ? void 0 : _b[0],
                        to: ((_c = this.value) === null || _c === void 0 ? void 0 : _c[1]) ||
                            this.hoveredDate ||
                            this.currentDate
                    }) && !isDisabled;
                const isToday = isSameDay(day, new Date());
                const cellKey = `cell-${day.getMonth()}-${day.getDate()}`;
                const getScreenReaderText = () => {
                    if (this.range) {
                        let suffix = !this.value
                            ? `, ${this.labels.chooseAsStartDate}.`
                            : "";
                        if (Array.isArray(this.value)) {
                            suffix = {
                                1: `, ${this.labels.chooseAsEndDate}.`,
                                2: `, ${this.labels.chooseAsStartDate}.`
                            }[this.value.length];
                        }
                        return `${isSelected ? `${this.labels.selected}, ` : ""}${Intl.DateTimeFormat(this.locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }).format(day)}${suffix}`;
                    }
                    else {
                        return `${isSelected ? `${this.labels.selected}, ` : ""}${Intl.DateTimeFormat(this.locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }).format(day)}`;
                    }
                };
                const className = {
                    [this.getClassName("date")]: true,
                    [this.getClassName("date--current")]: isCurrent,
                    [this.getClassName("date--disabled")]: isDisabled,
                    [this.getClassName("date--overflowing")]: isOverflowing,
                    [this.getClassName("date--today")]: isToday,
                    [this.getClassName("date--selected")]: isSelected,
                    [this.getClassName("date--in-range")]: isInRange
                };
                const Tag = isSelected
                    ? "strong"
                    : isToday
                        ? "em"
                        : "span";
                return (h("td", { "aria-disabled": String(isDisabled), "aria-selected": isSelected ? "true" : undefined, class: className, "data-date": getISODateString(day), key: cellKey, onClick: this.onClick, onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave, role: "gridcell", tabIndex: isSameDay(day, this.currentDate) &&
                        !this.disabled
                        ? 0
                        : -1 }, h(Tag, { "aria-hidden": "true" }, day.getDate()), h("span", { class: "visually-hidden" }, getScreenReaderText())));
            })));
        })))), showFooter && (h("div", { key: '102ea99b292e7a028692615c68be2e8c5720913c', class: this.getClassName("footer") }, h("div", { key: '6e1d52da734e986a9044847edd7ace16460605f2', class: this.getClassName("footer-buttons") }, this.showTodayButton && (h("button", { key: '9508eadf9835bea2e1640e6ac622665bd19da4d8', class: this.getClassName("today-button"), disabled: this.disabled, innerHTML: this.todayButtonContent || undefined, onClick: this.showToday, type: "button" }, this.labels.todayButton)), this.showClearButton && (h("button", { key: '262b926076309bc44d5b36dd64217196b4d6e8e2', class: this.getClassName("clear-button"), disabled: this.disabled, innerHTML: this.clearButtonContent || undefined, onClick: this.clear, type: "button" }, this.labels.clearButton))), this.showKeyboardHint &&
            !window.matchMedia("(pointer: coarse)").matches && (h("button", { key: '09c974e2b246f57381e0461dbb27eb83e523812d', type: "button", onClick: () => alert("Todo: Add Keyboard helper!"), class: this.getClassName("keyboard-hint") }, h("svg", { key: '4dd5a8ce6e5c96e79adf6d8b0308b56fae5be361', xmlns: "http://www.w3.org/2000/svg", height: "1em", width: "1em", viewBox: "0 0 48 48", fill: "currentColor" }, h("path", { key: 'f3378678d6a0dc9fe7ea9ffd42dc083c3dca5ec8', d: "M7 38q-1.2 0-2.1-.925Q4 36.15 4 35V13q0-1.2.9-2.1.9-.9 2.1-.9h34q1.2 0 2.1.9.9.9.9 2.1v22q0 1.15-.9 2.075Q42.2 38 41 38Zm0-3h34V13H7v22Zm8-3.25h18v-3H15Zm-4.85-6.25h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm-24.7-6.25h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3ZM7 35V13v22Z" })), this.labels.keyboardHint))))), h("slot", { key: 'ec9b51b9aaf6c48e643120115dbc7f418e9fb8e4', name: "after-calendar" }))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "modalIsOpen": [{
                "watchModalIsOpen": 0
            }],
        "firstDayOfWeek": [{
                "watchFirstDayOfWeek": 0
            }],
        "locale": [{
                "watchLocale": 0
            }],
        "range": [{
                "watchRange": 0
            }],
        "startDate": [{
                "watchStartDate": 0
            }],
        "value": [{
                "watchValue": 0
            }]
    }; }
};
InclusiveDatesCalendar.style = tabworthyDatesCalendarCss();

/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param skipNode
 * @param isMatch
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
function queryShadowRoot(root, skipNode, isMatch, maxDepth = 20, depth = 0) {
    let matches = [];
    // If the depth is above the max depth, abort the searching here.
    if (depth >= maxDepth) {
        return matches;
    }
    // Traverses a slot element
    const traverseSlot = ($slot) => {
        // Only check nodes that are of the type Node.ELEMENT_NODE
        // Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        const assignedNodes = $slot.assignedNodes().filter(node => node.nodeType === 1);
        if (assignedNodes.length > 0) {
            return queryShadowRoot(assignedNodes[0].parentElement, skipNode, isMatch, maxDepth, depth + 1);
        }
        return [];
    };
    // Go through each child and continue the traversing if necessary
    // Even though the typing says that children can't be undefined, Edge 15 sometimes gives an undefined value.
    // Therefore we fallback to an empty array if it is undefined.
    const children = Array.from(root.children || []);
    for (const $child of children) {
        // Check if the node and its descendants should be skipped
        if (skipNode($child)) {
            continue;
        }
        // If the child matches we always add it
        if (isMatch($child)) {
            matches.push($child);
        }
        if ($child.shadowRoot != null) {
            matches.push(...queryShadowRoot($child.shadowRoot, skipNode, isMatch, maxDepth, depth + 1));
        }
        else if ($child.tagName === "SLOT") {
            matches.push(...traverseSlot($child));
        }
        else {
            matches.push(...queryShadowRoot($child, skipNode, isMatch, maxDepth, depth + 1));
        }
    }
    return matches;
}

/**
 * Returns whether the element is hidden.
 * @param $elem
 */
function isHidden($elem) {
    return $elem.hasAttribute("hidden")
        || ($elem.hasAttribute("aria-hidden") && $elem.getAttribute("aria-hidden") !== "false")
        // A quick and dirty way to check whether the element is hidden.
        // For a more fine-grained check we could use "window.getComputedStyle" but we don't because of bad performance.
        // If the element has visibility set to "hidden" or "collapse", display set to "none" or opacity set to "0" through CSS
        // we won't be able to catch it here. We accept it due to the huge performance benefits.
        || $elem.style.display === `none`
        || $elem.style.opacity === `0`
        || $elem.style.visibility === `hidden`
        || $elem.style.visibility === `collapse`;
    // If offsetParent is null we can assume that the element is hidden
    // https://stackoverflow.com/questions/306305/what-would-make-offsetparent-null
    //|| $elem.offsetParent == null;
}
/**
 * Returns whether the element is disabled.
 * @param $elem
 */
function isDisabled($elem) {
    return $elem.hasAttribute("disabled")
        || ($elem.hasAttribute("aria-disabled") && $elem.getAttribute("aria-disabled") !== "false");
}
/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
function isFocusable($elem) {
    // Discard elements that are removed from the tab order.
    if ($elem.getAttribute("tabindex") === "-1" || isHidden($elem) || isDisabled($elem)) {
        return false;
    }
    return (
    // At this point we know that the element can have focus (eg. won't be -1) if the tabindex attribute exists
    $elem.hasAttribute("tabindex")
        // Anchor tags or area tags with a href set
        || ($elem instanceof HTMLAnchorElement || $elem instanceof HTMLAreaElement) && $elem.hasAttribute("href")
        // Form elements which are not disabled
        || ($elem instanceof HTMLButtonElement
            || $elem instanceof HTMLInputElement
            || $elem instanceof HTMLTextAreaElement
            || $elem instanceof HTMLSelectElement)
        // IFrames
        || $elem instanceof HTMLIFrameElement);
}

const timeouts = new Map();
/**
 * Debounces a callback.
 * @param cb
 * @param ms
 * @param id
 */
function debounce(cb, ms, id) {
    // Clear current timeout for id
    const timeout = timeouts.get(id);
    if (timeout != null) {
        window.clearTimeout(timeout);
    }
    // Set new timeout
    timeouts.set(id, window.setTimeout(() => {
        cb();
        timeouts.delete(id);
    }, ms));
}

/**
 * Template for the focus trap.
 */
const template = document.createElement("template");
template.innerHTML = `
	<div id="start"></div>
	<div id="backup"></div>
	<slot></slot>
	<div id="end"></div>
`;
/**
 * Focus trap web component.
 * @customElement focus-trap
 * @slot - Default content.
 */
class FocusTrap extends HTMLElement {
    /**
     * Attaches the shadow root.
     */
    constructor() {
        super();
        // The debounce id is used to distinguish this focus trap from others when debouncing
        this.debounceId = Math.random().toString();
        this._focused = false;
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(template.content.cloneNode(true));
        this.$backup = shadow.querySelector("#backup");
        this.$start = shadow.querySelector("#start");
        this.$end = shadow.querySelector("#end");
        this.focusLastElement = this.focusLastElement.bind(this);
        this.focusFirstElement = this.focusFirstElement.bind(this);
        this.onFocusIn = this.onFocusIn.bind(this);
        this.onFocusOut = this.onFocusOut.bind(this);
    }
    // Whenever one of these attributes changes we need to render the template again.
    static get observedAttributes() {
        return [
            "inactive"
        ];
    }
    /**
     * Determines whether the focus trap is active or not.
     * @attr
     */
    get inactive() {
        return this.hasAttribute("inactive");
    }
    set inactive(value) {
        value ? this.setAttribute("inactive", "") : this.removeAttribute("inactive");
    }
    /**
     * Returns whether the element currently has focus.
     */
    get focused() {
        return this._focused;
    }
    /**
     * Hooks up the element.
     */
    connectedCallback() {
        this.$start.addEventListener("focus", this.focusLastElement);
        this.$end.addEventListener("focus", this.focusFirstElement);
        // Focus out is called every time the user tabs around inside the element
        this.addEventListener("focusin", this.onFocusIn);
        this.addEventListener("focusout", this.onFocusOut);
        this.render();
    }
    /**
     * Tears down the element.
     */
    disconnectedCallback() {
        this.$start.removeEventListener("focus", this.focusLastElement);
        this.$end.removeEventListener("focus", this.focusFirstElement);
        this.removeEventListener("focusin", this.onFocusIn);
        this.removeEventListener("focusout", this.onFocusOut);
    }
    /**
     * When the attributes changes we need to re-render the template.
     */
    attributeChangedCallback() {
        this.render();
    }
    /**
     * Focuses the first focusable element in the focus trap.
     */
    focusFirstElement() {
        this.trapFocus();
    }
    /**
     * Focuses the last focusable element in the focus trap.
     */
    focusLastElement() {
        this.trapFocus(true);
    }
    /**
     * Returns a list of the focusable children found within the element.
     */
    getFocusableElements() {
        return queryShadowRoot(this, isHidden, isFocusable);
    }
    /**
     * Focuses on either the last or first focusable element.
     * @param {boolean} trapToEnd
     */
    trapFocus(trapToEnd) {
        if (this.inactive)
            return;
        let focusableChildren = this.getFocusableElements();
        if (focusableChildren.length > 0) {
            if (trapToEnd) {
                focusableChildren[focusableChildren.length - 1].focus();
            }
            else {
                focusableChildren[0].focus();
            }
            this.$backup.setAttribute("tabindex", "-1");
        }
        else {
            // If there are no focusable children we need to focus on the backup
            // to trap the focus. This is a useful behavior if the focus trap is
            // for example used in a dialog and we don't want the user to tab
            // outside the dialog even though there are no focusable children
            // in the dialog.
            this.$backup.setAttribute("tabindex", "0");
            this.$backup.focus();
        }
    }
    /**
     * When the element gains focus this function is called.
     */
    onFocusIn() {
        this.updateFocused(true);
    }
    /**
     * When the element looses its focus this function is called.
     */
    onFocusOut() {
        this.updateFocused(false);
    }
    /**
     * Updates the focused property and updates the view.
     * The update is debounced because the focusin and focusout out
     * might fire multiple times in a row. We only want to render
     * the element once, therefore waiting until the focus is "stable".
     * @param value
     */
    updateFocused(value) {
        debounce(() => {
            if (this.focused !== value) {
                this._focused = value;
                this.render();
            }
        }, 0, this.debounceId);
    }
    /**
     * Updates the template.
     */
    render() {
        this.$start.setAttribute("tabindex", !this.focused || this.inactive ? `-1` : `0`);
        this.$end.setAttribute("tabindex", !this.focused || this.inactive ? `-1` : `0`);
        this.focused ? this.setAttribute("focused", "") : this.removeAttribute("focused");
    }
}
window.customElements.define("focus-trap", FocusTrap);

var getDefaultParent = function (originalTarget) {
    if (typeof document === 'undefined') {
        return null;
    }
    var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
    return sampleTarget.ownerDocument.body;
};
var counterMap = new WeakMap();
var uncontrolledNodes = new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function (node) {
    return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function (parent, targets) {
    return targets.map(function (target) {
        if (parent.contains(target)) {
            return target;
        }
        var correctedTarget = unwrapHost(target);
        if (correctedTarget && parent.contains(correctedTarget)) {
            return correctedTarget;
        }
        console.error('aria-hidden', target, 'in not contained inside', parent, '. Doing nothing');
        return null;
    }).filter(function (x) { return Boolean(x); });
};
/**
 * Marks everything except given node(or nodes) as aria-hidden
 * @param {Element | Element[]} originalTarget - elements to keep on the page
 * @param [parentNode] - top element, defaults to document.body
 * @param {String} [markerName] - a special attribute to mark every node
 * @param {String} [controlAttribute] - html Attribute to control
 * @return {Undo} undo command
 */
var applyAttributeToOthers = function (originalTarget, parentNode, markerName, controlAttribute) {
    var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    if (!markerMap[markerName]) {
        markerMap[markerName] = new WeakMap();
    }
    var markerCounter = markerMap[markerName];
    var hiddenNodes = [];
    var elementsToKeep = new Set();
    var elementsToStop = new Set(targets);
    var keep = function (el) {
        if (!el || elementsToKeep.has(el)) {
            return;
        }
        elementsToKeep.add(el);
        keep(el.parentNode);
    };
    targets.forEach(keep);
    var deep = function (parent) {
        if (!parent || elementsToStop.has(parent)) {
            return;
        }
        Array.prototype.forEach.call(parent.children, function (node) {
            if (elementsToKeep.has(node)) {
                deep(node);
            }
            else {
                var attr = node.getAttribute(controlAttribute);
                var alreadyHidden = attr !== null && attr !== 'false';
                var counterValue = (counterMap.get(node) || 0) + 1;
                var markerValue = (markerCounter.get(node) || 0) + 1;
                counterMap.set(node, counterValue);
                markerCounter.set(node, markerValue);
                hiddenNodes.push(node);
                if (counterValue === 1 && alreadyHidden) {
                    uncontrolledNodes.set(node, true);
                }
                if (markerValue === 1) {
                    node.setAttribute(markerName, 'true');
                }
                if (!alreadyHidden) {
                    node.setAttribute(controlAttribute, 'true');
                }
            }
        });
    };
    deep(parentNode);
    elementsToKeep.clear();
    lockCount++;
    return function () {
        hiddenNodes.forEach(function (node) {
            var counterValue = counterMap.get(node) - 1;
            var markerValue = markerCounter.get(node) - 1;
            counterMap.set(node, counterValue);
            markerCounter.set(node, markerValue);
            if (!counterValue) {
                if (!uncontrolledNodes.has(node)) {
                    node.removeAttribute(controlAttribute);
                }
                uncontrolledNodes.delete(node);
            }
            if (!markerValue) {
                node.removeAttribute(markerName);
            }
        });
        lockCount--;
        if (!lockCount) {
            // clear
            counterMap = new WeakMap();
            counterMap = new WeakMap();
            uncontrolledNodes = new WeakMap();
            markerMap = {};
        }
    };
};
/**
 * Marks everything except given node(or nodes) as aria-hidden
 * @param {Element | Element[]} originalTarget - elements to keep on the page
 * @param [parentNode] - top element, defaults to document.body
 * @param {String} [markerName] - a special attribute to mark every node
 * @return {Undo} undo command
 */
var hideOthers = function (originalTarget, parentNode, markerName) {
    if (markerName === void 0) { markerName = 'data-aria-hidden'; }
    var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    var activeParentNode = getDefaultParent(originalTarget);
    if (!activeParentNode) {
        return function () { return null; };
    }
    // we should not hide ariaLive elements - https://github.com/theKashey/aria-hidden/issues/10
    targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll('[aria-live]')));
    return applyAttributeToOthers(targets, activeParentNode, markerName, 'aria-hidden');
};

const tabworthyDatesModalCss = () => `:host::part(body){position:absolute;width:-moz-fit-content;width:fit-content;z-index:1200;margin-top:0.5rem}:host::part(backdrop){}:host::part(content){}`;

const InclusiveDatesModal = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.opened = createEvent(this, "opened", 7);
        this.closed = createEvent(this, "closed", 7);
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
};
InclusiveDatesModal.style = tabworthyDatesModalCss();

export { InclusiveDatesCalendar as tabworthy_dates_calendar, InclusiveDatesModal as tabworthy_dates_modal };
