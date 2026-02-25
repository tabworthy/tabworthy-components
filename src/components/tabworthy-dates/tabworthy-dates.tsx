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
import { announce } from "@react-aria/live-announcer";
import moment from "moment";

import { getISODateString, removeTimezoneOffset } from "@shared/utils/utils";
import {
  DatesCalendarLabels,
  MonthChangedEventDetails,
  YearChangedEventDetails
} from "../tabworthy-dates-calendar/tabworthy-dates-calendar";
import {
  ChronoOptions,
  ChronoParsedDateString
} from "@shared/utils/chrono-parser/chrono-parser.type";
import {
  chronoParseDate,
  chronoParseRange
} from "@shared/utils/chrono-parser/chrono-parser";

export interface DatesLabels {
  selected: string;
  openCalendar: string;
  calendar: string;
  errorMessage?: string;
  invalidDateError: string;
  maxDateError: string;
  minDateError: string;
  rangeOutOfBoundsError: string;
  disabledDateError: string;
  to: string;
  startDate: string;
}

const defaultLabels: DatesLabels = {
  selected: "selected",
  openCalendar: "Open calendar",
  calendar: "calendar",
  invalidDateError: "We could not find a matching date",
  minDateError: `Please fill in a date after `,
  maxDateError: `Please fill in a date before `,
  rangeOutOfBoundsError: `Please enter a valid range of dates`,
  disabledDateError: `Please choose an available date`,
  to: "to",
  startDate: "Start date"
};

@Component({
  scoped: true,
  shadow: false,
  styleUrl: "tabworthy-dates.css",
  tag: "tabworthy-dates"
})
export class TabworthyDates {
  @Element() el!: HTMLElement;
  // A unique ID for the datepicker. Mandatory for accessibility
  @Prop({ reflect: true }) id!: string;
  // Current value of the datepicker
  @Prop({ mutable: true }) value?: string | string[];
  // Enable or disable range mode
  @Prop() range?: boolean = false;
  // A label for the text field
  @Prop() label: string = this.range
    ? "Choose a date range (any way you like)"
    : "Choose a date (any way you like)";
  // A placeholder for the text field
  @Prop() placeholder: string = this.range
    ? `Try "June 8 to 12"`
    : `Try "tomorrow" or "in ten days"`;
  // Locale used for internal translations and date parsing
  @Prop() locale: string = navigator?.language || "en-US";
  // If the datepicker is disabled
  @Prop() disabled: boolean = false;
  // Earliest accepted date (YYYY-MM-DD)
  @Prop() minDate?: string;
  // Latest accepted date (YYYY-MM-DD)
  @Prop() maxDate?: string;
  // Which date to be displayed when calendar is first opened
  @Prop() startDate: string = getISODateString(new Date());
  // Reference date used for Chrono date parsing. Equals "today"
  @Prop() referenceDate: string = getISODateString(new Date());
  // Enable or disable strict Chrono date parsing
  @Prop() useStrictDateParsing: boolean = false;

  // Labels used for internal translations
  @Prop() datesLabels: DatesLabels = defaultLabels;
  @Prop() datesCalendarLabels?: DatesCalendarLabels;

  // Prevent hiding the calendar
  @Prop() inline: boolean = false;

  // Current error state of the input field
  @Prop({ mutable: true }) hasError: boolean = false;
  // Text label for next month button
  @Prop() nextMonthButtonContent?: string;
  // Text label for next year button
  @Prop() nextYearButtonContent?: string;
  // Show or hide the next/previous year buttons
  @Prop() showYearStepper: boolean = false;
  // Show or hide the next/previous month buttons
  @Prop() showMonthStepper: boolean = true;
  // Show or hide the clear button
  @Prop() showClearButton: boolean = true;
  // Show or hide the today button
  @Prop() showTodayButton: boolean = true;
  // Enable or disable input field formatting for accepted dates (eg. "Tuesday May 2, 2021" instead of "2021-05-02")
  @Prop({ attribute: "input-should-format" }) inputShouldFormat?:
    | boolean
    | string = true;
  // Show or hide the keyboard hints
  @Prop() showKeyboardHint: boolean = false;
  // Function to disable individual dates
  @Prop() disableDate: HTMLTabworthyDatesCalendarElement["disableDate"] = () =>
    false;
  // Component name used to generate CSS classes
  @Prop() elementClassName: string = "tabworthy-dates";
  // Which day that should start the week (0 is sunday, 1 is monday)
  @Prop() firstDayOfWeek?: number = 1; // Monday
  // Format for the value prop (input/output format). Defaults to ISO format (YYYY-MM-DD). Uses moment.js format tokens.
  @Prop() format: string = "YYYY-MM-DD";
  // Quick buttons with dates displayed under the text field
  @Prop() quickButtons: string[] = this.range
    ? ["Monday to Wednesday", "July 5 to 10"]
    : ["Yesterday", "Today", "Tomorrow", "In 10 days"];
  // Text content for the today button in the calendar
  @Prop() todayButtonContent?: string;
  // HTML content for the calendar button (allows custom icons/SVG)
  @Prop() calendarButtonContent?: string;
  // Show or hide the quick buttons
  @Prop() showQuickButtons: boolean = true;
  @Prop() disableFreeformInput: boolean = false;
  @Prop() inputClass: string = "";

  @State() internalValue?: string | string[] | null;
  @State() errorState: boolean = this.hasError;
  @State() disabledState: boolean = this.disabled;

  @Event() selectDate!: EventEmitter<string | string[] | undefined>;

  @Event() changeYear?: EventEmitter<YearChangedEventDetails>;

  @Event() componentReady!: EventEmitter<void>;

  private modalRef?: HTMLTabworthyDatesModalElement;
  private inputRef!: HTMLInputElement;
  private inputContainerRef?: HTMLDivElement;
  private pickerRef?: HTMLTabworthyDatesCalendarElement;
  private chronoSupportedLocale = ["en", "ja", "fr", "nl", "ru", "pt"].includes(
    this.locale.slice(0, 2)
  );
  private errorMessage = "";

  private shouldInputFormat() {
    if (typeof this.inputShouldFormat === "string") {
      return this.inputShouldFormat === "true";
    }
    return !!this.inputShouldFormat;
  }

  componentDidLoad() {
    this.syncFromValueProp(this.value);
    this.componentReady.emit();
    if (!this.id) {
      console.error(
        'tabworthy-dates: The "id" prop is required for accessibility'
      );
    }
    if (!this.chronoSupportedLocale)
      console.warn(
        `tabworthy-dates: The chosen locale "${this.locale}" is not supported by Chrono.js. Date parsing has been disabled`
      );
  }

  // External method to parse text string using Chrono.js and (optionally) set as value.
  @Method()
  async parseDate(
    text: string,
    shouldSetValue = true,
    chronoOptions: ChronoOptions | undefined = undefined
  ): Promise<ChronoParsedDateString> {
    const parsedDate = await chronoParseDate(text, {
      locale: this.locale.slice(0, 2),
      minDate: this.minDate,
      maxDate: this.minDate,
      referenceDate: removeTimezoneOffset(new Date(this.referenceDate)),
      ...chronoOptions
    });
    if (shouldSetValue) {
      if (parsedDate && parsedDate.value instanceof Date) {
        this.updateValue(parsedDate.value);
      } else this.errorState = true;
    }
    return {
      value:
        parsedDate && parsedDate.value instanceof Date
          ? moment(parsedDate.value).format(this.format)
          : undefined,
      reason: parsedDate && parsedDate.reason ? parsedDate.reason : undefined
    };
  }

  // @ts-ignore
  private isRangeValue(value?: string | string[]): value is Date[] {
    if (
      Array.isArray(value) &&
      new Date(value[0]) instanceof Date &&
      new Date(value[1]) instanceof Date
    )
      return !!this.range;
  }

  private updateValue(newValue: Date | Date[]) {
    // Range
    if (Array.isArray(newValue)) {
      this.internalValue = newValue.map((date) =>
        moment(date).format(this.format)
      );
    }
    // Single
    else {
      this.internalValue = moment(newValue).format(this.format);
    }
    if (this.pickerRef) {
      this.pickerRef.value = newValue;
    }

    this.errorState = false;
    this.value = this.internalValue;
    this.selectDate.emit(this.internalValue);
    this.announceDateChange(this.internalValue);
  }

  private handleCalendarButtonClick = async () => {
    await customElements.whenDefined("tabworthy-dates-modal");
    // Use input container as trigger for proper dropdown alignment
    this.inputContainerRef &&
      (await this.modalRef?.setTriggerElement(this.inputContainerRef));
    if ((await this.modalRef?.getState()) === false)
      await this.modalRef?.open();
    else if ((await this.modalRef?.getState()) === true)
      await this.modalRef?.close();
  };

  private handleQuickButtonClick = async (event: MouseEvent) => {
    const parser = this.range ? chronoParseRange : chronoParseDate;
    const parsedDate = await parser(
      (event.target as HTMLButtonElement).innerText,
      {
        locale: this.locale.slice(0, 2),
        minDate: this.minDate,
        maxDate: this.maxDate,
        referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
      }
    );
    if (parsedDate) {
      // Single date
      if (parsedDate.value instanceof Date) {
        this.updateValue(parsedDate.value);
        if (document.activeElement !== this.inputRef) {
          this.formatInput(true, false);
        }
      } else {
        // Date range
        const newValue = [];
        if (parsedDate.value?.start instanceof Date) {
          newValue.push(parsedDate.value.start);
        }
        if (parsedDate.value && parsedDate.value.end instanceof Date)
          newValue.push(parsedDate.value.end);
        this.updateValue(newValue);
        this.formatInput(true, false);
      }
    }
  };

  private handleChangedMonths = (newMonth: MonthChangedEventDetails) => {
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        month: "long",
        year: "numeric"
      }).format(
        removeTimezoneOffset(new Date(`${newMonth.year}-${newMonth.month}`))
      )}`,
      "assertive"
    );
  };

  private handleYearChange = (yearDetail: YearChangedEventDetails) => {
    this.changeYear?.emit(yearDetail);
  };

  private handleRangeChange = async (value: string) => {
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
    if (parsedRange?.value && parsedRange.value.start instanceof Date)
      newValue.push(parsedRange.value.start);
    if (parsedRange?.value && parsedRange.value.end instanceof Date)
      newValue.push(parsedRange.value.end);
    this.updateValue(newValue);
    this.formatInput(true, false);

    if (newValue.length === 0) {
      this.errorState = true;
      if (!!parsedRange?.reason) {
        this.errorMessage = {
          invalid: this.datesLabels.invalidDateError,
          rangeOutOfBounds: this.datesLabels.rangeOutOfBoundsError,
          minDate: "",
          maxDate: ""
        }[parsedRange.reason];
      }
    }
  };

  private handleSingleDateChange = async (value: string) => {
    this.errorState = false;
    if (value.length === 0) {
      this.internalValue = "";
      if (this.pickerRef) {
        this.pickerRef.value = null;
      }
      this.value = this.internalValue;
      return this.selectDate.emit(this.internalValue);
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
      } else {
        this.updateValue(parsedDate.value);
        this.formatInput(true, false);
      }
    } else if (parsedDate) {
      this.errorState = true;
      this.internalValue = null;
      let maxDate = undefined;
      let minDate = undefined;
      if (this.maxDate) {
        maxDate = this.maxDate
          ? removeTimezoneOffset(new Date(this.maxDate))
          : undefined;
        maxDate?.setDate(maxDate.getDate() + 1);
      }
      if (this.minDate) {
        minDate = this.minDate
          ? removeTimezoneOffset(new Date(this.minDate))
          : undefined;
        minDate?.setDate(minDate.getDate() - 1);
      }

      if (!!parsedDate.reason) {
        this.errorMessage = parsedDate.reason;
        this.errorMessage = {
          // TODO: Add locale date formatting to these messages
          minDate: minDate
            ? `${this.datesLabels.minDateError} ${getISODateString(minDate)}`
            : "",
          maxDate: maxDate
            ? `${this.datesLabels.maxDateError} ${getISODateString(maxDate)}`
            : "",
          invalid: this.datesLabels.invalidDateError
        }[parsedDate.reason];
      }
    }
  };

  private handleChange = async (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

    if (this.range) {
      await this.handleRangeChange(value);
    } else {
      await this.handleSingleDateChange(value);
    }
  };

  private formatInput(enabled: boolean, useInputValue = true) {
    if (this.shouldInputFormat() === false || enabled === false) {
      if (this.internalValue) {
        if (this.internalValue.length === 0) return;
        this.inputRef.value = this.internalValue
          .toString()
          .replace(",", ` ${this.datesLabels.to} `);
      }
      return;
    }
    if (
      this.internalValue &&
      this.shouldInputFormat() === true &&
      this.errorState === false
    ) {
      if (Array.isArray(this.internalValue)) {
        if (this.internalValue.length === 0) return; // Range date is invalid, leave the text field as is
        let output = "";
        this.internalValue.forEach((value, index) => {
          const parsedDate = moment(
            useInputValue ? this.inputRef.value : value,
            this.format,
            true
          );
          const dateToFormat = parsedDate.isValid()
            ? parsedDate.toDate()
            : removeTimezoneOffset(
                new Date(useInputValue ? this.inputRef.value : value)
              );
          return (output += `${
            index === 1 ? ` ${this.datesLabels.to} ` : ""
          }${Intl.DateTimeFormat(this.locale, {
            day: "numeric",
            month: "short",
            year: "numeric"
          }).format(dateToFormat)}`);
        });
        this.inputRef.value = output;
      } else {
        const parsedDate = moment(
          useInputValue ? this.inputRef.value : this.internalValue,
          this.format,
          true
        );
        const dateToFormat = parsedDate.isValid()
          ? parsedDate.toDate()
          : removeTimezoneOffset(
              new Date(useInputValue ? this.inputRef.value : this.internalValue)
            );
        this.inputRef.value = Intl.DateTimeFormat(this.locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(dateToFormat);
      }
    }
  }

  private handlePickerSelection(newValue: string | string[] | undefined) {
    if (this.isRangeValue(newValue)) {
      if (newValue.length === 2) this.modalRef?.close();
      // Convert ISO dates to specified format
      this.internalValue = newValue.map((date) =>
        moment(date).format(this.format)
      );
      this.errorState = false;
      if (document.activeElement !== this.inputRef) {
        this.formatInput(true, false);
      }
      this.announceDateChange(this.internalValue);
    } else {
      this.modalRef?.close();
      // Convert ISO date to specified format
      const formattedDate = newValue
        ? moment(newValue).format(this.format)
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

  private announceDateChange(newValue: string | string[] | undefined) {
    if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
      return;
    }

    const newValueInIsoFormat = Array.isArray(newValue)
      ? newValue.map((date) => moment(date, this.format).toISOString())
      : moment(newValue, this.format).toISOString();

    let content = "";
    if (Array.isArray(newValueInIsoFormat)) {
      if (newValueInIsoFormat.length === 1) {
        content += `${this.datesLabels.startDate} `;
      }
      newValueInIsoFormat.forEach(
        (value, index) =>
          (content += `${
            index === 1 ? ` ${this.datesLabels.to} ` : ""
          }${Intl.DateTimeFormat(this.locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }).format(removeTimezoneOffset(new Date(value)))}`)
      );
    } else
      content = Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(removeTimezoneOffset(new Date(newValueInIsoFormat)));
    if (content.length === 0) return;
    content += ` ${this.datesLabels.selected}`;
    const contentNoCommas = content.replace(/\,/g, "");
    announce(contentNoCommas, "polite");
  }

  @Watch("disabled")
  watchDisabled(newValue: boolean) {
    this.disabledState = newValue;
  }

  @Watch("value")
  watchValue(newValue: string | string[] | undefined) {
    this.syncFromValueProp(newValue);
  }

  private getClassName(element?: string) {
    return Boolean(element)
      ? `${this.elementClassName}__${element}`
      : this.elementClassName;
  }

  private syncFromValueProp(value: string | string[] | undefined) {
    this.internalValue = value;

    // update calendar (expects Date or Date[])
    if (this.pickerRef) {
      if (Array.isArray(value)) {
        const dates = value.reduce((acc: Date[], v) => {
          const d = moment(v, this.format, true);
          if (d.isValid()) acc.push(d.toDate());
          return acc;
        }, [] as Date[]);
        this.pickerRef.value = dates.length ? dates : null;
      } else {
        if (value) {
          const parsedDate = moment(value, this.format, true);
          if (parsedDate.isValid()) {
            this.pickerRef.value = parsedDate.toDate();
          }
        } else {
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
    return (
      <Host>
        <label
          htmlFor={this.id ? `${this.id}-input` : undefined}
          class={this.getClassName("label")}
        >
          {this.label}
        </label>
        <br />
        <div
          class={this.getClassName("input-container")}
          ref={(r) => (this.inputContainerRef = r)}
        >
          <input
            disabled={this.disabledState || this.disableFreeformInput}
            id={this.id ? `${this.id}-input` : undefined}
            type="text"
            placeholder={this.placeholder}
            class={{
              [this.getClassName("input")]: true,
              [this.inputClass]: !!this.inputClass
            }}
            ref={(r) => (this.inputRef = r as HTMLInputElement)}
            onChange={this.handleChange}
            onFocus={() => this.formatInput(false)}
            onBlur={() => this.formatInput(true, false)}
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
                this.datesLabels.openCalendar
              )}
            </button>
          )}
        </div>
        <tabworthy-dates-modal
          label={this.datesLabels.calendar}
          ref={(el) => (this.modalRef = el)}
          onOpened={() => {
            if (!this.pickerRef) return;

            this.pickerRef.modalIsOpen = true;
          }}
          onClosed={() => {
            if (!this.pickerRef) return;

            this.pickerRef.modalIsOpen = false;
          }}
          inline={this.inline}
        >
          <tabworthy-dates-calendar
            range={this.range}
            locale={this.locale}
            onSelectDate={(event) =>
              this.handlePickerSelection(event.detail as string)
            }
            onChangeMonth={(event) =>
              this.handleChangedMonths(event.detail as MonthChangedEventDetails)
            }
            onChangeYear={(event) =>
              this.handleYearChange(event.detail as YearChangedEventDetails)
            }
            labels={
              this.datesCalendarLabels ? this.datesCalendarLabels : undefined
            }
            ref={(el) => (this.pickerRef = el)}
            startDate={this.startDate}
            firstDayOfWeek={this.firstDayOfWeek}
            showHiddenTitle={true}
            disabled={this.disabledState}
            showMonthStepper={this.showMonthStepper}
            showYearStepper={this.showYearStepper}
            showClearButton={this.showClearButton}
            showKeyboardHint={this.showKeyboardHint}
            showTodayButton={this.showTodayButton}
            disableDate={this.disableDate}
            minDate={this.minDate}
            maxDate={this.maxDate}
            inline={this.inline}
          />
        </tabworthy-dates-modal>
        {this.showQuickButtons &&
          this.quickButtons?.length > 0 &&
          this.chronoSupportedLocale && (
            <div
              class={this.getClassName("quick-group")}
              role="group"
              aria-label="Quick selection"
            >
              {this.quickButtons.map((buttonText) => {
                return (
                  <button
                    class={this.getClassName("quick-button")}
                    onClick={this.handleQuickButtonClick}
                    disabled={this.disabledState}
                    type="button"
                  >
                    {buttonText}
                  </button>
                );
              })}
            </div>
          )}

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
