import { EventEmitter } from "../../stencil-public-runtime";
import { DatesCalendarLabels, YearChangedEventDetails } from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
import { ChronoOptions, ChronoParsedDateString } from "../../../shared/utils/chrono-parser/chrono-parser.type";
import { DateErrorLabel } from "../../utils/date-error";
export interface ErrorChangeEventDetails {
    reason?: string;
    message?: string;
}
export interface DatesLabels {
    selected: string;
    openCalendar: string;
    calendar: string;
    errorMessage?: string;
    invalidDateError: string;
    maxDateError: DateErrorLabel;
    minDateError: DateErrorLabel;
    rangeOutOfBoundsError: string;
    disabledDateError: string;
    to: string;
    startDate: string;
    quickSelection: string;
    yearSelect: string;
}
export declare class TabworthyDates {
    el: HTMLElement;
    id: string;
    value?: string | string[];
    range?: boolean;
    yearOnly?: boolean;
    label: string;
    placeholder: string;
    locale: string;
    disabled: boolean;
    minDate?: string;
    maxDate?: string;
    startDate: string;
    referenceDate: string;
    useStrictDateParsing: boolean;
    datesLabels: DatesLabels;
    datesCalendarLabels?: DatesCalendarLabels;
    inline: boolean;
    hasError: boolean;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    previousMonthButtonContent?: string;
    previousYearButtonContent?: string;
    showYearStepper: boolean;
    showMonthStepper: boolean;
    showClearButton: boolean;
    showCloseButton: boolean;
    showTodayButton: boolean;
    inputShouldFormat?: boolean | string;
    showKeyboardHint: boolean;
    disableDate: HTMLTabworthyDatesCalendarElement["disableDate"];
    elementClassName: string;
    firstDayOfWeek?: number;
    format: string;
    quickButtons: string[];
    todayButtonContent?: string;
    clearButtonContent?: string;
    closeButtonContent?: string;
    calendarButtonContent?: string;
    showQuickButtons: boolean;
    disableFreeformInput: boolean;
    inputClass: string;
    /**
     * Element to append the dropdown to. Use "body" to append to document.body,
     * or pass a CSS selector or HTMLElement. Useful for escaping overflow:hidden containers.
     */
    appendTo?: string | HTMLElement;
    internalValue?: string | string[] | null;
    errorState: boolean;
    disabledState: boolean;
    selectDate: EventEmitter<string | string[] | undefined>;
    changeYear?: EventEmitter<YearChangedEventDetails>;
    errorChange: EventEmitter<ErrorChangeEventDetails>;
    componentReady: EventEmitter<void>;
    private modalRef?;
    private inputRef;
    private inputContainerRef?;
    private pickerRef?;
    private chronoSupportedLocale;
    private errorMessage;
    private shouldInputFormat;
    componentDidLoad(): void;
    parseDate(text: string, shouldSetValue?: boolean, chronoOptions?: ChronoOptions | undefined): Promise<ChronoParsedDateString>;
    revertInput(newValue: string | string[] | undefined, clearError?: boolean): Promise<void>;
    private isRangeValue;
    private updateValue;
    private handleCalendarButtonClick;
    private handleQuickButtonClick;
    private emitErrorChange;
    private formatBoundaryDate;
    private handleChangedMonths;
    private handleYearChange;
    private handleYearInputChange;
    private handleRangeChange;
    private handleSingleDateChange;
    private handleChange;
    private formatInput;
    private isPickedDateValid;
    private handlePickerSelection;
    private announceDateChange;
    watchDisabled(newValue: boolean): void;
    watchValue(newValue: string | string[] | undefined): void;
    private getClassName;
    private syncFromValueProp;
    render(): any;
}
