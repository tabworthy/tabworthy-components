'use strict';

var index = require('./index-B1s0tI-Z.js');
var customParseFormat = require('./customParseFormat-l09KVyWD.js');
var utils = require('./utils-DGbdK8VF.js');

var localizedFormat$2 = {exports: {}};

var localizedFormat$1 = localizedFormat$2.exports;

var hasRequiredLocalizedFormat;

function requireLocalizedFormat () {
	if (hasRequiredLocalizedFormat) return localizedFormat$2.exports;
	hasRequiredLocalizedFormat = 1;
	(function (module, exports) {
		!function(e,t){module.exports=t();}(localizedFormat$1,(function(){var e={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(t,o,n){var r=o.prototype,i=r.format;n.en.formats=e,r.format=function(t){ void 0===t&&(t="YYYY-MM-DDTHH:mm:ssZ");var o=this.$locale().formats,n=function(t,o){return t.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,n,r){var i=r&&r.toUpperCase();return n||o[r]||e[r]||o[i].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,o){return t||o.slice(1)}))}))}(t,void 0===o?{}:o);return i.call(this,n)};}})); 
	} (localizedFormat$2));
	return localizedFormat$2.exports;
}

var localizedFormatExports = requireLocalizedFormat();
var localizedFormat = /*@__PURE__*/customParseFormat.getDefaultExportFromCjs(localizedFormatExports);

customParseFormat.dayjs.extend(customParseFormat.customParseFormat);
customParseFormat.dayjs.extend(localizedFormat);
const defaultLabels = {
    selected: "selected",
    openCalendar: "Choose time",
    calendar: "date and time picker",
    invalidDateError: "We could not find a matching date",
    minDateError: `Please fill in a date after `,
    maxDateError: `Please fill in a date before `,
    rangeOutOfBoundsError: `Please enter a valid range of dates`,
    disabledDateError: `Please choose an available date`,
    to: "to",
    startDate: "Start date",
    timeLabel: "Time"
};
const TabworthyTimes = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.selectDateTime = index.createEvent(this, "selectDateTime", 7);
        this.changeYear = index.createEvent(this, "changeYear", 7);
        this.errorChange = index.createEvent(this, "errorChange", 7);
        this.componentReady = index.createEvent(this, "componentReady", 7);
        // Enable or disable range mode
        this.range = false;
        // Show only the time picker, without the calendar
        this.timeOnly = false;
        // A label for the text field
        this.label = "Choose a date and time";
        // A placeholder for the text field
        this.placeholder = "";
        // Locale used for internal translations and date parsing
        this.locale = (navigator === null || navigator === void 0 ? void 0 : navigator.language) || "en-US";
        // If the datetime picker is disabled
        this.disabled = false;
        // Which date to be displayed when calendar is first opened
        this.startDate = utils.getISODateString(new Date());
        // Reference date used for Chrono date parsing. Equals "today"
        this.referenceDate = utils.getISODateString(new Date());
        // Use 12-hour format with AM/PM
        this.useTwelveHourFormat = true;
        // Show seconds picker control
        this.showSeconds = false;
        // Labels used for internal translations
        this.timesLabels = defaultLabels;
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
        // Function to disable individual dates
        this.disableDate = () => false;
        // Component name used to generate CSS classes
        this.elementClassName = "tabworthy-times";
        // Which day that should start the week (0 is sunday, 1 is monday)
        this.firstDayOfWeek = 1;
        // Format for the value prop (input/output format). Defaults to ISO 8601 format.
        this.format = "YYYY-MM-DDTHH:mm:ss";
        // If true, format input on blur/accept (like dates)
        this.inputShouldFormat = true;
        this.disableFreeformInput = false;
        this.inputClass = "";
        this.selectedHours = new Date().getHours();
        this.selectedMinutes = new Date().getMinutes();
        this.selectedSeconds = new Date().getSeconds();
        this.errorState = this.hasError;
        this.disabledState = this.disabled;
        this.errorMessage = "";
        this.handlePickerSelection = async (dateString) => {
            // Handle clear button click (calendar emits undefined)
            if (!dateString) {
                return this.clearValue();
            }
            const dates = dateString.split(",");
            if (this.range && dates.length === 2) {
                const startDate = utils.removeTimezoneOffset(new Date(dates[0]));
                const endDate = utils.removeTimezoneOffset(new Date(dates[1]));
                if (!this.isDateValid(startDate) || !this.isDateValid(endDate))
                    return;
                this.updateValue([startDate, endDate]);
                // Update calendar with selected dates
                if (this.pickerRef) {
                    this.pickerRef.value = [startDate, endDate];
                }
            }
            else {
                const date = utils.removeTimezoneOffset(new Date(dates[0]));
                if (!this.isDateValid(date))
                    return;
                // Clamp time to boundary constraints when selecting a boundary day
                this.clampTimeToBounds(date);
                this.updateValue(date);
                // Reset then set calendar value so re-clicking the same date still emits
                if (this.pickerRef) {
                    this.pickerRef.value = undefined;
                    this.pickerRef.value = date;
                }
            }
        };
        this.handleTimeChange = (event) => {
            this.selectedHours = event.detail.hours;
            this.selectedMinutes = event.detail.minutes;
            if (event.detail.seconds !== undefined) {
                this.selectedSeconds = event.detail.seconds;
            }
            // Update the value if we have a selected date
            if (this.selectedDate) {
                this.updateValue(this.selectedDate);
            }
            else if (this.timeOnly) {
                this.updateValue(this.getDateForTimeOnlyValue());
            }
        };
        this.handleCalendarButtonClick = async () => {
            if (this.modalRef) {
                // Use input container as trigger for proper dropdown alignment
                await this.modalRef.setTriggerElement(this.inputContainerRef);
                await this.modalRef.open();
            }
        };
        this.handleYearChange = (eventDetail) => {
            if (this.changeYear) {
                this.changeYear.emit(eventDetail);
            }
        };
        this.handleChangedMonths = (_eventDetail) => {
            // Can be used for month change tracking
        };
        this.handleInputBlur = () => {
            if (this.shouldInputFormat()) {
                this.formatInput();
            }
        };
        this.handleInputChange = (event) => {
            const value = event.target.value;
            // Handle empty input
            if (value.length === 0) {
                this.errorState = false;
                this.internalValue = "";
                if (this.pickerRef) {
                    this.pickerRef.value = null;
                }
                this.value = this.internalValue;
                return this.selectDateTime.emit(this.internalValue);
            }
            // Try to parse the input value using the component's format first (strict mode)
            // This prevents dayjs from misinterpreting date formats (e.g., DD/MM/YYYY as MM/DD/YYYY)
            let parsed = customParseFormat.dayjs(value, this.format, true);
            // Fall back to loose parsing if strict format doesn't match
            if (!parsed.isValid()) {
                parsed = customParseFormat.dayjs(value);
            }
            if (parsed.isValid()) {
                // Check minDate/maxDate bounds (supports both date-only and datetime strings)
                if (this.minDate && parsed.isBefore(customParseFormat.dayjs(this.minDate))) {
                    this.errorState = true;
                    this.errorMessage = `${this.timesLabels.minDateError} ${this.formatBoundaryDate(this.minDate)}`;
                    this.emitErrorChange("minDate", this.errorMessage);
                    return;
                }
                if (this.maxDate && parsed.isAfter(customParseFormat.dayjs(this.maxDate))) {
                    this.errorState = true;
                    this.errorMessage = `${this.timesLabels.maxDateError} ${this.formatBoundaryDate(this.maxDate)}`;
                    this.emitErrorChange("maxDate", this.errorMessage);
                    return;
                }
                if (this.disableDate(parsed.toDate())) {
                    this.errorState = true;
                    this.errorMessage = this.timesLabels.disabledDateError;
                    this.emitErrorChange("disabledDate", this.errorMessage);
                    return;
                }
                this.errorState = false;
                this.selectedHours = parsed.hour();
                this.selectedMinutes = parsed.minute();
                this.selectedSeconds = parsed.second();
                this.updateValue(parsed.toDate());
            }
            else {
                // Set error state for invalid/garbage input
                this.errorState = true;
                this.errorMessage = this.timesLabels.invalidDateError;
                this.emitErrorChange("invalid", this.errorMessage);
            }
        };
    }
    emitErrorChange(reason, message) {
        this.errorChange.emit({ reason, message });
    }
    formatBoundaryDate(dateString) {
        const parsed = customParseFormat.dayjs(dateString);
        if (!parsed.isValid())
            return dateString;
        const hasTime = dateString.includes("T") || dateString.includes(" ");
        if (!hasTime) {
            return Intl.DateTimeFormat(this.locale, {
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(parsed.toDate());
        }
        const options = Object.assign({ day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" }, (this.showSeconds ? { second: "numeric" } : {}));
        return Intl.DateTimeFormat(this.locale, options).format(parsed.toDate());
    }
    getEffectiveMinTime() {
        if (!this.minDate || !this.selectedDate)
            return undefined;
        const min = customParseFormat.dayjs(this.minDate);
        const sel = customParseFormat.dayjs(this.selectedDate);
        if (!min.isValid() || !sel.isSame(min, "day"))
            return undefined;
        return {
            hours: min.hour(),
            minutes: min.minute(),
            seconds: min.second()
        };
    }
    getEffectiveMaxTime() {
        if (!this.maxDate || !this.selectedDate)
            return undefined;
        const max = customParseFormat.dayjs(this.maxDate);
        const sel = customParseFormat.dayjs(this.selectedDate);
        if (!max.isValid() || !sel.isSame(max, "day"))
            return undefined;
        return {
            hours: max.hour(),
            minutes: max.minute(),
            seconds: max.second()
        };
    }
    isDateOutOfBounds() {
        if (!this.selectedDate)
            return false;
        const sel = customParseFormat.dayjs(this.selectedDate);
        if (this.minDate && sel.isBefore(customParseFormat.dayjs(this.minDate), "day"))
            return true;
        if (this.maxDate && sel.isAfter(customParseFormat.dayjs(this.maxDate), "day"))
            return true;
        return false;
    }
    /**
     * When selecting a date on a boundary day, adjust the time to the first
     * available time if the current selection falls outside the allowed range.
     */
    clampTimeToBounds(date) {
        const sel = customParseFormat.dayjs(date);
        if (this.minDate) {
            const min = customParseFormat.dayjs(this.minDate);
            if (min.isValid() && sel.isSame(min, "day")) {
                const curTotal = this.selectedHours * 3600 +
                    this.selectedMinutes * 60 +
                    this.selectedSeconds;
                const minTotal = min.hour() * 3600 + min.minute() * 60 + min.second();
                if (curTotal < minTotal) {
                    this.selectedHours = min.hour();
                    this.selectedMinutes = min.minute();
                    this.selectedSeconds = min.second();
                }
            }
        }
        if (this.maxDate) {
            const max = customParseFormat.dayjs(this.maxDate);
            if (max.isValid() && sel.isSame(max, "day")) {
                const curTotal = this.selectedHours * 3600 +
                    this.selectedMinutes * 60 +
                    this.selectedSeconds;
                const maxTotal = max.hour() * 3600 + max.minute() * 60 + max.second();
                if (curTotal > maxTotal) {
                    this.selectedHours = max.hour();
                    this.selectedMinutes = max.minute();
                    this.selectedSeconds = max.second();
                }
            }
        }
    }
    shouldInputFormat() {
        if (typeof this.inputShouldFormat === "string") {
            return this.inputShouldFormat === "true";
        }
        return !!this.inputShouldFormat;
    }
    getDateForTimeOnlyValue() {
        if (this.selectedDate)
            return this.selectedDate;
        const referenceDate = customParseFormat.dayjs(this.referenceDate);
        if (referenceDate.isValid())
            return referenceDate.toDate();
        return new Date();
    }
    watchValue(_newValue) {
        this.syncFromValueProp();
    }
    watchDisabled(newValue) {
        this.disabledState = newValue;
    }
    watchHasError(newValue) {
        this.errorState = newValue;
    }
    componentDidLoad() {
        this.syncFromValueProp();
        this.componentReady.emit();
        if (!this.id) {
            console.error('tabworthy-times: The "id" prop is required for accessibility');
        }
    }
    syncFromValueProp() {
        this.internalValue = this.value || null;
        if (this.value) {
            // Parse the first datetime value to set time picker
            const firstValue = Array.isArray(this.value) ? this.value[0] : this.value;
            if (firstValue) {
                const parsed = customParseFormat.dayjs(firstValue, this.format);
                if (parsed.isValid()) {
                    this.selectedDate = parsed.toDate();
                    this.selectedHours = parsed.hour();
                    this.selectedMinutes = parsed.minute();
                    this.selectedSeconds = parsed.second();
                }
            }
        }
        else {
            this.selectedDate = undefined;
        }
        // Update calendar picker
        if (this.pickerRef) {
            if (Array.isArray(this.value)) {
                const dates = this.value.reduce((acc, v) => {
                    const d = customParseFormat.dayjs(v, this.format, true);
                    if (d.isValid())
                        acc.push(d.toDate());
                    return acc;
                }, []);
                this.pickerRef.value = dates.length ? dates : null;
            }
            else if (this.value) {
                const parsedDate = customParseFormat.dayjs(this.value, this.format, true);
                if (parsedDate.isValid()) {
                    this.pickerRef.value = parsedDate.toDate();
                }
            }
            else {
                this.pickerRef.value = null;
            }
        }
        // Update text input display. Write directly so imperative reverts during
        // change/blur event handlers are reflected before the next render pass.
        if (!this.inputRef)
            return;
        if (!this.value) {
            this.inputRef.value = "";
        }
        else if (this.shouldInputFormat()) {
            this.formatInput();
        }
        else {
            this.inputRef.value = this.internalValue.toString();
        }
    }
    updateValue(date) {
        if (Array.isArray(date)) {
            // Range mode
            const formattedDates = date.map((d) => {
                const m = customParseFormat.dayjs(d)
                    .hour(this.selectedHours)
                    .minute(this.selectedMinutes)
                    .second(this.selectedSeconds);
                return m.format(this.format);
            });
            this.internalValue = formattedDates;
            this.value = formattedDates;
            this.selectDateTime.emit(formattedDates);
        }
        else {
            // Single date mode
            const m = customParseFormat.dayjs(date)
                .hour(this.selectedHours)
                .minute(this.selectedMinutes)
                .second(this.selectedSeconds);
            const formatted = m.format(this.format);
            this.internalValue = formatted;
            this.value = formatted;
            this.selectedDate = date;
            this.selectDateTime.emit(formatted);
        }
        this.errorState = false;
        if (this.shouldInputFormat()) {
            this.formatInput();
        }
    }
    isDateValid(date) {
        const parsed = customParseFormat.dayjs(date);
        if (!parsed.isValid())
            return false;
        if (this.minDate && parsed.isBefore(customParseFormat.dayjs(this.minDate), "day")) {
            this.errorState = true;
            this.errorMessage = `${this.timesLabels.minDateError} ${this.formatBoundaryDate(this.minDate)}`;
            this.emitErrorChange("minDate", this.errorMessage);
            return false;
        }
        if (this.maxDate && parsed.isAfter(customParseFormat.dayjs(this.maxDate), "day")) {
            this.errorState = true;
            this.errorMessage = `${this.timesLabels.maxDateError} ${this.formatBoundaryDate(this.maxDate)}`;
            this.emitErrorChange("maxDate", this.errorMessage);
            return false;
        }
        if (this.disableDate(date)) {
            this.errorState = true;
            this.errorMessage = this.timesLabels.disabledDateError;
            this.emitErrorChange("disabledDate", this.errorMessage);
            return false;
        }
        return true;
    }
    formatInput() {
        if (!this.internalValue)
            return;
        if (Array.isArray(this.internalValue)) {
            // Format range
            const formatted = this.internalValue
                .map((v) => customParseFormat.dayjs(v, this.format).format("lll"))
                .join(` ${this.timesLabels.to} `);
            this.inputRef.value = formatted;
        }
        else if (this.timeOnly) {
            this.inputRef.value = customParseFormat.dayjs(this.internalValue, this.format).format(this.showSeconds ? "LTS" : "LT");
        }
        else {
            // Format single datetime
            this.inputRef.value = customParseFormat.dayjs(this.internalValue, this.format).format("lll");
        }
    }
    getClassName(suffix) {
        return `${this.elementClassName}__${suffix}`;
    }
    toDate(dateString) {
        if (!dateString)
            return null;
        const date = Array.isArray(dateString)
            ? dateString.map((d) => customParseFormat.dayjs(d, this.format).toDate())
            : customParseFormat.dayjs(dateString, this.format).toDate();
        return date;
    }
    async revertInput(newValue, clearError = false) {
        if (clearError)
            this.errorState = false;
        this.value = newValue;
        this.syncFromValueProp();
    }
    async clearValue() {
        this.internalValue = null;
        this.value = undefined;
        this.selectedDate = undefined;
        if (this.inputRef) {
            this.inputRef.value = "";
        }
        if (this.pickerRef) {
            this.pickerRef.value = null;
        }
        this.selectDateTime.emit(undefined);
    }
    render() {
        var _a;
        return (index.h(index.Host, { key: 'ab639b86fb2e2afe854a1253a2caab53a82f9cc0', class: this.elementClassName, "has-error": this.errorState, disabled: this.disabledState, "time-only": this.timeOnly }, index.h("label", { key: '55dd4b279bc847151a5f3cb50f98bddb62c2965c', htmlFor: `${this.id}-input`, class: this.getClassName("label") }, this.label), index.h("div", { key: '5aa75daa3ee2d7de8f8385d5871dd732ce6c5d3c', class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, index.h("input", { key: '49912db4c96619e20e818b494d553aad293920a8', id: `${this.id}-input`, ref: (r) => (this.inputRef = r), type: "text", class: {
                [this.getClassName("input")]: true,
                [this.inputClass]: !!this.inputClass
            }, placeholder: this.placeholder, disabled: this.disabledState || this.disableFreeformInput, value: (_a = this.internalValue) === null || _a === void 0 ? void 0 : _a.toString(), onBlur: this.handleInputBlur, onChange: this.handleInputChange, "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState }), !this.inline && (index.h("button", { key: 'f22378a0ad106f560ed0d1e02e3b22b43e725289', type: "button", onClick: this.handleCalendarButtonClick, class: this.getClassName("calendar-button"), disabled: this.disabledState, "aria-label": this.calendarButtonContent
                ? this.timesLabels.openCalendar
                : undefined }, this.calendarButtonContent ? (index.h("span", { innerHTML: this.calendarButtonContent })) : (this.timesLabels.openCalendar)))), index.h("tabworthy-dates-modal", { key: 'c0f14cf67c2da5a3c4917b388949458e410009e8', label: this.timesLabels.calendar, ref: (el) => (this.modalRef = el), onOpened: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = true;
                }
                if (this.timeOnly && this.timePickerRef) {
                    this.timePickerRef.modalIsOpen = true;
                }
            }, onClosed: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = false;
                }
                if (this.timePickerRef) {
                    this.timePickerRef.modalIsOpen = false;
                }
            }, inline: this.inline, appendTo: this.appendTo }, index.h("div", { key: 'c7051d360cfba74d9e0b3a8702683da2f79c013c', class: this.getClassName("picker-container") }, !this.timeOnly && (index.h("tabworthy-dates-calendar", { key: 'c9c72c072116568cd6ca0ce99de136940876e3b0', range: this.range, locale: this.locale, onSelectDate: (event) => this.handlePickerSelection(event.detail), onChangeMonth: (event) => this.handleChangedMonths(event.detail), onChangeYear: (event) => this.handleYearChange(event.detail), onRequestClose: () => { var _a; return (_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.close(); }, labels: this.datesCalendarLabels, ref: (el) => (this.pickerRef = el), startDate: this.startDate, firstDayOfWeek: this.firstDayOfWeek, showHiddenTitle: true, disabled: this.disabledState, showMonthStepper: this.showMonthStepper, showYearStepper: this.showYearStepper, showClearButton: this.showClearButton, showCloseButton: this.showCloseButton, showTodayButton: this.showTodayButton, disableDate: this.disableDate, minDate: this.minDate, maxDate: this.maxDate, inline: this.inline, value: this.value ? this.toDate(this.value) : undefined, nextMonthButtonContent: this.nextMonthButtonContent, nextYearButtonContent: this.nextYearButtonContent, previousMonthButtonContent: this.previousMonthButtonContent, previousYearButtonContent: this.previousYearButtonContent, todayButtonContent: this.todayButtonContent, clearButtonContent: this.clearButtonContent, closeButtonContent: this.closeButtonContent }, index.h("div", { key: '325945a90d36cb39ef23db27f99fd6224984b735', slot: "after-calendar", class: this.getClassName("time-section") }, index.h("hr", { key: 'ff305cef7f526fb05dd3f193ea4093f0064fc813', class: this.getClassName("divider") }), index.h("tabworthy-times-picker", { key: 'ad163d7fa0c3282312b848a758bfcc8b08a663ad', hours: this.selectedHours, minutes: this.selectedMinutes, seconds: this.selectedSeconds, showSeconds: this.showSeconds, useTwelveHourFormat: this.useTwelveHourFormat, disabled: this.disabledState || this.isDateOutOfBounds(), onTimeChanged: this.handleTimeChange, labels: this.timesPickerLabels, minTime: this.getEffectiveMinTime(), maxTime: this.getEffectiveMaxTime(), ref: (el) => (this.timePickerRef = el) })))), this.timeOnly && (index.h("div", { key: 'c19252f05b91934af956c5ed9453185e591c4f71', class: this.getClassName("time-section") }, index.h("tabworthy-times-picker", { key: 'd8456d201c430625d2181a7da76f0ec5a471aec4', hours: this.selectedHours, minutes: this.selectedMinutes, seconds: this.selectedSeconds, showSeconds: this.showSeconds, useTwelveHourFormat: this.useTwelveHourFormat, disabled: this.disabledState || this.isDateOutOfBounds(), onTimeChanged: this.handleTimeChange, labels: this.timesPickerLabels, minTime: this.getEffectiveMinTime(), maxTime: this.getEffectiveMaxTime(), ref: (el) => (this.timePickerRef = el) }))))), this.errorState && (index.h("div", { key: '0968907cbf6971aa00a486184394fe7d342ee237', class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
    }
    get el() { return index.getElement(this); }
    static get watchers() { return {
        "value": [{
                "watchValue": 0
            }],
        "disabled": [{
                "watchDisabled": 0
            }],
        "hasError": [{
                "watchHasError": 0
            }]
    }; }
};

exports.tabworthy_times = TabworthyTimes;
