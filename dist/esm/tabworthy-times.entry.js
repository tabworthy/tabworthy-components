import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-CwtZ_Lud.js';
import { h as hooks } from './moment-Mki5YqAR.js';
import { g as getISODateString, r as removeTimezoneOffset } from './utils-BVHu5CWV.js';

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
const InclusiveTimes = class {
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
            // Try to parse the input value as a datetime
            const parsed = hooks(value);
            if (parsed.isValid()) {
                this.selectedHours = parsed.hours();
                this.selectedMinutes = parsed.minutes();
                this.updateValue(parsed.toDate());
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
                const parsed = hooks(firstValue, this.format);
                if (parsed.isValid()) {
                    this.selectedDate = parsed.toDate();
                    this.selectedHours = parsed.hours();
                    this.selectedMinutes = parsed.minutes();
                    this.selectedSeconds = parsed.seconds();
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
                const m = hooks(d);
                m.hours(this.selectedHours);
                m.minutes(this.selectedMinutes);
                m.seconds(this.selectedSeconds);
                return m.format(this.format);
            });
            this.internalValue = formattedDates;
            this.value = formattedDates;
            this.selectDateTime.emit(formattedDates);
        }
        else {
            // Single date mode
            const m = hooks(date);
            m.hours(this.selectedHours);
            m.minutes(this.selectedMinutes);
            m.seconds(this.selectedSeconds);
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
                .map((v) => hooks(v, this.format).format("lll"))
                .join(` ${this.timesLabels.to} `);
            this.inputRef.value = formatted;
        }
        else {
            // Format single datetime
            this.inputRef.value = hooks(this.internalValue, this.format).format("lll");
        }
    }
    getClassName(suffix) {
        return `${this.elementClassName}__${suffix}`;
    }
    toDate(dateString) {
        if (!dateString)
            return null;
        const date = Array.isArray(dateString)
            ? dateString.map((d) => hooks(d, this.format).toDate())
            : hooks(dateString, this.format).toDate();
        return date;
    }
    async clearValue() {
        this.internalValue = null;
        this.value = undefined;
        this.selectedDate = undefined;
        this.inputRef.value = "";
        if (this.pickerRef) {
            this.pickerRef.value = null;
        }
        this.selectDateTime.emit(undefined);
    }
    render() {
        var _a;
        return (h(Host, { key: '347e952540e649e53bf13dadfd156f3c9a31b4d2', class: this.elementClassName, "has-error": this.errorState, disabled: this.disabledState }, h("label", { key: '3c516fa313feaaabc837e53264c7b10989199f6c', htmlFor: `${this.id}-input`, class: this.getClassName("label") }, this.label), h("div", { key: 'edc0f1a6e627273fdd6cae27810d97a2b6763f76', class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, h("input", { key: '14a3ed21097915739c2db94e6ede2dbb09f09945', id: `${this.id}-input`, ref: (r) => (this.inputRef = r), type: "text", class: {
                [this.getClassName("input")]: true,
                [this.inputClass]: !!this.inputClass
            }, placeholder: this.placeholder, disabled: this.disabledState || this.disableFreeformInput, value: (_a = this.internalValue) === null || _a === void 0 ? void 0 : _a.toString(), onBlur: this.handleInputBlur, onChange: this.handleInputChange, "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState }), !this.inline && (h("button", { key: '0a02d0b3e851476d421408bcf622af4c71a4e9b5', type: "button", onClick: this.handleCalendarButtonClick, class: this.getClassName("calendar-button"), disabled: this.disabledState }, this.calendarButtonContent ? (h("span", { innerHTML: this.calendarButtonContent })) : (this.timesLabels.openCalendar)))), h("tabworthy-dates-modal", { key: '972b23ebef8d198da1c7b23966f5b343c53dc89b', label: this.timesLabels.calendar, ref: (el) => (this.modalRef = el), onOpened: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = true;
                }
            }, onClosed: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = false;
                }
            }, inline: this.inline, appendTo: this.appendTo }, h("div", { key: '7bab739450039dfb34b638a5882d2334e18e7ee9', class: this.getClassName("picker-container") }, h("tabworthy-dates-calendar", { key: '169dd2b5b134d40613547c5633f1ba7aafa79e5a', range: this.range, locale: this.locale, onSelectDate: (event) => this.handlePickerSelection(event.detail), onChangeMonth: (event) => this.handleChangedMonths(event.detail), onChangeYear: (event) => this.handleYearChange(event.detail), onRequestClose: () => { var _a; return (_a = this.modalRef) === null || _a === void 0 ? void 0 : _a.close(); }, labels: this.datesCalendarLabels, ref: (el) => (this.pickerRef = el), startDate: this.startDate, firstDayOfWeek: this.firstDayOfWeek, showHiddenTitle: true, disabled: this.disabledState, showMonthStepper: this.showMonthStepper, showYearStepper: this.showYearStepper, showClearButton: this.showClearButton, showCloseButton: this.showCloseButton, showTodayButton: this.showTodayButton, disableDate: this.disableDate, minDate: this.minDate, maxDate: this.maxDate, inline: this.inline, value: this.value ? this.toDate(this.value) : undefined }, h("div", { key: '20555b87d63d4d9b5ba360345b5a8ce3910bb71a', slot: "after-calendar", class: this.getClassName("time-section") }, h("hr", { key: 'ccea06aa5b2b149aa77739e495cb71eda5d9a14e', class: this.getClassName("divider") }), h("tabworthy-times-picker", { key: '87a3aca5a0f09413fb7b4fb8dd4242f18d5365d7', hours: this.selectedHours, minutes: this.selectedMinutes, seconds: this.selectedSeconds, showSeconds: this.showSeconds, useTwelveHourFormat: this.useTwelveHourFormat, disabled: this.disabledState, onTimeChanged: this.handleTimeChange, labels: this.timesPickerLabels }))))), this.errorState && (h("div", { key: 'd45d1adde84b72bbc8d166f4d087f0fcf732ef99', class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
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

export { InclusiveTimes as tabworthy_times };
