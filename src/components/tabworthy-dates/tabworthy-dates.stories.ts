import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import type { JSX } from "../../components";

const meta: Meta<JSX.TabworthyDates> = {
  title: "TabworthyDates",
  tags: ["autodocs"],
  argTypes: {
    onSelectDate: { action: "selectDate" },
    onChangeYear: { action: "changeYear" },
    onComponentReady: { action: "componentReady" }
  },
  render: (args) => html`
    <tabworthy-dates
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
      .quickButtons=${args.quickButtons}
      first-day-of-week=${ifDefined(args.firstDayOfWeek)}
      ?range=${args.range}
      ?show-quick-buttons=${args.showQuickButtons}
      ?disabled=${args.disabled}
      ?inline=${args.inline}
      ?show-year-stepper=${args.showYearStepper}
      ?show-month-stepper=${args.showMonthStepper}
      show-clear-button=${args.showClearButton}
      show-today-button=${args.showTodayButton}
      show-close-button=${args.showCloseButton}
      ?year-only=${args.yearOnly}
      ?show-keyboard-hint=${args.showKeyboardHint}
      input-should-format=${args.inputShouldFormat}
      calendar-button-content=${ifDefined(args.calendarButtonContent)}
      ?disable-freeform-input=${args.disableFreeformInput}
      input-class=${ifDefined(args.inputClass)}
      @selectDate=${(e: CustomEvent) => args.onSelectDate?.(e.detail)}
      @changeYear=${(e: CustomEvent) => args.onChangeYear?.(e.detail)}
      @componentReady=${(e: CustomEvent) => args.onComponentReady?.(e.detail)}
    ></tabworthy-dates>
  `
};

export default meta;
type Story = StoryObj<JSX.TabworthyDates>;

export const Default: Story = {
  args: {
    id: "datepicker-default",
    label: "Choose a date",
    placeholder: 'Try "tomorrow" or "in ten days"',
    locale: "en-US",
    format: "YYYY-MM-DD",
    firstDayOfWeek: 1,
    showQuickButtons: true,
    showMonthStepper: true,
    showYearStepper: false,
    showClearButton: true,
    showTodayButton: true,
    showKeyboardHint: false,
    inputShouldFormat: true
  }
};

export const RangeMode: Story = {
  args: {
    ...Default.args,
    id: "datepicker-range",
    range: true,
    label: "Choose a date range",
    placeholder: 'Try "June 8 to 12"',
    quickButtons: ["Yesterday to today", "July 5 to 10"]
  }
};

export const WithValue: Story = {
  args: {
    ...Default.args,
    id: "datepicker-value",
    value: "2026-03-15"
  }
};

export const Inline: Story = {
  args: {
    ...Default.args,
    id: "datepicker-inline",
    inline: true,
    showQuickButtons: false
  }
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    id: "datepicker-disabled",
    disabled: true
  }
};

export const WithConstraints: Story = {
  args: {
    ...Default.args,
    id: "datepicker-constrained",
    minDate: "2026-03-01",
    maxDate: "2026-03-31",
    startDate: "2026-03-15"
  }
};

export const UnsupportedLocale: Story = {
  args: {
    ...Default.args,
    id: "datepicker-sv",
    locale: "sv-SE",
    label: "Välj ett datum",
    showQuickButtons: false
  }
};

export const MinimalUI: Story = {
  args: {
    ...Default.args,
    id: "datepicker-minimal",
    showQuickButtons: false,
    showClearButton: false,
    showTodayButton: false,
    inputShouldFormat: false,
    quickButtons: []
  }
};

export const MaxUI: Story = {
  args: {
    ...Default.args,
    id: "datepicker-max-ui",
    showMonthStepper: true,
    showYearStepper: true,
    showClearButton: true,
    showCloseButton: true
  }
};

export const WithoutInputShouldFormat: Story = {
  args: {
    ...Default.args,
    id: "datepicker-no-format-on-accept",
    format: "DD/MM/YYYY",
    value: "01/01/2024",
    showQuickButtons: false,
    inputShouldFormat: false
  }
};

export const WithoutFreeFormInput: Story = {
  args: {
    ...Default.args,
    id: "datepicker-no-freeform",
    label: "Choose a date (picker only)",
    placeholder: "Select a date from the picker",
    showQuickButtons: false,
    disableFreeformInput: true,
    value: "2024-06-15"
  }
};

export const YearOnly: Story = {
  args: {
    ...Default.args,
    id: "datepicker-no-freeform",
    label: "Choose a year",
    placeholder: "Select a year from the picker",
    yearOnly: true
  }
};
