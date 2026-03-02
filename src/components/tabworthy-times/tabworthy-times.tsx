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
  TimesPickerLabels,
  TimeValue
} from "../tabworthy-times-picker/tabworthy-times-picker";
import { DatesLabels } from "../tabworthy-dates/tabworthy-dates";
import {
  DatesCalendarLabels,
  MonthChangedEventDetails,
  YearChangedEventDetails
} from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
import { getISODateString, removeTimezoneOffset } from "@shared/utils/utils";

export interface TimesLabels extends Omit<DatesLabels, "quickSelection"> {
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
  @Event() componentReady!: EventEmitter<void>;

  private modalRef?: HTMLTabworthyDatesModalElement;
  private inputRef!: HTMLInputElement;
  private inputContainerRef?: HTMLDivElement;
  private pickerRef?: HTMLTabworthyDatesCalendarElement;
  private errorMessage = "";

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
    } else {
      this.internalValue = null;
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

  private handlePickerSelection = async (dateString: string | undefined) => {
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
    } else {
      const date = removeTimezoneOffset(new Date(dates[0]));
      this.updateValue(date);

      // Update calendar with selected date
      if (this.pickerRef) {
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

    // Try to parse the input value using the component's format first (strict mode)
    // This prevents dayjs from misinterpreting date formats (e.g., DD/MM/YYYY as MM/DD/YYYY)
    let parsed = dayjs(value, this.format, true);

    // Fall back to loose parsing if strict format doesn't match
    if (!parsed.isValid()) {
      parsed = dayjs(value);
    }

    if (parsed.isValid()) {
      this.selectedHours = parsed.hour();
      this.selectedMinutes = parsed.minute();
      this.updateValue(parsed.toDate());
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
                  disabled={this.disabledState}
                  onTimeChanged={this.handleTimeChange}
                  labels={this.timesPickerLabels}
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
