import { h, Host } from "@stencil/core";
import { announce } from "@react-aria/live-announcer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { getISODateString, parseDateString, removeTimezoneOffset } from "../../../../shared/utils/utils";
import { chronoParseDate, chronoParseRange } from "../../../../shared/utils/chrono-parser/chrono-parser";
const defaultLabels = {
    selected: "selected",
    openCalendar: "Open calendar",
    calendar: "calendar",
    invalidDateError: "We could not find a matching date",
    minDateError: `Please fill in a date after `,
    maxDateError: `Please fill in a date before `,
    yearSelect: "Select year",
    rangeOutOfBoundsError: `Please enter a valid range of dates`,
    disabledDateError: `Please choose an available date`,
    to: "to",
    startDate: "Start date",
    quickSelection: "Quick selection"
};
export class TabworthyDates {
    constructor() {
        // Enable or disable range mode
        this.range = false;
        // Enable year-only mode (shows only year input, no calendar)
        this.yearOnly = false;
        // A label for the text field
        this.label = this.range
            ? "Choose a date range (any way you like)"
            : "Choose a date (any way you like)";
        // A placeholder for the text field
        this.placeholder = this.range
            ? `Try "June 8 to 12"`
            : `Try "tomorrow" or "in ten days"`;
        // Locale used for internal translations and date parsing
        this.locale = (navigator === null || navigator === void 0 ? void 0 : navigator.language) || "en-US";
        // If the datepicker is disabled
        this.disabled = false;
        // Which date to be displayed when calendar is first opened
        this.startDate = getISODateString(new Date());
        // Reference date used for Chrono date parsing. Equals "today"
        this.referenceDate = getISODateString(new Date());
        // Enable or disable strict Chrono date parsing
        this.useStrictDateParsing = false;
        // Labels used for internal translations
        this.datesLabels = defaultLabels;
        // Prevent hiding the calendar
        this.inline = false;
        // Current error state of the input field
        this.hasError = false;
        // Show or hide the next/previous year buttons
        this.showYearStepper = false;
        // Show or hide the next/previous month buttons
        this.showMonthStepper = true;
        // Show or hide the clear button
        this.showClearButton = true;
        // Show or hide the close button
        this.showCloseButton = false;
        // Show or hide the today button
        this.showTodayButton = true;
        // Enable or disable input field formatting for accepted dates (eg. "Tuesday May 2, 2021" instead of "2021-05-02")
        this.inputShouldFormat = true;
        // Show or hide the keyboard hints
        this.showKeyboardHint = false;
        // Function to disable individual dates
        this.disableDate = () => false;
        // Component name used to generate CSS classes
        this.elementClassName = "tabworthy-dates";
        // Which day that should start the week (0 is sunday, 1 is monday)
        this.firstDayOfWeek = 1; // Monday
        // Format for the value prop (input/output format). Defaults to ISO format (YYYY-MM-DD). Uses moment.js format tokens.
        this.format = "YYYY-MM-DD";
        // Quick buttons with dates displayed under the text field
        this.quickButtons = this.range
            ? ["Monday to Wednesday", "July 5 to 10"]
            : ["Yesterday", "Today", "Tomorrow", "In 10 days"];
        // Show or hide the quick buttons
        this.showQuickButtons = true;
        this.disableFreeformInput = false;
        this.inputClass = "";
        this.errorState = this.hasError;
        this.disabledState = this.disabled;
        this.chronoSupportedLocale = ["en", "ja", "fr", "nl", "ru", "pt"].includes(this.locale.slice(0, 2));
        this.errorMessage = "";
        this.handleCalendarButtonClick = async () => {
            var _a, _b, _c, _d, _e;
            await customElements.whenDefined("tabworthy-dates-modal");
            // Use input container as trigger for proper dropdown alignment
            this.inputContainerRef &&
                (await ((_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.setTriggerElement(this.inputContainerRef)));
            if ((await ((_b = this.modalRef) === null || _b === void 0 ? void 0 : _b.getState())) === false)
                await ((_c = this.modalRef) === null || _c === void 0 ? void 0 : _c.open());
            else if ((await ((_d = this.modalRef) === null || _d === void 0 ? void 0 : _d.getState())) === true)
                await ((_e = this.modalRef) === null || _e === void 0 ? void 0 : _e.close());
        };
        this.handleQuickButtonClick = async (event) => {
            var _a;
            const parser = this.range ? chronoParseRange : chronoParseDate;
            const parsedDate = await parser(event.target.innerText, {
                locale: this.locale.slice(0, 2),
                minDate: this.minDate,
                maxDate: this.maxDate,
                referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
            });
            if (parsedDate) {
                // Single date
                if (parsedDate.value instanceof Date) {
                    this.updateValue(parsedDate.value);
                    if (document.activeElement !== this.inputRef) {
                        this.formatInput(true, false);
                    }
                }
                else {
                    // Date range
                    const newValue = [];
                    if (((_a = parsedDate.value) === null || _a === void 0 ? void 0 : _a.start) instanceof Date) {
                        newValue.push(parsedDate.value.start);
                    }
                    if (parsedDate.value && parsedDate.value.end instanceof Date)
                        newValue.push(parsedDate.value.end);
                    this.updateValue(newValue);
                    this.formatInput(true, false);
                }
            }
        };
        this.handleChangedMonths = (newMonth) => {
            announce(`${Intl.DateTimeFormat(this.locale, {
                month: "long",
                year: "numeric"
            }).format(removeTimezoneOffset(new Date(`${newMonth.year}-${newMonth.month}`)))}`, "assertive");
        };
        this.handleYearChange = (yearDetail) => {
            var _a;
            (_a = this.changeYear) === null || _a === void 0 ? void 0 : _a.emit(yearDetail);
        };
        this.handleYearInputChange = (event) => {
            var _a;
            const year = +event.target.value;
            if (!year || isNaN(year))
                return;
            const minYear = this.minDate ? parseInt(this.minDate.slice(0, 4), 10) : 1;
            const maxYear = this.maxDate
                ? parseInt(this.maxDate.slice(0, 4), 10)
                : 9999;
            if (year < minYear || year > maxYear)
                return;
            const newValue = dayjs().year(year).startOf("year").format(this.format);
            this.internalValue = newValue;
            this.value = newValue;
            (_a = this.changeYear) === null || _a === void 0 ? void 0 : _a.emit({ year });
            this.selectDate.emit(newValue);
        };
        this.handleRangeChange = async (value) => {
            this.errorState = false;
            if (value.length === 0) {
                this.internalValue = "";
                if (this.pickerRef) {
                    this.pickerRef.value = null;
                }
                this.value = this.internalValue;
                return this.selectDate.emit(this.internalValue);
            }
            const parsedRange = await chronoParseRange(value, {
                locale: this.locale.slice(0, 2),
                minDate: this.minDate,
                maxDate: this.maxDate,
                referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
            });
            const newValue = [];
            if ((parsedRange === null || parsedRange === void 0 ? void 0 : parsedRange.value) && parsedRange.value.start instanceof Date)
                newValue.push(parsedRange.value.start);
            if ((parsedRange === null || parsedRange === void 0 ? void 0 : parsedRange.value) && parsedRange.value.end instanceof Date)
                newValue.push(parsedRange.value.end);
            this.updateValue(newValue);
            this.formatInput(true, false);
            if (newValue.length === 0) {
                this.errorState = true;
                if (!!(parsedRange === null || parsedRange === void 0 ? void 0 : parsedRange.reason)) {
                    this.errorMessage = {
                        invalid: this.datesLabels.invalidDateError,
                        rangeOutOfBounds: this.datesLabels.rangeOutOfBoundsError,
                        minDate: "",
                        maxDate: ""
                    }[parsedRange.reason];
                }
                this.emitErrorChange(parsedRange === null || parsedRange === void 0 ? void 0 : parsedRange.reason, this.errorMessage);
            }
        };
        this.handleSingleDateChange = async (value) => {
            this.errorState = false;
            if (value.length === 0) {
                this.internalValue = "";
                if (this.pickerRef) {
                    this.pickerRef.value = null;
                }
                this.value = this.internalValue;
                return this.selectDate.emit(this.internalValue);
            }
            // Try strict format parsing first to avoid DD/MM vs MM/DD ambiguity
            const strictParsed = dayjs(value, this.format, true);
            if (strictParsed.isValid()) {
                const date = strictParsed.toDate();
                if (!this.isPickedDateValid(date))
                    return;
                this.updateValue(date);
                this.formatInput(true, false);
                return;
            }
            const parsedDate = await chronoParseDate(value, {
                locale: this.locale.slice(0, 2),
                minDate: this.minDate,
                maxDate: this.maxDate,
                referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
            });
            if (parsedDate && parsedDate.value instanceof Date) {
                if (this.disableDate(parsedDate.value)) {
                    this.errorState = true;
                    this.errorMessage = this.datesLabels.disabledDateError;
                    this.emitErrorChange("disabledDate", this.errorMessage);
                }
                else {
                    this.updateValue(parsedDate.value);
                    this.formatInput(true, false);
                }
            }
            else if (parsedDate) {
                this.errorState = true;
                this.internalValue = null;
                let maxDate = undefined;
                let minDate = undefined;
                if (this.maxDate) {
                    maxDate = this.maxDate ? parseDateString(this.maxDate) : undefined;
                    maxDate === null || maxDate === void 0 ? void 0 : maxDate.setDate(maxDate.getDate() + 1);
                }
                if (this.minDate) {
                    minDate = this.minDate ? parseDateString(this.minDate) : undefined;
                    minDate === null || minDate === void 0 ? void 0 : minDate.setDate(minDate.getDate() - 1);
                }
                if (!!parsedDate.reason) {
                    const formatLocalizedDate = (date) => Intl.DateTimeFormat(this.locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }).format(date);
                    this.errorMessage = parsedDate.reason;
                    this.errorMessage = {
                        minDate: minDate
                            ? `${this.datesLabels.minDateError} ${formatLocalizedDate(minDate)}`
                            : "",
                        maxDate: maxDate
                            ? `${this.datesLabels.maxDateError} ${formatLocalizedDate(maxDate)}`
                            : "",
                        invalid: this.datesLabels.invalidDateError
                    }[parsedDate.reason];
                }
                this.emitErrorChange(parsedDate === null || parsedDate === void 0 ? void 0 : parsedDate.reason, this.errorMessage);
            }
        };
        this.handleChange = async (event) => {
            const value = event.target.value;
            if (this.range) {
                await this.handleRangeChange(value);
            }
            else {
                await this.handleSingleDateChange(value);
            }
        };
    }
    shouldInputFormat() {
        if (typeof this.inputShouldFormat === "string") {
            return this.inputShouldFormat === "true";
        }
        return !!this.inputShouldFormat;
    }
    componentDidLoad() {
        this.syncFromValueProp(this.value);
        this.componentReady.emit();
        if (!this.id) {
            console.error('tabworthy-dates: The "id" prop is required for accessibility');
        }
        if (!this.chronoSupportedLocale)
            console.warn(`tabworthy-dates: The chosen locale "${this.locale}" is not supported by Chrono.js. Date parsing has been disabled`);
    }
    // External method to parse text string using Chrono.js and (optionally) set as value.
    async parseDate(text, shouldSetValue = true, chronoOptions = undefined) {
        const parsedDate = await chronoParseDate(text, Object.assign({ locale: this.locale.slice(0, 2), minDate: this.minDate, maxDate: this.minDate, referenceDate: removeTimezoneOffset(new Date(this.referenceDate)) }, chronoOptions));
        if (shouldSetValue) {
            if (parsedDate && parsedDate.value instanceof Date) {
                this.updateValue(parsedDate.value);
            }
            else
                this.errorState = true;
        }
        return {
            value: parsedDate && parsedDate.value instanceof Date
                ? dayjs(parsedDate.value).format(this.format)
                : undefined,
            reason: parsedDate && parsedDate.reason ? parsedDate.reason : undefined
        };
    }
    // @ts-ignore
    isRangeValue(value) {
        if (Array.isArray(value) &&
            new Date(value[0]) instanceof Date &&
            new Date(value[1]) instanceof Date)
            return !!this.range;
    }
    updateValue(newValue) {
        // Range
        if (Array.isArray(newValue)) {
            this.internalValue = newValue.map((date) => dayjs(date).format(this.format));
        }
        // Single
        else {
            this.internalValue = dayjs(newValue).format(this.format);
        }
        if (this.pickerRef) {
            this.pickerRef.value = newValue;
        }
        this.errorState = false;
        this.value = this.internalValue;
        this.selectDate.emit(this.internalValue);
        this.announceDateChange(this.internalValue);
    }
    emitErrorChange(reason, message) {
        this.errorChange.emit({ reason, message });
    }
    formatInput(enabled, useInputValue = true) {
        if (this.shouldInputFormat() === false || enabled === false) {
            if (this.internalValue) {
                if (this.internalValue.length === 0)
                    return;
                this.inputRef.value = this.internalValue
                    .toString()
                    .replace(",", ` ${this.datesLabels.to} `);
            }
            return;
        }
        if (this.internalValue &&
            this.shouldInputFormat() === true &&
            this.errorState === false) {
            if (Array.isArray(this.internalValue)) {
                if (this.internalValue.length === 0)
                    return; // Range date is invalid, leave the text field as is
                let output = "";
                this.internalValue.forEach((value, index) => {
                    const parsedDate = dayjs(useInputValue ? this.inputRef.value : value, this.format, true);
                    const dateToFormat = parsedDate.isValid()
                        ? parsedDate.toDate()
                        : removeTimezoneOffset(new Date(useInputValue ? this.inputRef.value : value));
                    return (output += `${index === 1 ? ` ${this.datesLabels.to} ` : ""}${Intl.DateTimeFormat(this.locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }).format(dateToFormat)}`);
                });
                this.inputRef.value = output;
            }
            else {
                const parsedDate = dayjs(useInputValue ? this.inputRef.value : this.internalValue, this.format, true);
                const dateToFormat = parsedDate.isValid()
                    ? parsedDate.toDate()
                    : removeTimezoneOffset(new Date(useInputValue ? this.inputRef.value : this.internalValue));
                this.inputRef.value = Intl.DateTimeFormat(this.locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }).format(dateToFormat);
            }
        }
    }
    isPickedDateValid(dateString) {
        const parsed = dayjs(dateString);
        if (!parsed.isValid())
            return false;
        const isoDate = typeof dateString === "string" ? dateString : parsed.format("YYYY-MM-DD");
        if (this.minDate && isoDate < this.minDate) {
            this.errorState = true;
            this.errorMessage = `${this.datesLabels.minDateError} ${this.minDate}`;
            this.emitErrorChange("minDate", this.errorMessage);
            return false;
        }
        if (this.maxDate && isoDate > this.maxDate) {
            this.errorState = true;
            this.errorMessage = `${this.datesLabels.maxDateError} ${this.maxDate}`;
            this.emitErrorChange("maxDate", this.errorMessage);
            return false;
        }
        if (this.disableDate(parsed.toDate())) {
            this.errorState = true;
            this.errorMessage = this.datesLabels.disabledDateError;
            this.emitErrorChange("disabledDate", this.errorMessage);
            return false;
        }
        return true;
    }
    handlePickerSelection(newValue) {
        var _a, _b;
        if (this.isRangeValue(newValue)) {
            // Validate each date in the range
            if (newValue.some((date) => !this.isPickedDateValid(date)))
                return;
            if (newValue.length === 2)
                (_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.close();
            // Convert ISO dates to specified format
            this.internalValue = newValue.map((date) => dayjs(date).format(this.format));
            this.errorState = false;
            if (document.activeElement !== this.inputRef) {
                this.formatInput(true, false);
            }
            this.announceDateChange(this.internalValue);
        }
        else {
            // Validate the single date
            if (newValue && !this.isPickedDateValid(newValue))
                return;
            (_b = this.modalRef) === null || _b === void 0 ? void 0 : _b.close();
            // Convert ISO date to specified format
            const formattedDate = newValue
                ? dayjs(newValue).format(this.format)
                : "";
            this.inputRef.value = formattedDate;
            this.internalValue = formattedDate;
            this.errorState = false;
            if (document.activeElement !== this.inputRef) {
                this.formatInput(true, false);
            }
            this.announceDateChange(this.internalValue);
        }
        this.value = this.internalValue;
        this.selectDate.emit(this.internalValue);
    }
    announceDateChange(newValue) {
        if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
            return;
        }
        const newValueInIsoFormat = Array.isArray(newValue)
            ? newValue.map((date) => dayjs(date, this.format).toISOString())
            : dayjs(newValue, this.format).toISOString();
        let content = "";
        if (Array.isArray(newValueInIsoFormat)) {
            if (newValueInIsoFormat.length === 1) {
                content += `${this.datesLabels.startDate} `;
            }
            newValueInIsoFormat.forEach((value, index) => (content += `${index === 1 ? ` ${this.datesLabels.to} ` : ""}${Intl.DateTimeFormat(this.locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(removeTimezoneOffset(new Date(value)))}`));
        }
        else
            content = Intl.DateTimeFormat(this.locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(removeTimezoneOffset(new Date(newValueInIsoFormat)));
        if (content.length === 0)
            return;
        content += ` ${this.datesLabels.selected}`;
        const contentNoCommas = content.replace(/\,/g, "");
        announce(contentNoCommas, "polite");
    }
    watchDisabled(newValue) {
        this.disabledState = newValue;
    }
    watchValue(newValue) {
        this.syncFromValueProp(newValue);
    }
    getClassName(element) {
        return Boolean(element)
            ? `${this.elementClassName}__${element}`
            : this.elementClassName;
    }
    syncFromValueProp(value) {
        this.internalValue = value;
        // update calendar (expects Date or Date[])
        if (this.pickerRef) {
            if (Array.isArray(value)) {
                const dates = value.reduce((acc, v) => {
                    const d = dayjs(v, this.format, true);
                    if (d.isValid())
                        acc.push(d.toDate());
                    return acc;
                }, []);
                this.pickerRef.value = dates.length ? dates : null;
            }
            else {
                if (value) {
                    const parsedDate = dayjs(value, this.format, true);
                    if (parsedDate.isValid()) {
                        this.pickerRef.value = parsedDate.toDate();
                    }
                }
                else {
                    this.pickerRef.value = null;
                }
            }
        }
        if (!value) {
            this.inputRef.value = "";
        }
        // update text input (useInputValue=false so it formats from internalValue, not from input's current text)
        if (this.inputRef && value) {
            this.formatInput(!!this.shouldInputFormat(), false);
        }
    }
    render() {
        var _a;
        // Year-only mode: show just a year number input
        if (this.yearOnly) {
            const currentYear = this.value
                ? parseInt(String(this.value).slice(0, 4), 10)
                : new Date().getFullYear();
            return (h(Host, null, h("label", { htmlFor: this.id ? `${this.id}-input` : undefined, class: this.getClassName("label") }, this.label), h("br", null), h("div", { class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, h("input", { "aria-label": this.datesLabels.yearSelect, class: {
                    [this.getClassName("year-select")]: true,
                    [this.getClassName("input")]: true,
                    [this.inputClass]: !!this.inputClass
                }, "aria-disabled": this.disabledState, disabled: this.disabledState, max: this.maxDate ? this.maxDate.slice(0, 4) : 9999, min: this.minDate ? this.minDate.slice(0, 4) : 1, name: "year", id: this.id ? `${this.id}-input` : undefined, onChange: this.handleYearInputChange, type: "number", value: currentYear, "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState })), this.errorState && (h("div", { class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
        }
        return (h(Host, null, h("label", { htmlFor: this.id ? `${this.id}-input` : undefined, class: this.getClassName("label") }, this.label), h("br", null), h("div", { class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, h("input", { disabled: this.disabledState || this.disableFreeformInput, id: this.id ? `${this.id}-input` : undefined, type: "text", placeholder: this.placeholder, class: {
                [this.getClassName("input")]: true,
                [this.inputClass]: !!this.inputClass
            }, ref: (r) => (this.inputRef = r), onChange: this.handleChange, onFocus: () => this.formatInput(false), onBlur: () => this.formatInput(true, false), "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState }), !this.inline && (h("button", { type: "button", onClick: this.handleCalendarButtonClick, class: this.getClassName("calendar-button"), disabled: this.disabledState, "aria-label": this.calendarButtonContent
                ? this.datesLabels.openCalendar
                : undefined }, this.calendarButtonContent ? (h("span", { innerHTML: this.calendarButtonContent })) : (this.datesLabels.openCalendar)))), h("tabworthy-dates-modal", { label: this.datesLabels.calendar, ref: (el) => (this.modalRef = el), onOpened: () => {
                if (!this.pickerRef)
                    return;
                this.pickerRef.modalIsOpen = true;
            }, onClosed: () => {
                if (!this.pickerRef)
                    return;
                this.pickerRef.modalIsOpen = false;
            }, inline: this.inline, appendTo: this.appendTo }, h("tabworthy-dates-calendar", { range: this.range, locale: this.locale, onSelectDate: (event) => this.handlePickerSelection(event.detail), onChangeMonth: (event) => this.handleChangedMonths(event.detail), onChangeYear: (event) => this.handleYearChange(event.detail), onRequestClose: () => { var _a; return (_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.close(); }, labels: this.datesCalendarLabels ? this.datesCalendarLabels : undefined, ref: (el) => (this.pickerRef = el), startDate: this.startDate, firstDayOfWeek: this.firstDayOfWeek, showHiddenTitle: true, disabled: this.disabledState, showMonthStepper: this.showMonthStepper, showYearStepper: this.showYearStepper, showClearButton: this.showClearButton, showCloseButton: this.showCloseButton, showKeyboardHint: this.showKeyboardHint, showTodayButton: this.showTodayButton, disableDate: this.disableDate, minDate: this.minDate, maxDate: this.maxDate, inline: this.inline, nextMonthButtonContent: this.nextMonthButtonContent, nextYearButtonContent: this.nextYearButtonContent, previousMonthButtonContent: this.previousMonthButtonContent, previousYearButtonContent: this.previousYearButtonContent, todayButtonContent: this.todayButtonContent, clearButtonContent: this.clearButtonContent, closeButtonContent: this.closeButtonContent })), this.showQuickButtons &&
            ((_a = this.quickButtons) === null || _a === void 0 ? void 0 : _a.length) > 0 &&
            this.chronoSupportedLocale && (h("div", { class: this.getClassName("quick-group"), role: "group", "aria-label": this.datesLabels.quickSelection }, this.quickButtons.map((buttonText) => {
            return (h("button", { class: this.getClassName("quick-button"), onClick: this.handleQuickButtonClick, disabled: this.disabledState, type: "button" }, buttonText));
        }))), this.errorState && (h("div", { class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
    }
    static get is() { return "tabworthy-dates"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() {
        return {
            "$": ["tabworthy-dates.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["tabworthy-dates.css"]
        };
    }
    static get properties() {
        return {
            "id": {
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
                "reflect": true,
                "attribute": "id"
            },
            "value": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "string | string[]",
                    "resolved": "string | string[]",
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
                "attribute": "value"
            },
            "range": {
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
                "attribute": "range",
                "defaultValue": "false"
            },
            "yearOnly": {
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
                "attribute": "year-only",
                "defaultValue": "false"
            },
            "label": {
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
                "attribute": "label",
                "defaultValue": "this.range\n    ? \"Choose a date range (any way you like)\"\n    : \"Choose a date (any way you like)\""
            },
            "placeholder": {
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
                "attribute": "placeholder",
                "defaultValue": "this.range\n    ? `Try \"June 8 to 12\"`\n    : `Try \"tomorrow\" or \"in ten days\"`"
            },
            "locale": {
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
                "attribute": "locale",
                "defaultValue": "navigator?.language || \"en-US\""
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
            "minDate": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "min-date"
            },
            "maxDate": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "max-date"
            },
            "startDate": {
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
                "attribute": "start-date",
                "defaultValue": "getISODateString(new Date())"
            },
            "referenceDate": {
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
                "attribute": "reference-date",
                "defaultValue": "getISODateString(new Date())"
            },
            "useStrictDateParsing": {
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
                "attribute": "use-strict-date-parsing",
                "defaultValue": "false"
            },
            "datesLabels": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "DatesLabels",
                    "resolved": "DatesLabels",
                    "references": {
                        "DatesLabels": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-dates/tabworthy-dates.tsx",
                            "id": "src/components/tabworthy-dates/tabworthy-dates.tsx::DatesLabels"
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
            "datesCalendarLabels": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "DatesCalendarLabels",
                    "resolved": "{ clearButton: string; closeButton: string; monthSelect: string; nextMonthButton: string; nextYearButton: string; picker: string; previousMonthButton: string; previousYearButton: string; todayButton: string; yearSelect: string; keyboardHint: string; selected: string; chooseAsStartDate: string; chooseAsEndDate: string; }",
                    "references": {
                        "DatesCalendarLabels": {
                            "location": "import",
                            "path": "../tabworthy-dates-calendar/tabworthy-dates-calendar",
                            "id": "src/components/tabworthy-dates-calendar/tabworthy-dates-calendar.tsx::DatesCalendarLabels",
                            "referenceLocation": "DatesCalendarLabels"
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
            "inline": {
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
                "attribute": "inline",
                "defaultValue": "false"
            },
            "hasError": {
                "type": "boolean",
                "mutable": true,
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
                "attribute": "has-error",
                "defaultValue": "false"
            },
            "nextMonthButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "next-month-button-content"
            },
            "nextYearButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "next-year-button-content"
            },
            "previousMonthButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "previous-month-button-content"
            },
            "previousYearButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "previous-year-button-content"
            },
            "showYearStepper": {
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
                "attribute": "show-year-stepper",
                "defaultValue": "false"
            },
            "showMonthStepper": {
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
                "attribute": "show-month-stepper",
                "defaultValue": "true"
            },
            "showClearButton": {
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
                "attribute": "show-clear-button",
                "defaultValue": "true"
            },
            "showCloseButton": {
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
                "attribute": "show-close-button",
                "defaultValue": "false"
            },
            "showTodayButton": {
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
                "attribute": "show-today-button",
                "defaultValue": "true"
            },
            "inputShouldFormat": {
                "type": "any",
                "mutable": false,
                "complexType": {
                    "original": "| boolean\n    | string",
                    "resolved": "boolean | string",
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
                "attribute": "input-should-format",
                "defaultValue": "true"
            },
            "showKeyboardHint": {
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
                "attribute": "show-keyboard-hint",
                "defaultValue": "false"
            },
            "disableDate": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "HTMLTabworthyDatesCalendarElement[\"disableDate\"]",
                    "resolved": "(date: Date) => boolean",
                    "references": {
                        "HTMLTabworthyDatesCalendarElement": {
                            "location": "global",
                            "id": "global::HTMLTabworthyDatesCalendarElement"
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
                "defaultValue": "() =>\n    false"
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
                "defaultValue": "\"tabworthy-dates\""
            },
            "firstDayOfWeek": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
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
                "attribute": "first-day-of-week",
                "defaultValue": "1"
            },
            "format": {
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
                "attribute": "format",
                "defaultValue": "\"YYYY-MM-DD\""
            },
            "quickButtons": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "string[]",
                    "resolved": "string[]",
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
                "defaultValue": "this.range\n    ? [\"Monday to Wednesday\", \"July 5 to 10\"]\n    : [\"Yesterday\", \"Today\", \"Tomorrow\", \"In 10 days\"]"
            },
            "todayButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "today-button-content"
            },
            "clearButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "clear-button-content"
            },
            "closeButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "close-button-content"
            },
            "calendarButtonContent": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
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
                "attribute": "calendar-button-content"
            },
            "showQuickButtons": {
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
                "attribute": "show-quick-buttons",
                "defaultValue": "true"
            },
            "disableFreeformInput": {
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
                "attribute": "disable-freeform-input",
                "defaultValue": "false"
            },
            "inputClass": {
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
                "attribute": "input-class",
                "defaultValue": "\"\""
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
                    "text": "Element to append the dropdown to. Use \"body\" to append to document.body,\nor pass a CSS selector or HTMLElement. Useful for escaping overflow:hidden containers."
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
            "internalValue": {},
            "errorState": {},
            "disabledState": {}
        };
    }
    static get events() {
        return [{
                "method": "selectDate",
                "name": "selectDate",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string | string[] | undefined",
                    "resolved": "string | string[]",
                    "references": {}
                }
            }, {
                "method": "changeYear",
                "name": "changeYear",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "YearChangedEventDetails",
                    "resolved": "YearChangedEventDetails",
                    "references": {
                        "YearChangedEventDetails": {
                            "location": "import",
                            "path": "../tabworthy-dates-calendar/tabworthy-dates-calendar",
                            "id": "src/components/tabworthy-dates-calendar/tabworthy-dates-calendar.tsx::YearChangedEventDetails",
                            "referenceLocation": "YearChangedEventDetails"
                        }
                    }
                }
            }, {
                "method": "errorChange",
                "name": "errorChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "ErrorChangeEventDetails",
                    "resolved": "ErrorChangeEventDetails",
                    "references": {
                        "ErrorChangeEventDetails": {
                            "location": "local",
                            "path": "/home/runner/work/tabworthy-components/tabworthy-components/src/components/tabworthy-dates/tabworthy-dates.tsx",
                            "id": "src/components/tabworthy-dates/tabworthy-dates.tsx::ErrorChangeEventDetails"
                        }
                    }
                }
            }, {
                "method": "componentReady",
                "name": "componentReady",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }];
    }
    static get methods() {
        return {
            "parseDate": {
                "complexType": {
                    "signature": "(text: string, shouldSetValue?: boolean, chronoOptions?: ChronoOptions | undefined) => Promise<ChronoParsedDateString>",
                    "parameters": [{
                            "name": "text",
                            "type": "string",
                            "docs": ""
                        }, {
                            "name": "shouldSetValue",
                            "type": "boolean",
                            "docs": ""
                        }, {
                            "name": "chronoOptions",
                            "type": "ChronoOptions",
                            "docs": ""
                        }],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        },
                        "ChronoParsedDateString": {
                            "location": "import",
                            "path": "@shared/utils/chrono-parser/chrono-parser.type",
                            "id": "shared/utils/chrono-parser/chrono-parser.type.ts::ChronoParsedDateString",
                            "referenceLocation": "ChronoParsedDateString"
                        },
                        "ChronoOptions": {
                            "location": "import",
                            "path": "@shared/utils/chrono-parser/chrono-parser.type",
                            "id": "shared/utils/chrono-parser/chrono-parser.type.ts::ChronoOptions",
                            "referenceLocation": "ChronoOptions"
                        }
                    },
                    "return": "Promise<ChronoParsedDateString>"
                },
                "docs": {
                    "text": "",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "disabled",
                "methodName": "watchDisabled"
            }, {
                "propName": "value",
                "methodName": "watchValue"
            }];
    }
}
