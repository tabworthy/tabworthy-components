import { EventEmitter } from "../../stencil-public-runtime";
export interface TimeValue {
    hours: number;
    minutes: number;
    seconds?: number;
    period?: "AM" | "PM";
}
export interface TimesPickerLabels {
    hours: string;
    minutes: string;
    seconds: string;
    am: string;
    pm: string;
    timePicker: string;
    incrementHours: string;
    decrementHours: string;
    incrementMinutes: string;
    decrementMinutes: string;
    incrementSeconds: string;
    decrementSeconds: string;
}
export declare class TabworthyTimesPicker {
    el: HTMLElement;
    hours: number;
    minutes: number;
    seconds: number;
    useTwelveHourFormat: boolean;
    showSeconds: boolean;
    labels: TimesPickerLabels;
    labelsSrOnly: boolean;
    disabled: boolean;
    elementClassName: string;
    internalHours: number;
    internalMinutes: number;
    internalSeconds: number;
    period: "AM" | "PM";
    timeChanged: EventEmitter<TimeValue>;
    watchHours(newValue: number): void;
    watchMinutes(newValue: number): void;
    watchSeconds(newValue: number): void;
    componentWillLoad(): void;
    private getDisplayHours;
    private get24HourValue;
    private handleHourChange;
    private handleMinuteChange;
    private handlePeriodChange;
    private handleHourIncrement;
    private handleHourDecrement;
    private handleMinuteIncrement;
    private handleMinuteDecrement;
    private handleSecondChange;
    private handleSecondIncrement;
    private handleSecondDecrement;
    private emitTimeChange;
    private padZero;
    render(): any;
}
