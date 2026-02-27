import { EventEmitter } from "../../stencil-public-runtime";
import { TimesPickerLabels } from "../tabworthy-times-picker/tabworthy-times-picker";
import { DatesLabels } from "../tabworthy-dates/tabworthy-dates";
import { DatesCalendarLabels, YearChangedEventDetails } from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
export interface TimesLabels extends Omit<DatesLabels, "quickSelection"> {
    timeLabel: string;
}
export declare class InclusiveTimes {
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
    errorState: boolean;
    disabledState: boolean;
    selectDateTime: EventEmitter<string | string[] | undefined>;
    changeYear?: EventEmitter<YearChangedEventDetails>;
    componentReady: EventEmitter<void>;
    private modalRef?;
    private inputRef;
    private inputContainerRef?;
    private pickerRef?;
    private errorMessage;
    private shouldInputFormat;
    watchValue(_newValue: string | string[] | undefined): void;
    watchDisabled(newValue: boolean): void;
    watchHasError(newValue: boolean): void;
    componentDidLoad(): void;
    private syncFromValueProp;
    private updateValue;
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
