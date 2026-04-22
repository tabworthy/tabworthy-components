import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch
} from "@stencil/core";

export interface TimeBounds {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
  period?: "AM" | "PM";
}

export interface TimesPickerLabels {
  hours: string;
  minutes: string;
  seconds: string;
  am: string;
  pm: string;
  timePicker: string;
  incrementHours: string;
  decrementHours: string;
  incrementMinutes: string;
  decrementMinutes: string;
  incrementSeconds: string;
  decrementSeconds: string;
}

const defaultLabels: TimesPickerLabels = {
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  am: "AM",
  pm: "PM",
  timePicker: "Time picker",
  incrementHours: "Increment hours",
  decrementHours: "Decrement hours",
  incrementMinutes: "Increment minutes",
  decrementMinutes: "Decrement minutes",
  incrementSeconds: "Increment seconds",
  decrementSeconds: "Decrement seconds"
};

@Component({
  scoped: true,
  shadow: false,
  tag: "tabworthy-times-picker"
})
export class TabworthyTimesPicker {
  @Element() el!: HTMLElement;

  // Current time value (24-hour format)
  @Prop({ mutable: true }) hours: number = 12;
  @Prop({ mutable: true }) minutes: number = 0;
  @Prop({ mutable: true }) seconds: number = 0;

  @Prop() useTwelveHourFormat: boolean = false;
  @Prop() showSeconds: boolean = false;
  // Labels for accessibility and i18n
  @Prop() labels: TimesPickerLabels = defaultLabels;
  // Hide labels visually but keep them for screen readers
  @Prop() labelsSrOnly: boolean = true;
  @Prop() disabled: boolean = false;
  @Prop() elementClassName: string = "tabworthy-times-picker";
  // Minimum allowed time (24-hour format). Applied when selected date is on the boundary day.
  @Prop() minTime?: TimeBounds;
  // Maximum allowed time (24-hour format). Applied when selected date is on the boundary day.
  @Prop() maxTime?: TimeBounds;

  @State() internalHours: number = this.hours;
  @State() internalMinutes: number = this.minutes;
  @State() internalSeconds: number = this.seconds;
  @State() period: "AM" | "PM" = this.hours >= 12 ? "PM" : "AM";

  @Event() timeChanged!: EventEmitter<TimeValue>;

  @Watch("hours")
  watchHours(newValue: number) {
    this.internalHours = newValue;
    this.period = newValue >= 12 ? "PM" : "AM";
  }

  @Watch("minutes")
  watchMinutes(newValue: number) {
    this.internalMinutes = newValue;
  }

  @Watch("seconds")
  watchSeconds(newValue: number) {
    this.internalSeconds = newValue;
  }

  componentWillLoad() {
    this.internalHours = this.hours;
    this.internalMinutes = this.minutes;
    this.internalSeconds = this.seconds;
    this.period = this.hours >= 12 ? "PM" : "AM";
  }

  private getDisplayHours(): number {
    if (!this.useTwelveHourFormat) {
      return this.internalHours;
    }

    if (this.internalHours === 0) return 12;
    if (this.internalHours > 12) return this.internalHours - 12;
    return this.internalHours;
  }

  private get24HourValue(): number {
    if (!this.useTwelveHourFormat) {
      return this.internalHours;
    }

    const displayHours = this.getDisplayHours();
    if (this.period === "AM") {
      return displayHours === 12 ? 0 : displayHours;
    } else {
      return displayHours === 12 ? 12 : displayHours + 12;
    }
  }

  private handleHourChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (isNaN(value)) return;

    if (this.useTwelveHourFormat) {
      // Convert to 24-hour format based on period
      if (this.period === "AM") {
        this.internalHours = value === 12 ? 0 : value;
      } else {
        this.internalHours = value === 12 ? 12 : value + 12;
      }
    } else {
      this.internalHours = value;
    }

    this.emitTimeChange();
  };

  private handleMinuteChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (isNaN(value)) return;
    this.internalMinutes = value;
    this.emitTimeChange();
  };

  private handlePeriodChange = (period: "AM" | "PM") => {
    if (this.period === period || !this.useTwelveHourFormat) return;

    this.period = period;

    // Convert hours based on new period
    const displayHours = this.getDisplayHours();
    if (period === "AM") {
      this.internalHours = displayHours === 12 ? 0 : displayHours;
    } else {
      this.internalHours = displayHours === 12 ? 12 : displayHours + 12;
    }

    this.emitTimeChange();
  };

  private handleHourIncrement = () => {
    if (this.useTwelveHourFormat) {
      const displayHours = this.getDisplayHours();
      const newDisplayHours = displayHours === 12 ? 1 : displayHours + 1;
      if (this.period === "AM") {
        this.internalHours = newDisplayHours === 12 ? 0 : newDisplayHours;
      } else {
        this.internalHours = newDisplayHours === 12 ? 12 : newDisplayHours + 12;
      }
    } else {
      this.internalHours = (this.internalHours + 1) % 24;
    }
    this.emitTimeChange();
  };

  private handleHourDecrement = () => {
    if (this.useTwelveHourFormat) {
      const displayHours = this.getDisplayHours();
      const newDisplayHours = displayHours === 1 ? 12 : displayHours - 1;
      if (this.period === "AM") {
        this.internalHours = newDisplayHours === 12 ? 0 : newDisplayHours;
      } else {
        this.internalHours = newDisplayHours === 12 ? 12 : newDisplayHours + 12;
      }
    } else {
      this.internalHours =
        this.internalHours === 0 ? 23 : this.internalHours - 1;
    }
    this.emitTimeChange();
  };

  private handleMinuteIncrement = () => {
    this.internalMinutes = (this.internalMinutes + 1) % 60;
    this.emitTimeChange();
  };

  private handleMinuteDecrement = () => {
    this.internalMinutes =
      this.internalMinutes === 0 ? 59 : this.internalMinutes - 1;
    this.emitTimeChange();
  };

  private handleSecondChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (isNaN(value)) return;
    this.internalSeconds = value;
    this.emitTimeChange();
  };

  private handleSecondIncrement = () => {
    this.internalSeconds = (this.internalSeconds + 1) % 60;
    this.emitTimeChange();
  };

  private handleSecondDecrement = () => {
    this.internalSeconds =
      this.internalSeconds === 0 ? 59 : this.internalSeconds - 1;
    this.emitTimeChange();
  };

  private emitTimeChange() {
    this.clampToBounds();
    this.timeChanged.emit({
      hours: this.get24HourValue(),
      minutes: this.internalMinutes,
      seconds: this.showSeconds ? this.internalSeconds : undefined,
      period: this.useTwelveHourFormat ? this.period : undefined
    });
  }

  private clampToBounds() {
    const h = this.get24HourValue();
    const m = this.internalMinutes;
    const s = this.internalSeconds;

    if (this.minTime) {
      const minS = this.minTime.seconds ?? 0;
      if (
        h < this.minTime.hours ||
        (h === this.minTime.hours && m < this.minTime.minutes) ||
        (h === this.minTime.hours && m === this.minTime.minutes && s < minS)
      ) {
        this.setInternal24Hours(this.minTime.hours);
        this.internalMinutes = this.minTime.minutes;
        this.internalSeconds = minS;
      }
    }

    if (this.maxTime) {
      const maxS = this.maxTime.seconds ?? 59;
      const curH = this.get24HourValue();
      const curM = this.internalMinutes;
      const curS = this.internalSeconds;
      if (
        curH > this.maxTime.hours ||
        (curH === this.maxTime.hours && curM > this.maxTime.minutes) ||
        (curH === this.maxTime.hours &&
          curM === this.maxTime.minutes &&
          curS > maxS)
      ) {
        this.setInternal24Hours(this.maxTime.hours);
        this.internalMinutes = this.maxTime.minutes;
        this.internalSeconds = maxS;
      }
    }
  }

  private setInternal24Hours(h24: number) {
    this.internalHours = h24;
    this.period = h24 >= 12 ? "PM" : "AM";
  }

  private isAtMinHour(): boolean {
    return !!this.minTime && this.get24HourValue() <= this.minTime.hours;
  }

  private isAtMaxHour(): boolean {
    return !!this.maxTime && this.get24HourValue() >= this.maxTime.hours;
  }

  private isAtMinMinute(): boolean {
    return (
      this.isAtMinHour() &&
      !!this.minTime &&
      this.internalMinutes <= this.minTime.minutes
    );
  }

  private isAtMaxMinute(): boolean {
    return (
      this.isAtMaxHour() &&
      !!this.maxTime &&
      this.internalMinutes >= this.maxTime.minutes
    );
  }

  private isAtMinSecond(): boolean {
    return (
      this.isAtMinMinute() &&
      !!this.minTime &&
      this.internalSeconds <= (this.minTime.seconds ?? 0)
    );
  }

  private isAtMaxSecond(): boolean {
    return (
      this.isAtMaxMinute() &&
      !!this.maxTime &&
      this.internalSeconds >= (this.maxTime.seconds ?? 59)
    );
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, "0");
  }

  render() {
    const displayHours = this.getDisplayHours();
    const maxHours = this.useTwelveHourFormat ? 12 : 23;
    const minHours = this.useTwelveHourFormat ? 1 : 0;

    return (
      <Host class={this.elementClassName} aria-label={this.labels.timePicker}>
        <div class={`${this.elementClassName}__container`}>
          {/* Hours */}
          <div class={`${this.elementClassName}__field`}>
            <label
              htmlFor={`${this.elementClassName}-hours`}
              class={{
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
              }}
            >
              {this.labels.hours}
            </label>
            <div class={`${this.elementClassName}__control`}>
              <button
                type="button"
                class={`${this.elementClassName}__button ${this.elementClassName}__button--increment`}
                onClick={this.handleHourIncrement}
                disabled={this.disabled || this.isAtMaxHour()}
                aria-label={this.labels.incrementHours}
              >
                <svg
                  fill="none"
                  height="16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <input
                id={`${this.elementClassName}-hours`}
                type="number"
                class={`${this.elementClassName}__input`}
                value={this.padZero(displayHours)}
                min={minHours}
                max={maxHours}
                onInput={this.handleHourChange}
                disabled={this.disabled}
                aria-label={this.labels.hours}
              />
              <button
                type="button"
                class={`${this.elementClassName}__button ${this.elementClassName}__button--decrement`}
                onClick={this.handleHourDecrement}
                disabled={this.disabled || this.isAtMinHour()}
                aria-label={this.labels.decrementHours}
              >
                <svg
                  fill="none"
                  height="16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div class={`${this.elementClassName}__separator`}>:</div>

          {/* Minutes */}
          <div class={`${this.elementClassName}__field`}>
            <label
              htmlFor={`${this.elementClassName}-minutes`}
              class={{
                [`${this.elementClassName}__label`]: true,
                [`${this.elementClassName}__label--sr-only`]: this.labelsSrOnly
              }}
            >
              {this.labels.minutes}
            </label>
            <div class={`${this.elementClassName}__control`}>
              <button
                type="button"
                class={`${this.elementClassName}__button ${this.elementClassName}__button--increment`}
                onClick={this.handleMinuteIncrement}
                disabled={this.disabled || this.isAtMaxMinute()}
                aria-label={this.labels.incrementMinutes}
              >
                <svg
                  fill="none"
                  height="16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <input
                id={`${this.elementClassName}-minutes`}
                type="number"
                class={`${this.elementClassName}__input`}
                value={this.padZero(this.internalMinutes)}
                min={0}
                max={59}
                onInput={this.handleMinuteChange}
                disabled={this.disabled}
                aria-label={this.labels.minutes}
              />
              <button
                type="button"
                class={`${this.elementClassName}__button ${this.elementClassName}__button--decrement`}
                onClick={this.handleMinuteDecrement}
                disabled={this.disabled || this.isAtMinMinute()}
                aria-label={this.labels.decrementMinutes}
              >
                <svg
                  fill="none"
                  height="16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Seconds */}
          {this.showSeconds && [
            <div class={`${this.elementClassName}__separator`}>:</div>,
            <div class={`${this.elementClassName}__field`}>
              <label
                htmlFor={`${this.elementClassName}-seconds`}
                class={{
                  [`${this.elementClassName}__label`]: true,
                  [`${this.elementClassName}__label--sr-only`]:
                    this.labelsSrOnly
                }}
              >
                {this.labels.seconds}
              </label>
              <div class={`${this.elementClassName}__control`}>
                <button
                  type="button"
                  class={`${this.elementClassName}__button ${this.elementClassName}__button--increment`}
                  onClick={this.handleSecondIncrement}
                  disabled={this.disabled || this.isAtMaxSecond()}
                  aria-label={this.labels.incrementSeconds}
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
                <input
                  id={`${this.elementClassName}-seconds`}
                  type="number"
                  class={`${this.elementClassName}__input`}
                  value={this.padZero(this.internalSeconds)}
                  min={0}
                  max={59}
                  onInput={this.handleSecondChange}
                  disabled={this.disabled}
                  aria-label={this.labels.seconds}
                />
                <button
                  type="button"
                  class={`${this.elementClassName}__button ${this.elementClassName}__button--decrement`}
                  onClick={this.handleSecondDecrement}
                  disabled={this.disabled || this.isAtMinSecond()}
                  aria-label={this.labels.decrementSeconds}
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ]}

          {/* AM/PM Toggle */}
          {this.useTwelveHourFormat && (
            <div class={`${this.elementClassName}__period`}>
              <button
                type="button"
                class={{
                  [`${this.elementClassName}__period-button`]: true,
                  [`${this.elementClassName}__period-button--active`]:
                    this.period === "AM"
                }}
                onClick={() => this.handlePeriodChange("AM")}
                disabled={this.disabled}
                aria-label={this.labels.am}
                aria-pressed={this.period === "AM"}
              >
                {this.labels.am}
              </button>
              <button
                type="button"
                class={{
                  [`${this.elementClassName}__period-button`]: true,
                  [`${this.elementClassName}__period-button--active`]:
                    this.period === "PM"
                }}
                onClick={() => this.handlePeriodChange("PM")}
                disabled={this.disabled}
                aria-label={this.labels.pm}
                aria-pressed={this.period === "PM"}
              >
                {this.labels.pm}
              </button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
