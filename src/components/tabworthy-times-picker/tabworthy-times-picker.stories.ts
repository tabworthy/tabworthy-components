import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit-html";
import { Components } from "../../components";

const defaultLabels = {
  hours: "Hours",
  minutes: "Minutes",
  am: "AM",
  pm: "PM",
  timePicker: "Time picker",
  incrementHours: "Increment hours",
  decrementHours: "Decrement hours",
  incrementMinutes: "Increment minutes",
  decrementMinutes: "Decrement minutes"
};

const meta: Meta<Components.TabworthyTimesPicker> = {
  title: "Building Blocks/TabworthyTimesPicker",
  tags: ["autodocs"],
  argTypes: {
    timeChanged: { action: "timeChanged" }
  },
  render: (args) => html`
    <tabworthy-times-picker
      .hours=${args.hours}
      .minutes=${args.minutes}
      .useTwelveHourFormat=${args.useTwelveHourFormat}
      .labels=${args.labels}
      .labelsSrOnly=${args.labelsSrOnly}
      .disabled=${args.disabled}
      .elementClassName=${args.elementClassName}
      @timeChanged=${(e: CustomEvent) => args.timeChanged?.(e.detail)}
    ></tabworthy-times-picker>
  `
};

export default meta;
type Story = StoryObj<Components.TabworthyTimesPicker>;

export const Default: Story = {
  args: {
    hours: 12,
    minutes: 0,
    useTwelveHourFormat: true,
    disabled: false,
    labels: defaultLabels,
    labelsSrOnly: true,
    elementClassName: "tabworthy-times-picker"
  }
};

export const TwentyFourHourFormat: Story = {
  args: {
    ...Default.args,
    useTwelveHourFormat: false,
    hours: 14,
    minutes: 30
  }
};

export const Morning: Story = {
  args: {
    ...Default.args,
    hours: 9,
    minutes: 15
  }
};

export const Evening: Story = {
  args: {
    ...Default.args,
    hours: 18,
    minutes: 45
  }
};

export const Midnight: Story = {
  args: {
    ...Default.args,
    hours: 0,
    minutes: 0
  }
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true
  }
};
