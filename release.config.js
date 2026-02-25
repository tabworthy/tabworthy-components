export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",

    // 1) write CHANGELOG.md from the release notes
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],

    // 2) bump package.json version for the release + publish to npm
    ["@semantic-release/npm", { npmPublish: false }],

    // 3) build your dist BEFORE committing/publishing
    ["@semantic-release/exec", { prepareCmd: "yarn build:stencil && yarn build:docs" }],

    // 4) commit dist + changelog + package.json back to repo
    ["@semantic-release/git", {
      assets: ["dist/**", "CHANGELOG.md", "package.json"],
      message:
        "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
    }],

    // 5) GitHub release (uses notes)
    "@semantic-release/github",
  ],
};
