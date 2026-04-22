import { EventEmitter } from "../../stencil-public-runtime";
import { TimesPickerLabels } from "../tabworthy-times-picker/tabworthy-times-picker";
import { DatesLabels, ErrorChangeEventDetails } from "../tabworthy-dates/tabworthy-dates";
import { DatesCalendarLabels, YearChangedEventDetails } from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
export interface TimesLabels extends Omit<DatesLabels, "quickSelection" | "yearSelect"> {
    timeLabel: string;
}
export declare class TabworthyTimes {
    el: HTMLElement;
    id: string;
    value?: string | string[];
    range?: boolean;
    label: string;
    placeholder: string;
    locale: string;
    disabled: boolean;
    minDate?: string;
    maxDate?: string;
    startDate: string;
    referenceDate: string;
    useTwelveHourFormat: boolean;
    showSeconds: boolean;
    timesLabels: TimesLabels;
    datesCalendarLabels?: DatesCalendarLabels;
    timesPickerLabels?: TimesPickerLabels;
    inline: boolean;
    hasError: boolean;
    showYearStepper: boolean;
    showMonthStepper: boolean;
    showClearButton: boolean;
    showCloseButton: boolean;
    showTodayButton: boolean;
    calendarButtonContent?: string;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    previousMonthButtonContent?: string;
    previousYearButtonContent?: string;
    todayButtonContent?: string;
    clearButtonContent?: string;
    closeButtonContent?: string;
    disableDate: (date: Date) => boolean;
    elementClassName?: string;
    firstDayOfWeek?: number;
    format: string;
    inputShouldFormat?: boolean | string;
    disableFreeformInput: boolean;
    inputClass: string;
    /**
     * Element to append the dropdown to. Use "body" to append to document.body,
     * or pass a CSS selector or HTMLElement. Useful for escaping overflow:hidden containers.
     */
    appendTo?: string | HTMLElement;
    internalValue?: string | string[] | null;
    selectedDate?: Date;
    selectedHours: number;
    selectedMinutes: number;
    selectedSeconds: number;
    errorState: boolean;
    disabledState: boolean;
    selectDateTime: EventEmitter<string | string[] | undefined>;
    changeYear?: EventEmitter<YearChangedEventDetails>;
    errorChange: EventEmitter<ErrorChangeEventDetails>;
    componentReady: EventEmitter<void>;
    private modalRef?;
    private inputRef;
    private inputContainerRef?;
    private pickerRef?;
    private errorMessage;
    private emitErrorChange;
    private formatBoundaryDate;
    private getEffectiveMinTime;
    private getEffectiveMaxTime;
    private isDateOutOfBounds;
    /**
     * When selecting a date on a boundary day, adjust the time to the first
     * available time if the current selection falls outside the allowed range.
     */
    private clampTimeToBounds;
    private shouldInputFormat;
    watchValue(_newValue: string | string[] | undefined): void;
    watchDisabled(newValue: boolean): void;
    watchHasError(newValue: boolean): void;
    componentDidLoad(): void;
    private syncFromValueProp;
    private updateValue;
    private isDateValid;
    private handlePickerSelection;
    private handleTimeChange;
    private handleCalendarButtonClick;
    private handleYearChange;
    private handleChangedMonths;
    private handleInputBlur;
    private handleInputChange;
    private formatInput;
    private getClassName;
    private toDate;
    clearValue(): Promise<void>;
    render(): any;
}
