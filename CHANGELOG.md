## [0.10.1](https://github.com/tabworthy/tabworthy-components/compare/v0.10.0...v0.10.1) (2026-02-27)


### Bug Fixes

* **dates,times:** button css ([e1dde6d](https://github.com/tabworthy/tabworthy-components/commit/e1dde6deb2d34ecdf01a2536d91ca79795b06806))

# [0.10.0](https://github.com/tabworthy/tabworthy-components/compare/v0.9.2...v0.10.0) (2026-02-27)


### Features

* **dates, times:** showCloseButton ([f76dd36](https://github.com/tabworthy/tabworthy-components/commit/f76dd362c4c7a83f0eabc369940ae45b26cddfc7))


## [0.9.2](https://github.com/tabworthy/tabworthy-components/compare/v0.9.1...v0.9.2) (2026-02-26)


### Bug Fixes

* **times:** pass through time-picker i18n labels ([fda2db7](https://github.com/tabworthy/tabworthy-components/commit/fda2db750c1504d124af10ad6c54fa444573c525))


## [0.9.1](https://github.com/tabworthy/tabworthy-components/compare/v0.9.0...v0.9.1) (2026-02-26)


### Bug Fixes

* **dates:** more controls for i18n ([f3acb96](https://github.com/tabworthy/tabworthy-components/commit/f3acb96351fa38b463b52a928afa55b28528b1e4))

# [0.9.0](https://github.com/tabworthy/tabworthy-components/compare/v0.8.7...v0.9.0) (2026-02-25)


### Bug Fixes

* **times:** polish border-radius css ([fb5b12e](https://github.com/tabworthy/tabworthy-components/commit/fb5b12e7506a25426463a9be9e9def5ac30f4f3b))


### Features

* appendTo for edge-cases with overflown modal ([677a042](https://github.com/tabworthy/tabworthy-components/commit/677a04247cfaa3c866f754af495f4b686cef179b))
* positioning via popper ([41172a9](https://github.com/tabworthy/tabworthy-components/commit/41172a9daee7bd4258030759305de8316e32c61b))


## [0.8.7](https://github.com/tabworthy/tabworthy-components/compare/v0.8.6...v0.8.7) (2026-02-25)


### Bug Fixes

* **dates,times:** rem => em ([f43b89d](https://github.com/tabworthy/tabworthy-components/commit/f43b89d2e1761aec44a8b2138ecd9731d47dbfae))

## [0.8.6](https://github.com/tabworthy/tabworthy-components/compare/v0.8.5...v0.8.6) (2026-02-25)


### Bug Fixes

* **dates:** typo in placeholder ([ee34913](https://github.com/tabworthy/tabworthy-components/commit/ee34913c99e1165505ab312600ad2a229dd01793))
* **times,dates:** control focus outline width via var ([0e8c38a](https://github.com/tabworthy/tabworthy-components/commit/0e8c38ab3cee7c565afd0321f2e35cc4ad86c825))
* **times,dates:** control font-size via var ([3d3665f](https://github.com/tabworthy/tabworthy-components/commit/3d3665f6bb67173b8073c3af38f57b36bb629841))
* **times:** preselected value shows correctly in calendar ([3211bae](https://github.com/tabworthy/tabworthy-components/commit/3211baef19be746a53d0105cec1192969d53fa31))

## 0.8.5

### Patch Changes

- fix(dates): better syncFromValueProp

## 0.8.4

### Patch Changes

- fix(dates): missed scenarios

## 0.8.3

### Patch Changes

- revert font-size for placeholder

## 0.8.2

### Patch Changes

- useTwelveHourFormat

## 0.8.1

### Patch Changes

- inputClass

## 0.8.0

### Minor Changes

- invisiblePrehydration: false,

## 0.7.3

### Patch Changes

- externalRuntime: false

## 0.7.2

### Patch Changes

- css fixes to times component

## 0.7.1

### Patch Changes

- fix(dates): format for announceDateChange

## 0.7.0

### Minor Changes

- bundled approach to avoid lazy-loading delay

## 0.6.1

### Patch Changes

- fix: next/prev year buttons, to emit changeYear event

## 0.6.0

### Minor Changes

- remove @stencil/\* devDeps from deps

## 0.5.1

### Patch Changes

- fix(dates-calendar): patch events bubbles: false

## 0.5.0

### Minor Changes

- fix(dates): handlePickerSelection should emit selectDate
  feat(dates, times): disableFreeformInput for complex scenarios when format passed

## 0.4.0

### Minor Changes

- Fix: Unify inputShouldFormat across components. Allow direct prop modification as well as configuration via an attribute. Default to true.

## 0.3.3

### Patch Changes

- 'handlePickerSelection' should mutate 'internalValue' correctly based on specified format

## 0.3.2

### Patch Changes

- fix 'inputShouldFormat' prop for times and dates, tiny css fix

## 0.3.1

### Patch Changes

- fix: css typos

## 0.3.0

### Minor Changes

- use specific CSS variables instead of generic ones

## 0.2.0

### Minor Changes

- initial changes after forking the inclusive-dates and introducing tabworthy-times component
