export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",

    // 1) write CHANGELOG.md from the release notes
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],

    // 2) bump package.json version for the release + publish to npm
    "@semantic-release/npm",

    // 3) build your dist BEFORE committing/publishing (moved before npm publish)
    // Note: build now happens in CI before semantic-release runs

    // 4) commit dist + changelog + package.json back to repo
    ["@semantic-release/git", {
      assets: ["dist/**", "CHANGELOG.md", "package.json", "src/**"],
      message: "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
    }],

    // 5) GitHub release (uses notes)
    "@semantic-release/github",
  ],
};
