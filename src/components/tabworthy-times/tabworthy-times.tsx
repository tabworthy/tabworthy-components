import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
import {
  TimeBounds,
  TimesPickerLabels,
  TimeValue
} from "../tabworthy-times-picker/tabworthy-times-picker";
import {
  DatesLabels,
  ErrorChangeEventDetails
} from "../tabworthy-dates/tabworthy-dates";
import {
  DatesCalendarLabels,
  MonthChangedEventDetails,
  YearChangedEventDetails
} from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
import { getISODateString, removeTimezoneOffset } from "@shared/utils/utils";

export interface TimesLabels
  extends Omit<DatesLabels, "quickSelection" | "yearSelect"> {
  timeLabel: string;
}

const defaultLabels: TimesLabels = {
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

@Component({
  scoped: true,
  shadow: false,
  tag: "tabworthy-times"
})
export class TabworthyTimes {
  @Element() el!: HTMLElement;

  // A unique ID for the datetime picker. Mandatory for accessibility
  @Prop({ reflect: true }) id!: string;

  // Current value of the datetime picker (ISO 8601 format: YYYY-MM-DDTHH:mm:ss)
  @Prop({ mutable: true }) value?: string | string[];

  // Enable or disable range mode
  @Prop() range?: boolean = false;

  // A label for the text field
  @Prop() label: string = "Choose a date and time";

  // A placeholder for the text field
  @Prop() placeholder = "";

  // Locale used for internal translations and date parsing
  @Prop() locale: string = navigator?.language || "en-US";

  // If the datetime picker is disabled
  @Prop() disabled: boolean = false;

  // Earliest accepted date (YYYY-MM-DD)
  @Prop() minDate?: string;

  // Latest accepted date (YYYY-MM-DD)
  @Prop() maxDate?: string;

  // Which date to be displayed when calendar is first opened
  @Prop() startDate: string = getISODateString(new Date());

  // Reference date used for Chrono date parsing. Equals "today"
  @Prop() referenceDate: string = getISODateString(new Date());

  // Use 12-hour format with AM/PM
  @Prop() useTwelveHourFormat: boolean = true;

  // Show seconds picker control
  @Prop() showSeconds: boolean = false;

  // Labels used for internal translations
  @Prop() timesLabels: TimesLabels = defaultLabels;
  @Prop() datesCalendarLabels?: DatesCalendarLabels;
  @Prop() timesPickerLabels?: TimesPickerLabels;
  @Prop() inline: boolean = false;

  // Current error state of the input field
  @Prop({ mutable: true }) hasError: boolean = false;

  // Show or hide the next/previous year buttons
  @Prop() showYearStepper: boolean = false;

  // Show or hide the next/previous month buttons
  @Prop() showMonthStepper: boolean = true;

  // Show or hide the clear button
  @Prop() showClearButton: boolean = true;

  // Show or hide the close button
  @Prop() showCloseButton: boolean = false;

  // Show or hide the today button
  @Prop() showTodayButton: boolean = true;

  // HTML content for the calendar button (allows custom icons/SVG)
  @Prop() calendarButtonContent?: string;
  // Text label for next month button
  @Prop() nextMonthButtonContent?: string;
  // Text label for next year button
  @Prop() nextYearButtonContent?: string;
  // Text label for previous month button
  @Prop() previousMonthButtonContent?: string;
  // Text label for previous year button
  @Prop() previousYearButtonContent?: string;
  // Text content for the today button in the calendar
  @Prop() todayButtonContent?: string;
  // Text content for the clear button in the calendar
  @Prop() clearButtonContent?: string;
  // Text content for the close button in the calendar
  @Prop() closeButtonContent?: string;

  // Function to disable individual dates
  @Prop() disableDate: (date: Date) => boolean = () => false;

  // Component name used to generate CSS classes
  @Prop() elementClassName?: string = "tabworthy-times";

  // Which day that should start the week (0 is sunday, 1 is monday)
  @Prop() firstDayOfWeek?: number = 1;

  // Format for the value prop (input/output format). Defaults to ISO 8601 format.
  @Prop() format: string = "YYYY-MM-DDTHH:mm:ss";

  // If true, format input on blur/accept (like dates)
  @Prop({ attribute: "input-should-format" }) inputShouldFormat?:
    | boolean
    | string = true;
  @Prop() disableFreeformInput: boolean = false;
  @Prop() inputClass: string = "";
  /**
   * Element to append the dropdown to. Use "body" to append to document.body,
   * or pass a CSS selector or HTMLElement. Useful for escaping overflow:hidden containers.
   */
  @Prop() appendTo?: string | HTMLElement;

  @State() internalValue?: string | string[] | null;
  @State() selectedDate?: Date;
  @State() selectedHours: number = new Date().getHours();
  @State() selectedMinutes: number = new Date().getMinutes();
  @State() selectedSeconds: number = new Date().getSeconds();
  @State() errorState: boolean = this.hasError;
  @State() disabledState: boolean = this.disabled;

  @Event() selectDateTime!: EventEmitter<string | string[] | undefined>;
  @Event() changeYear?: EventEmitter<YearChangedEventDetails>;
  @Event() errorChange!: EventEmitter<ErrorChangeEventDetails>;
  @Event() componentReady!: EventEmitter<void>;

  private modalRef?: HTMLTabworthyDatesModalElement;
  private inputRef!: HTMLInputElement;
  private inputContainerRef?: HTMLDivElement;
  private pickerRef?: HTMLTabworthyDatesCalendarElement;
  private errorMessage = "";

  private emitErrorChange(reason?: string, message?: string) {
    this.errorChange.emit({ reason, message });
  }

  private formatBoundaryDate(dateString: string): string {
    const parsed = dayjs(dateString);
    if (!parsed.isValid()) return dateString;

    const hasTime = dateString.includes("T") || dateString.includes(" ");
    if (!hasTime) {
      return Intl.DateTimeFormat(this.locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(parsed.toDate());
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      ...(this.showSeconds ? { second: "numeric" } : {})
    };
    return Intl.DateTimeFormat(this.locale, options).format(parsed.toDate());
  }

  private getEffectiveMinTime(): TimeBounds | undefined {
    if (!this.minDate || !this.selectedDate) return undefined;
    const min = dayjs(this.minDate);
    const sel = dayjs(this.selectedDate);
    if (!min.isValid() || !sel.isSame(min, "day")) return undefined;
    return {
      hours: min.hour(),
      minutes: min.minute(),
      seconds: min.second()
    };
  }

  private getEffectiveMaxTime(): TimeBounds | undefined {
    if (!this.maxDate || !this.selectedDate) return undefined;
    const max = dayjs(this.maxDate);
    const sel = dayjs(this.selectedDate);
    if (!max.isValid() || !sel.isSame(max, "day")) return undefined;
    return {
      hours: max.hour(),
      minutes: max.minute(),
      seconds: max.second()
    };
  }

  private isDateOutOfBounds(): boolean {
    if (!this.selectedDate) return false;
    const sel = dayjs(this.selectedDate);
    if (this.minDate && sel.isBefore(dayjs(this.minDate), "day")) return true;
    if (this.maxDate && sel.isAfter(dayjs(this.maxDate), "day")) return true;
    return false;
  }

  /**
   * When selecting a date on a boundary day, adjust the time to the first
   * available time if the current selection falls outside the allowed range.
   */
  private clampTimeToBounds(date: Date) {
    const sel = dayjs(date);

    if (this.minDate) {
      const min = dayjs(this.minDate);
      if (min.isValid() && sel.isSame(min, "day")) {
        const curTotal =
          this.selectedHours * 3600 +
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
      const max = dayjs(this.maxDate);
      if (max.isValid() && sel.isSame(max, "day")) {
        const curTotal =
          this.selectedHours * 3600 +
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

  private shouldInputFormat() {
    if (typeof this.inputShouldFormat === "string") {
      return this.inputShouldFormat === "true";
    }
    return !!this.inputShouldFormat;
  }

  @Watch("value")
  watchValue(_newValue: string | string[] | undefined) {
    this.syncFromValueProp();
  }

  @Watch("disabled")
  watchDisabled(newValue: boolean) {
    this.disabledState = newValue;
  }

  @Watch("hasError")
  watchHasError(newValue: boolean) {
    this.errorState = newValue;
  }

  componentDidLoad() {
    this.syncFromValueProp();
    this.componentReady.emit();
    if (!this.id) {
      console.error(
        'tabworthy-times: The "id" prop is required for accessibility'
      );
    }
  }

  private syncFromValueProp() {
    this.internalValue = this.value || null;

    if (this.value) {
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
    } else {
      this.selectedDate = undefined;
    }

    // Update calendar picker
    if (this.pickerRef) {
      if (Array.isArray(this.value)) {
        const dates = this.value.reduce((acc: Date[], v) => {
          const d = dayjs(v, this.format, true);
          if (d.isValid()) acc.push(d.toDate());
          return acc;
        }, [] as Date[]);
        this.pickerRef.value = dates.length ? dates : null;
      } else if (this.value) {
        const parsedDate = dayjs(this.value, this.format, true);
        if (parsedDate.isValid()) {
          this.pickerRef.value = parsedDate.toDate();
        }
      } else {
        this.pickerRef.value = null;
      }
    }

    // Update text input display
    if (!this.value && this.inputRef) {
      this.inputRef.value = "";
    } else if (this.value && this.inputRef && this.shouldInputFormat()) {
      this.formatInput();
    }
  }

  private updateValue(date: Date | Date[]) {
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
    } else {
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

  private isDateValid(date: Date): boolean {
    const parsed = dayjs(date);
    if (!parsed.isValid()) return false;
    if (this.minDate && parsed.isBefore(dayjs(this.minDate), "day")) {
      this.errorState = true;
      this.errorMessage = `${
        this.timesLabels.minDateError
      } ${this.formatBoundaryDate(this.minDate)}`;
      this.emitErrorChange("minDate", this.errorMessage);
      return false;
    }
    if (this.maxDate && parsed.isAfter(dayjs(this.maxDate), "day")) {
      this.errorState = true;
      this.errorMessage = `${
        this.timesLabels.maxDateError
      } ${this.formatBoundaryDate(this.maxDate)}`;
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

  private handlePickerSelection = async (dateString: string | undefined) => {
    // Handle clear button click (calendar emits undefined)
    if (!dateString) {
      return this.clearValue();
    }

    const dates = dateString.split(",");

    if (this.range && dates.length === 2) {
      const startDate = removeTimezoneOffset(new Date(dates[0]));
      const endDate = removeTimezoneOffset(new Date(dates[1]));

      if (!this.isDateValid(startDate) || !this.isDateValid(endDate)) return;

      this.updateValue([startDate, endDate]);

      // Update calendar with selected dates
      if (this.pickerRef) {
        this.pickerRef.value = [startDate, endDate];
      }
    } else {
      const date = removeTimezoneOffset(new Date(dates[0]));

      if (!this.isDateValid(date)) return;

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

  private handleTimeChange = (event: CustomEvent<TimeValue>) => {
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

  private handleCalendarButtonClick = async () => {
    if (this.modalRef) {
      // Use input container as trigger for proper dropdown alignment
      await this.modalRef.setTriggerElement(
        this.inputContainerRef as HTMLElement
      );
      await this.modalRef.open();
    }
  };

  private handleYearChange = (eventDetail: YearChangedEventDetails) => {
    if (this.changeYear) {
      this.changeYear.emit(eventDetail);
    }
  };

  private handleChangedMonths = (_eventDetail: MonthChangedEventDetails) => {
    // Can be used for month change tracking
  };

  private handleInputBlur = () => {
    if (this.shouldInputFormat()) {
      this.formatInput();
    }
  };

  private handleInputChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

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
      // Check minDate/maxDate bounds (supports both date-only and datetime strings)
      if (this.minDate && parsed.isBefore(dayjs(this.minDate))) {
        this.errorState = true;
        this.errorMessage = `${
          this.timesLabels.minDateError
        } ${this.formatBoundaryDate(this.minDate)}`;
        this.emitErrorChange("minDate", this.errorMessage);
        return;
      }
      if (this.maxDate && parsed.isAfter(dayjs(this.maxDate))) {
        this.errorState = true;
        this.errorMessage = `${
          this.timesLabels.maxDateError
        } ${this.formatBoundaryDate(this.maxDate)}`;
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
    } else {
      // Set error state for invalid/garbage input
      this.errorState = true;
      this.errorMessage = this.timesLabels.invalidDateError;
      this.emitErrorChange("invalid", this.errorMessage);
    }
  };

  private formatInput() {
    if (!this.internalValue) return;

    if (Array.isArray(this.internalValue)) {
      // Format range
      const formatted = this.internalValue
        .map((v) => dayjs(v, this.format).format("lll"))
        .join(` ${this.timesLabels.to} `);
      this.inputRef.value = formatted;
    } else {
      // Format single datetime
      this.inputRef.value = dayjs(this.internalValue, this.format).format(
        "lll"
      );
    }
  }

  private getClassName(suffix: string): string {
    return `${this.elementClassName}__${suffix}`;
  }

  private toDate(
    dateString: string | string[] | undefined
  ): Date | Date[] | null {
    if (!dateString) return null;

    const date = Array.isArray(dateString)
      ? dateString.map((d) => dayjs(d, this.format).toDate())
      : dayjs(dateString, this.format).toDate();

    return date;
  }

  @Method()
  async revertInput(
    newValue: string | string[] | undefined,
    clearError = false
  ) {
    if (clearError) this.errorState = false;

    this.value = newValue;
    this.syncFromValueProp();
  }

  @Method()
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
    return (
      <Host
        class={this.elementClassName}
        has-error={this.errorState}
        disabled={this.disabledState}
      >
        <label htmlFor={`${this.id}-input`} class={this.getClassName("label")}>
          {this.label}
        </label>
        <div
          class={this.getClassName("input-container")}
          ref={(r) => (this.inputContainerRef = r)}
        >
          <input
            id={`${this.id}-input`}
            ref={(r) => (this.inputRef = r!)}
            type="text"
            class={{
              [this.getClassName("input")]: true,
              [this.inputClass]: !!this.inputClass
            }}
            placeholder={this.placeholder}
            disabled={this.disabledState || this.disableFreeformInput}
            value={this.internalValue?.toString()}
            onBlur={this.handleInputBlur}
            onChange={this.handleInputChange}
            aria-describedby={this.errorState ? `${this.id}-error` : undefined}
            aria-invalid={this.errorState}
          />
          {!this.inline && (
            <button
              type="button"
              onClick={this.handleCalendarButtonClick}
              class={this.getClassName("calendar-button")}
              disabled={this.disabledState}
              aria-label={
                this.calendarButtonContent
                  ? this.timesLabels.openCalendar
                  : undefined
              }
            >
              {this.calendarButtonContent ? (
                <span innerHTML={this.calendarButtonContent}></span>
              ) : (
                this.timesLabels.openCalendar
              )}
            </button>
          )}
        </div>

        <tabworthy-dates-modal
          label={this.timesLabels.calendar}
          ref={(el) => (this.modalRef = el)}
          onOpened={() => {
            if (this.pickerRef) {
              this.pickerRef.modalIsOpen = true;
            }
          }}
          onClosed={() => {
            if (this.pickerRef) {
              this.pickerRef.modalIsOpen = false;
            }
          }}
          inline={this.inline}
          appendTo={this.appendTo}
        >
          <div class={this.getClassName("picker-container")}>
            <tabworthy-dates-calendar
              range={this.range}
              locale={this.locale}
              onSelectDate={(event) =>
                this.handlePickerSelection(event.detail as string)
              }
              onChangeMonth={(event) =>
                this.handleChangedMonths(
                  event.detail as MonthChangedEventDetails
                )
              }
              onChangeYear={(event) =>
                this.handleYearChange(event.detail as YearChangedEventDetails)
              }
              onRequestClose={() => this.modalRef?.close()}
              labels={this.datesCalendarLabels}
              ref={(el) => (this.pickerRef = el)}
              startDate={this.startDate}
              firstDayOfWeek={this.firstDayOfWeek}
              showHiddenTitle={true}
              disabled={this.disabledState}
              showMonthStepper={this.showMonthStepper}
              showYearStepper={this.showYearStepper}
              showClearButton={this.showClearButton}
              showCloseButton={this.showCloseButton}
              showTodayButton={this.showTodayButton}
              disableDate={this.disableDate}
              minDate={this.minDate}
              maxDate={this.maxDate}
              inline={this.inline}
              value={this.value ? this.toDate(this.value) : undefined}
              nextMonthButtonContent={this.nextMonthButtonContent}
              nextYearButtonContent={this.nextYearButtonContent}
              previousMonthButtonContent={this.previousMonthButtonContent}
              previousYearButtonContent={this.previousYearButtonContent}
              todayButtonContent={this.todayButtonContent}
              clearButtonContent={this.clearButtonContent}
              closeButtonContent={this.closeButtonContent}
            >
              <div
                slot="after-calendar"
                class={this.getClassName("time-section")}
              >
                <hr class={this.getClassName("divider")}></hr>
                <tabworthy-times-picker
                  hours={this.selectedHours}
                  minutes={this.selectedMinutes}
                  seconds={this.selectedSeconds}
                  showSeconds={this.showSeconds}
                  useTwelveHourFormat={this.useTwelveHourFormat}
                  disabled={this.disabledState || this.isDateOutOfBounds()}
                  onTimeChanged={this.handleTimeChange}
                  labels={this.timesPickerLabels}
                  minTime={this.getEffectiveMinTime()}
                  maxTime={this.getEffectiveMaxTime()}
                />
              </div>
            </tabworthy-dates-calendar>
          </div>
        </tabworthy-dates-modal>

        {this.errorState && (
          <div
            class={this.getClassName("input-error")}
            id={this.id ? `${this.id}-error` : undefined}
            role="status"
          >
            {this.errorMessage}
          </div>
        )}
      </Host>
    );
  }
}
