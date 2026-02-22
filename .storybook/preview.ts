import type { Preview } from "@storybook/web-components-vite";
import '../dist/tabworthy-components/tabworthy-components.esm.js';
import '../dist/themes/light.css';
import '../dist/themes/dark.css';

const vars = {
  light: {
    "--tw-dates-text-color": "#111",
    "--tw-dates-secondary-color": "#767676",
    "--tw-dates-border-color": "#949494",
    "--tw-dates-bg-color": " #fff",
    "--tw-dates-disabled-color": "#959595",
    "--tw-dates-hover-color": "#e5e7eb",
    "--tw-dates-bg2-color": " #f2f3f5",
    "--tw-dates-focus-color": "#0000ff",
    "--tw-dates-error-color": "#d4351c",
    "--tw-dates-active-color": "#0000ff"
  },
  dark: {
    "--tw-dates-text-color": "#fff",
    "--tw-dates-secondary-color": " #bcbcbcff",
    "--tw-dates-border-color": " #595959",
    "--tw-dates-bg-color": " #14171e",
    "--tw-dates-disabled-color": " #616161",
    "--tw-dates-hover-color": " #3a3d4a",
    "--tw-dates-bg2-color": " #2b2d37",
    "--tw-dates-focus-color": " #ffbf00",
    "--tw-dates-error-color": " #f16c57",
    "--tw-dates-active-color": " #ffbf00"
  }
};

function applyTheme(ctx: any) {
  const theme = ctx.globals?.backgrounds?.value === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;

  const themeVars = vars[theme];
  for (const [varName, varValue] of Object.entries(themeVars)) {
    document.documentElement.style.setProperty(varName, varValue);
  }
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        light: { name: "light", value: "#ffffff" },
        dark: { name: "dark", value: "#1a1a1a" }
      }
    }
  },
  initialGlobals: { backgrounds: { value: "light" } },

  decorators: [
    (story, ctx) => {
      applyTheme(ctx);
      return story();
    }
  ]
};

export default preview;
