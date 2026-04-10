import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-CwtZ_Lud.js';
import { g as getDefaultExportFromCjs, d as dayjs, c as customParseFormat } from './customParseFormat-DkyM-7xr.js';
import { g as getISODateString, r as removeTimezoneOffset } from './utils-BVHu5CWV.js';

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
var localizedFormat = /*@__PURE__*/getDefaultExportFromCjs(localizedFormatExports);

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
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
        registerInstance(this, hostRef);
        this.selectDateTime = createEvent(this, "selectDateTime", 7);
        this.changeYear = createEvent(this, "changeYear", 7);
        this.componentReady = createEvent(this, "componentReady", 7);
        // Enable or disable range mode
        this.range = false;
        // A label for the text field
        this.label = "Choose a date and time";
        // A placeholder for the text field
        this.placeholder = "";
        // Locale used for internal translations and date parsing
        this.locale = (navigator === null || navigator === void 0 ? void 0 : navigator.language) || "en-US";
        // If the datetime picker is disabled
        this.disabled = false;
        // Which date to be displayed when calendar is first opened
        this.startDate = getISODateString(new Date());
        // Reference date used for Chrono date parsing. Equals "today"
        this.referenceDate = getISODateString(new Date());
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
                const startDate = removeTimezoneOffset(new Date(dates[0]));
                const endDate = removeTimezoneOffset(new Date(dates[1]));
                this.updateValue([startDate, endDate]);
                // Update calendar with selected dates
                if (this.pickerRef) {
                    this.pickerRef.value = [startDate, endDate];
                }
            }
            else {
                const date = removeTimezoneOffset(new Date(dates[0]));
                this.updateValue(date);
                // Update calendar with selected date
                if (this.pickerRef) {
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
            let parsed = dayjs(value, this.format, true);
            // Fall back to loose parsing if strict format doesn't match
            if (!parsed.isValid()) {
                parsed = dayjs(value);
            }
            if (parsed.isValid()) {
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
            }
        };
    }
    shouldInputFormat() {
        if (typeof this.inputShouldFormat === "string") {
            return this.inputShouldFormat === "true";
        }
        return !!this.inputShouldFormat;
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
        if (this.value) {
            this.internalValue = this.value;
            // Parse the first datetime value to set time picker
            const firstValue = Array.isArray(this.value) ? this.value[0] : this.value;
            if (firstValue) {
                const parsed = dayjs(firstValue, this.format);
                if (parsed.isValid()) {
                    this.selectedDate = parsed.toDate();
                    this.selectedHours = parsed.hour();
                    this.selectedMinutes = parsed.minute();
                    this.selectedSeconds = parsed.second();
                }
            }
        }
        else {
            this.internalValue = null;
        }
    }
    updateValue(date) {
        if (Array.isArray(date)) {
            // Range mode
            const formattedDates = date.map((d) => {
                const m = dayjs(d)
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
            const m = dayjs(date)
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
    formatInput() {
        if (!this.internalValue)
            return;
        if (Array.isArray(this.internalValue)) {
            // Format range
            const formatted = this.internalValue
                .map((v) => dayjs(v, this.format).format("lll"))
                .join(` ${this.timesLabels.to} `);
            this.inputRef.value = formatted;
        }
        else {
            // Format single datetime
            this.inputRef.value = dayjs(this.internalValue, this.format).format("lll");
        }
    }
    getClassName(suffix) {
        return `${this.elementClassName}__${suffix}`;
    }
    toDate(dateString) {
        if (!dateString)
            return null;
        const date = Array.isArray(dateString)
            ? dateString.map((d) => dayjs(d, this.format).toDate())
            : dayjs(dateString, this.format).toDate();
        return date;
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
        return (h(Host, { key: 'e07a561aa76dedbf8f8e28c491b3aac19f45c472', class: this.elementClassName, "has-error": this.errorState, disabled: this.disabledState }, h("label", { key: '24e11901760a8c7f989f3d33df9cd58af899a8dc', htmlFor: `${this.id}-input`, class: this.getClassName("label") }, this.label), h("div", { key: '17c4a53c621b66e62f857d49b4b8f4b52d51183d', class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, h("input", { key: '7dd776e464533c7bb6c842a0332f0d667f52c7cc', id: `${this.id}-input`, ref: (r) => (this.inputRef = r), type: "text", class: {
                [this.getClassName("input")]: true,
                [this.inputClass]: !!this.inputClass
            }, placeholder: this.placeholder, disabled: this.disabledState || this.disableFreeformInput, value: (_a = this.internalValue) === null || _a === void 0 ? void 0 : _a.toString(), onBlur: this.handleInputBlur, onChange: this.handleInputChange, "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState }), !this.inline && (h("button", { key: '0e84b4e3ae7f5abe1a59e939cccc227bf34ab992', type: "button", onClick: this.handleCalendarButtonClick, class: this.getClassName("calendar-button"), disabled: this.disabledState, "aria-label": this.calendarButtonContent
                ? this.timesLabels.openCalendar
                : undefined }, this.calendarButtonContent ? (h("span", { innerHTML: this.calendarButtonContent })) : (this.timesLabels.openCalendar)))), h("tabworthy-dates-modal", { key: 'baebeeeda4200bf13fe8f023bb39e2c13fc58b0b', label: this.timesLabels.calendar, ref: (el) => (this.modalRef = el), onOpened: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = true;
                }
            }, onClosed: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = false;
                }
            }, inline: this.inline, appendTo: this.appendTo }, h("div", { key: '0fc94282af5f36ae9214e967dab2acac911bca14', class: this.getClassName("picker-container") }, h("tabworthy-dates-calendar", { key: '4b0ef9c95058398d759fe913b22a84d5f22bd383', range: this.range, locale: this.locale, onSelectDate: (event) => this.handlePickerSelection(event.detail), onChangeMonth: (event) => this.handleChangedMonths(event.detail), onChangeYear: (event) => this.handleYearChange(event.detail), onRequestClose: () => { var _a; return (_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.close(); }, labels: this.datesCalendarLabels, ref: (el) => (this.pickerRef = el), startDate: this.startDate, firstDayOfWeek: this.firstDayOfWeek, showHiddenTitle: true, disabled: this.disabledState, showMonthStepper: this.showMonthStepper, showYearStepper: this.showYearStepper, showClearButton: this.showClearButton, showCloseButton: this.showCloseButton, showTodayButton: this.showTodayButton, disableDate: this.disableDate, minDate: this.minDate, maxDate: this.maxDate, inline: this.inline, value: this.value ? this.toDate(this.value) : undefined, nextMonthButtonContent: this.nextMonthButtonContent, nextYearButtonContent: this.nextYearButtonContent, previousMonthButtonContent: this.previousMonthButtonContent, previousYearButtonContent: this.previousYearButtonContent, todayButtonContent: this.todayButtonContent, clearButtonContent: this.clearButtonContent, closeButtonContent: this.closeButtonContent }, h("div", { key: 'b766d90c7bb4732c6ae26cadeb610a6e0c10a597', slot: "after-calendar", class: this.getClassName("time-section") }, h("hr", { key: 'f98fc31d11a3bdd999a5dc0cc15bf1921f349b9b', class: this.getClassName("divider") }), h("tabworthy-times-picker", { key: 'cfe86bb9291d1a14d37ab7240ec2f2f7f9bece4d', hours: this.selectedHours, minutes: this.selectedMinutes, seconds: this.selectedSeconds, showSeconds: this.showSeconds, useTwelveHourFormat: this.useTwelveHourFormat, disabled: this.disabledState, onTimeChanged: this.handleTimeChange, labels: this.timesPickerLabels }))))), this.errorState && (h("div", { key: '1c2d4b6469266b894402512612a71721acf28f7e', class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
    }
    get el() { return getElement(this); }
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

export { TabworthyTimes as tabworthy_times };
