import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import { Components } from "../../components";

const meta: Meta<Components.TabworthyDates> = {
  title: "TabworthyDates",
  tags: ["autodocs"],
  argTypes: {
    selectDate: { action: "selectDate" },
    changeYear: { action: "changeYear" },
    componentReady: { action: "componentReady" }
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
      ?show-keyboard-hint=${args.showKeyboardHint}
      input-should-format=${args.inputShouldFormat}
      calendar-button-content=${ifDefined(args.calendarButtonContent)}
      ?disable-freeform-input=${args.disableFreeformInput}
      input-class=${ifDefined(args.inputClass)}
      @selectDate=${(e: CustomEvent) => {
        args.selectDate?.(e.detail);
      }}
      @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
      @componentReady=${(e: CustomEvent) => args.componentReady?.(e.detail)}
    ></tabworthy-dates>
  `
};

export default meta;
type Story = StoryObj<Components.TabworthyDates>;

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
    showClearButton: true
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
