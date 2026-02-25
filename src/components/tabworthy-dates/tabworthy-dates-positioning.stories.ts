import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { ifDefined } from "lit/directives/if-defined.js";
import { userEvent, within } from "@storybook/test";
import { Components } from "../../components";

// Common args for all positioning stories
const commonArgs = {
  id: "datepicker-positioning",
  label: "Choose a date",
  placeholder: 'Try "tomorrow"',
  locale: "en-US",
  format: "YYYY-MM-DD",
  firstDayOfWeek: 1,
  showQuickButtons: false,
  showMonthStepper: true,
  showYearStepper: false,
  showClearButton: true,
  showTodayButton: true,
  showKeyboardHint: false,
  inputShouldFormat: true
};

// Play function to open the calendar
const openCalendar = async ({
  canvasElement
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  // Wait for component to be ready
  await new Promise((resolve) => setTimeout(resolve, 100));
  const button = canvas.getByRole("button", { name: /open calendar/i });
  await userEvent.click(button);
};

const meta: Meta<
  Components.TabworthyDates & { wrapperStyle?: string; style?: string }
> = {
  title: "TabworthyDates/Positioning",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen"
  }
};

export default meta;

// Basic positioning template
const Template = (args: any) => html`
  <div
    style="display: flex; padding: 1rem; min-height: 100vh; box-sizing: border-box; ${args.wrapperStyle ||
    ""}"
  >
    <div style="position: relative; ${args.style || ""}">
      <tabworthy-dates
        id=${args.id}
        .value=${ifDefined(args.value)}
        label=${ifDefined(args.label)}
        placeholder=${ifDefined(args.placeholder)}
        locale=${ifDefined(args.locale)}
        format=${ifDefined(args.format)}
        first-day-of-week=${ifDefined(args.firstDayOfWeek)}
        ?show-quick-buttons=${args.showQuickButtons}
        ?disabled=${args.disabled}
        ?show-year-stepper=${args.showYearStepper}
        ?show-month-stepper=${args.showMonthStepper}
        show-clear-button=${args.showClearButton}
        show-today-button=${args.showTodayButton}
        ?show-keyboard-hint=${args.showKeyboardHint}
        input-should-format=${args.inputShouldFormat}
        @selectDate=${(e: CustomEvent) => args.selectDate?.(e.detail)}
        @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
        @componentReady=${(e: CustomEvent) => args.componentReady?.(e.detail)}
      ></tabworthy-dates>
    </div>
  </div>
`;

type Story = StoryObj<
  Components.TabworthyDates & { wrapperStyle?: string; style?: string }
>;

// Top Left positioning
export const TopLeft: Story = {
  render: Template,
  args: { ...commonArgs },
  play: openCalendar
};

// Top Right positioning
export const TopRight: Story = {
  render: Template,
  args: {
    ...commonArgs,
    style: "margin-left: auto;"
  },
  play: openCalendar
};

// Bottom Left positioning
export const BottomLeft: Story = {
  render: Template,
  args: {
    ...commonArgs,
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};

// Bottom Right positioning
export const BottomRight: Story = {
  render: Template,
  args: {
    ...commonArgs,
    style: "margin-left: auto;",
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};

// Within Modal template - simulates a modal container with overflow constraints
const WithinModalTemplate = (args: any) => html`
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      padding: 2rem;
      box-sizing: border-box;
    "
  >
    <div
      style="
        background: white;
        border-radius: 8px;
        padding: 2rem;
        width: 100%;
        max-width: 800px;
        min-height: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        ${args.wrapperStyle || ""}
      "
    >
      <div style="position: relative; ${args.style || ""}">
        <tabworthy-dates
          id=${args.id}
          .value=${ifDefined(args.value)}
          label=${ifDefined(args.label)}
          placeholder=${ifDefined(args.placeholder)}
          locale=${ifDefined(args.locale)}
          format=${ifDefined(args.format)}
          first-day-of-week=${ifDefined(args.firstDayOfWeek)}
          ?show-quick-buttons=${args.showQuickButtons}
          ?disabled=${args.disabled}
          ?show-year-stepper=${args.showYearStepper}
          ?show-month-stepper=${args.showMonthStepper}
          show-clear-button=${args.showClearButton}
          show-today-button=${args.showTodayButton}
          ?show-keyboard-hint=${args.showKeyboardHint}
          input-should-format=${args.inputShouldFormat}
          @selectDate=${(e: CustomEvent) => args.selectDate?.(e.detail)}
          @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
          @componentReady=${(e: CustomEvent) => args.componentReady?.(e.detail)}
        ></tabworthy-dates>
      </div>
    </div>
  </div>
`;

export const WithinModalTopLeft: Story = {
  render: WithinModalTemplate,
  args: { ...commonArgs, id: "datepicker-modal-top-left" },
  play: openCalendar
};

export const WithinModalTopRight: Story = {
  render: WithinModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-modal-top-right",
    style: "margin-left: auto;"
  },
  play: openCalendar
};

export const WithinModalBottomLeft: Story = {
  render: WithinModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-modal-bottom-left",
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};

export const WithinModalBottomRight: Story = {
  render: WithinModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-modal-bottom-right",
    style: "margin-left: auto;",
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};

// Within Overflown Modal template - simulates a modal with scrollable content
const WithinOverflownModalTemplate = (args: any) => html`
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      padding: 2rem;
      box-sizing: border-box;
    "
  >
    <div
      style="
        background: white;
        border-radius: 8px;
        padding: 1rem;
        width: 100%;
        max-width: 800px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      "
    >
      <div
        class="attach-here"
        style="
          overflow: auto;
          max-height: 250px;
          border: 1px solid #ccc;
          padding: 1rem;
        "
      >
        <div
          style="
            display: flex;
            min-height: 400px;
            ${args.wrapperStyle || ""}
          "
        >
          <div style="position: relative; ${args.style || ""}">
            <tabworthy-dates
              id=${args.id}
              .value=${ifDefined(args.value)}
              label=${ifDefined(args.label)}
              placeholder=${ifDefined(args.placeholder)}
              locale=${ifDefined(args.locale)}
              format=${ifDefined(args.format)}
              first-day-of-week=${ifDefined(args.firstDayOfWeek)}
              ?show-quick-buttons=${args.showQuickButtons}
              ?disabled=${args.disabled}
              ?show-year-stepper=${args.showYearStepper}
              ?show-month-stepper=${args.showMonthStepper}
              show-clear-button=${args.showClearButton}
              show-today-button=${args.showTodayButton}
              ?show-keyboard-hint=${args.showKeyboardHint}
              input-should-format=${args.inputShouldFormat}
              append-to="body"
              @selectDate=${(e: CustomEvent) => args.selectDate?.(e.detail)}
              @changeYear=${(e: CustomEvent) => args.changeYear?.(e.detail)}
              @componentReady=${(e: CustomEvent) =>
                args.componentReady?.(e.detail)}
            ></tabworthy-dates>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export const WithinOverflownModalTopLeft: Story = {
  render: WithinOverflownModalTemplate,
  args: { ...commonArgs, id: "datepicker-overflow-top-left" },
  play: openCalendar
};

export const WithinOverflownModalTopRight: Story = {
  render: WithinOverflownModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-overflow-top-right",
    style: "margin-left: auto;"
  },
  play: openCalendar
};

export const WithinOverflownModalBottomLeft: Story = {
  render: WithinOverflownModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-overflow-bottom-left",
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};

export const WithinOverflownModalBottomRight: Story = {
  render: WithinOverflownModalTemplate,
  args: {
    ...commonArgs,
    id: "datepicker-overflow-bottom-right",
    style: "margin-left: auto;",
    wrapperStyle: "align-items: flex-end;"
  },
  play: openCalendar
};
