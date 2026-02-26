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
        this.selectedHours = 12;
        this.selectedMinutes = 0;
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
                m.seconds(0);
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
            m.seconds(0);
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
        return (h(Host, { key: '50d45c4b42629ab4db986c798de53bffcfb94018', class: this.elementClassName, "has-error": this.errorState, disabled: this.disabledState }, h("label", { key: '9b97b3a86a29629b5acef900cd46c12401a0ed15', htmlFor: `${this.id}-input`, class: this.getClassName("label") }, this.label), h("div", { key: '84e4b339f17a14b036e08c3ed55c28ebf8ff1eef', class: this.getClassName("input-container"), ref: (r) => (this.inputContainerRef = r) }, h("input", { key: 'f189b9624b1e7a9d80a71dbdbcadc606d4e8c431', id: `${this.id}-input`, ref: (r) => (this.inputRef = r), type: "text", class: {
                [this.getClassName("input")]: true,
                [this.inputClass]: !!this.inputClass
            }, placeholder: this.placeholder, disabled: this.disabledState || this.disableFreeformInput, value: (_a = this.internalValue) === null || _a === void 0 ? void 0 : _a.toString(), onBlur: this.handleInputBlur, onChange: this.handleInputChange, "aria-describedby": this.errorState ? `${this.id}-error` : undefined, "aria-invalid": this.errorState }), !this.inline && (h("button", { key: 'dc54c9ff8d4fab01d6175584320de0a0b8282cb2', type: "button", onClick: this.handleCalendarButtonClick, class: this.getClassName("calendar-button"), disabled: this.disabledState }, this.calendarButtonContent ? (h("span", { innerHTML: this.calendarButtonContent })) : (this.timesLabels.openCalendar)))), h("tabworthy-dates-modal", { key: '1102460f03ffbd9dd3878376fc37fe19aaa50f54', label: this.timesLabels.calendar, ref: (el) => (this.modalRef = el), onOpened: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = true;
                }
            }, onClosed: () => {
                if (this.pickerRef) {
                    this.pickerRef.modalIsOpen = false;
                }
            }, inline: this.inline, appendTo: this.appendTo }, h("div", { key: 'fbce75861b31c85a58055eb4dc1c3f9ad0d0be73', class: this.getClassName("picker-container") }, h("tabworthy-dates-calendar", { key: '265ab52d552985fddd4c6944fb2405baadae1450', range: this.range, locale: this.locale, onSelectDate: (event) => this.handlePickerSelection(event.detail), onChangeMonth: (event) => this.handleChangedMonths(event.detail), onChangeYear: (event) => this.handleYearChange(event.detail), labels: this.datesCalendarLabels, ref: (el) => (this.pickerRef = el), startDate: this.startDate, firstDayOfWeek: this.firstDayOfWeek, showHiddenTitle: true, disabled: this.disabledState, showMonthStepper: this.showMonthStepper, showYearStepper: this.showYearStepper, showClearButton: this.showClearButton, showTodayButton: this.showTodayButton, disableDate: this.disableDate, minDate: this.minDate, maxDate: this.maxDate, inline: this.inline, value: this.value ? this.toDate(this.value) : undefined }, h("div", { key: 'f7377b3ff5a818849afcab7297a6f3d732dd4b82', slot: "after-calendar", class: this.getClassName("time-section") }, h("hr", { key: 'd71bc64c57fc8073e4af045347f9be69e20bac9f', class: this.getClassName("divider") }), h("tabworthy-times-picker", { key: '2ee95db049c3a81b26fa38b9bb4288f0850dc25f', hours: this.selectedHours, minutes: this.selectedMinutes, useTwelveHourFormat: this.useTwelveHourFormat, disabled: this.disabledState, onTimeChanged: this.handleTimeChange, labels: this.timesPickerLabels }))))), this.errorState && (h("div", { key: '0b0f79267ba191582d5e23be27970b16db80aab7', class: this.getClassName("input-error"), id: this.id ? `${this.id}-error` : undefined, role: "status" }, this.errorMessage))));
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
