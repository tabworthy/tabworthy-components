import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import type { JSX } from "../../components";

const meta: Meta<JSX.TabworthyTimes> = {
  title: "TabworthyTimes",
  tags: ["autodocs"],
  argTypes: {
    onSelectDateTime: { action: "selectDateTime" },
    onChangeYear: { action: "changeYear" },
    onComponentReady: { action: "componentReady" },
    onErrorChange: { action: "errorChange" }
  },
  render: (args) => html`
    <tabworthy-times
      id=${args.id}
      .value=${ifDefined(args.value)}
      label=${ifDefined(args.label)}
      placeholder=${ifDefined(args.placeholder)}
      locale=${ifDefined(args.locale)}
      format=${ifDefined(args.format)}
      min-date=${ifDefined(args.minDate)}
      max-date=${ifDefined(args.maxDate)}
      start-date=${ifDefined(args.startDate)}
      reference-date=${ifDefined(args.referenceDate)}
      first-day-of-week=${ifDefined(args.firstDayOfWeek)}
      ?range=${args.range}
      ?disabled=${args.disabled}
      ?inline=${args.inline}
      .useTwelveHourFormat=${args.useTwelveHourFormat}
      ?show-year-stepper=${args.showYearStepper}
      ?show-month-stepper=${args.showMonthStepper}
      ?show-clear-button=${args.showClearButton}
      ?show-today-button=${args.showTodayButton}
      ?show-close-button=${args.showCloseButton}
      ?show-seconds=${args.showSeconds}
      input-should-format=${args.inputShouldFormat}
      calendar-button-content=${ifDefined(args.calendarButtonContent)}
      next-month-button-content=${ifDefined(args.nextMonthButtonContent)}
      next-year-button-content=${ifDefined(args.nextYearButtonContent)}
      previous-month-button-content=${ifDefined(
        args.previousMonthButtonContent
      )}
      previous-year-button-content=${ifDefined(args.previousYearButtonContent)}
      today-button-content=${ifDefined(args.todayButtonContent)}
      clear-button-content=${ifDefined(args.clearButtonContent)}
      close-button-content=${ifDefined(args.closeButtonContent)}
      ?disable-freeform-input=${args.disableFreeformInput}
      input-class=${ifDefined(args.inputClass)}
      @selectDateTime=${(e: CustomEvent) => args.onSelectDateTime?.(e.detail)}
      @changeYear=${(e: CustomEvent) => args.onChangeYear?.(e.detail)}
      @componentReady=${(e: CustomEvent) => args.onComponentReady?.(e.detail)}
      @errorChange=${(e: CustomEvent) => args.onErrorChange?.(e.detail)}
    ></tabworthy-times>
  `
};

export default meta;
type Story = StoryObj<JSX.TabworthyTimes>;

export const Default: Story = {
  args: {
    id: "datetime-default",
    label: "Choose a date and time",
    placeholder: "Select date and time",
    locale: "en-US"
  }
};

export const WithInitialValue: Story = {
  args: {
    ...Default.args,
    id: "datetime-value",
    value: "2024-03-15T14:30:00"
  }
};

export const TwentyFourHourFormat: Story = {
  args: {
    ...Default.args,
    id: "datetime-24h",
    useTwelveHourFormat: false,
    value: "2024-03-15T14:30:00"
  }
};

export const WithConstraints: Story = {
  args: {
    ...Default.args,
    id: "datetime-constraints",
    minDate: "2024-01-01",
    maxDate: "2024-12-31",
    value: "2024-06-15T10:00:00"
  }
};

export const WithOutOfBoundsDate: Story = {
  args: {
    ...Default.args,
    id: "datetime-out-of-bounds",
    minDate: "2026-03-01 00:00:00",
    maxDate: "2026-03-31 15:59:59",
    value: "2024-06-15T10:00:00"
  }
};

export const Inline: Story = {
  args: {
    ...Default.args,
    id: "datetime-inline",
    inline: true,
    value: "2024-03-15T14:30:00"
  }
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    id: "datetime-disabled",
    disabled: true,
    value: "2024-03-15T14:30:00"
  }
};

export const WithoutFormatInputOnAccept: Story = {
  args: {
    ...Default.args,
    id: "datetime-no-format-on-accept",
    inputShouldFormat: false,
    value: "2024-03-15T14:30:00"
  }
};

export const WithoutFreeFormInput: Story = {
  args: {
    ...Default.args,
    id: "datetime-no-freeform",
    label: "Choose a datetime (picker only)",
    placeholder: "Select a datetime from the picker",
    disableFreeformInput: true,
    value: "2024-03-15T14:30:00"
  }
};

export const MaxUI: Story = {
  args: {
    id: "datetime-default",
    label: "Choose a date and time",
    placeholder: "Select date and time",
    locale: "en-US",
    format: "YYYY-MM-DDTHH:mm:ss",
    useTwelveHourFormat: true,
    showMonthStepper: true,
    showYearStepper: false,
    showClearButton: true,
    showTodayButton: true,
    showCloseButton: true,
    showSeconds: true,
    firstDayOfWeek: 1
  }
};

export const CustomButtonContent: Story = {
  args: {
    ...Default.args,
    id: "datetime-custom-buttons",
    label: "Custom button content",
    showYearStepper: true,
    showMonthStepper: true,
    showTodayButton: true,
    showClearButton: true,
    showCloseButton: true,
    calendarButtonContent: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    nextMonthButtonContent: "→",
    nextYearButtonContent: "⇒",
    previousMonthButtonContent: "←",
    previousYearButtonContent: "⇐",
    todayButtonContent: "📍",
    clearButtonContent: "🗑",
    closeButtonContent: "✕"
  }
};
