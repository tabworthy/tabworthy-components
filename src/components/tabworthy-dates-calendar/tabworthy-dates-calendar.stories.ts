import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import { Components } from "../../components";
import { getISODateString } from "@shared/utils/utils";

const meta: Meta<Components.TabworthyDatesCalendar> = {
  title: "Building Blocks/TabworthyDatesCalendar",
  tags: ["autodocs"],
  argTypes: {
    selectDate: { action: "selectDate" },
    changeMonth: { action: "changeMonth" },
    changeYear: { action: "changeYear" }
  },
  render: (args) => html`
    <tabworthy-dates-calendar
      .value=${ifDefined(args.value)}
      ?range=${args.range}
      locale=${ifDefined(args.locale)}
      min-date=${ifDefined(args.minDate)}
      max-date=${ifDefined(args.maxDate)}
      start-date=${ifDefined(args.startDate)}
      first-day-of-week=${ifDefined(args.firstDayOfWeek)}
      ?show-year-stepper=${args.showYearStepper}
      ?show-month-stepper=${args.showMonthStepper}
      ?show-clear-button=${args.showClearButton}
      ?show-today-button=${args.showTodayButton}
      ?show-hidden-title=${args.showHiddenTitle}
      ?show-keyboard-hint=${args.showKeyboardHint}
      ?show-close-button=${args.showCloseButton}
      ?disabled=${args.disabled}
      .disableDate=${args.disableDate}
      ?inline=${args.inline}
      @selectDate=${(e: CustomEvent) => args.selectDate?.(e.detail)}
      @changeMonth=${(e: CustomEvent) => args.changeMonth?.(e.detail)}
      @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
    ></tabworthy-dates-calendar>
  `
};

export default meta;
type Story = StoryObj<Components.TabworthyDatesCalendar>;

export const Default: Story = {
  args: {
    startDate: "2026-02-12",
    firstDayOfWeek: 1,
    showMonthStepper: true,
    showYearStepper: false,
    showClearButton: true,
    showTodayButton: true,
    showHiddenTitle: true,
    locale: "en-US"
  }
};

export const RangeMode: Story = {
  args: {
    ...Default.args,
    range: true
  }
};

export const WithSelectedDate: Story = {
  args: {
    ...Default.args,
    value: new Date("2026-02-15")
  }
};

export const WithSelectedRange: Story = {
  args: {
    ...Default.args,
    range: true,
    value: [new Date("2026-02-10"), new Date("2026-02-15")]
  }
};

export const WithConstraints: Story = {
  args: {
    ...Default.args,
    minDate: "2026-02-05",
    maxDate: "2026-02-25"
  }
};

export const WithDisabledDates: Story = {
  args: {
    ...Default.args,
    disableDate: (date: Date) => getISODateString(date).endsWith("-13")
  }
};

export const Inline: Story = {
  args: {
    ...Default.args,
    inline: true,
    showKeyboardHint: true
  }
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true
  }
};

export const MaxUI: Story = {
  args: {
    ...Default.args,
    showMonthStepper: true,
    showYearStepper: true,
    showClearButton: true,
    showCloseButton: true
  }
};
