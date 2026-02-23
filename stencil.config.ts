import { Config } from "@stencil/core";
import { postcss } from "@stencil/postcss";
import autoprefixer from "autoprefixer";
import postcssNested from "postcss-nested";

export const config: Config = {
  namespace: "tabworthy-components",
  tsconfig: "tsconfig.stencil.json",
  testing: {
    browserHeadless: "shell",
    testPathIgnorePatterns: ["/node_modules/", "/dist/", "/www/"],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "html", "lcov", "json"],
    collectCoverageFrom: [
      "src/components/**/*.{ts,tsx}",
      "shared/**/*.{ts,tsx}",
      "!{src,shared}/**/*.stories.ts",
      "!{src,shared}/**/*.spec.tsx",
      "!{src,shared}/**/*.e2e.ts",
      "!{src,shared}/**/*.d.ts",
      "!{src,shared}/index.ts"
    ]
  },
  outputTargets: [
    {
      copy: [
        {
          src: "themes/*.css",
          dest: "../themes",
          warn: true
        }
      ],
      type: "dist"
    },
    {
      generateTypeDeclarations: true,
      customElementsExportBehavior: "bundle",
      type: "dist-custom-elements",
      externalRuntime: false,
    },
    {
      copy: [
        {
          src: "themes/*.{css,map}",
          dest: "themes",
          warn: true
        }
      ],
      type: "www",
      serviceWorker: null
    },
    { type: "docs-readme" }
  ],
  plugins: [
    postcss({
      plugins: [autoprefixer(), postcssNested()]
    })
  ],
  sourceMap: false
};
