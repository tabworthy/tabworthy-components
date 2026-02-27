import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import { Components } from "../../components";

const meta: Meta<Components.TabworthyTimes> = {
  title: "TabworthyTimes",
  tags: ["autodocs"],
  argTypes: {
    selectDateTime: { action: "selectDateTime" },
    changeYear: { action: "changeYear" },
    componentReady: { action: "componentReady" }
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
      ?disable-freeform-input=${args.disableFreeformInput}
      input-class=${ifDefined(args.inputClass)}
      @selectDateTime=${(e: CustomEvent) => args.selectDateTime?.(e.detail)}
      @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
      @componentReady=${(e: CustomEvent) => args.componentReady?.(e.detail)}
    ></tabworthy-times>
  `
};

export default meta;
type Story = StoryObj<Components.TabworthyTimes>;

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
