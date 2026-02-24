import { EventEmitter } from "../../stencil-public-runtime";
export interface TimeValue {
    hours: number;
    minutes: number;
    period?: "AM" | "PM";
}
export interface InclusivekTimesPickerLabels {
    hours: string;
    minutes: string;
    am: string;
    pm: string;
    timePicker: string;
    incrementHours: string;
    decrementHours: string;
    incrementMinutes: string;
    decrementMinutes: string;
}
export declare class InclusiveTimesPicker {
    el: HTMLElement;
    hours: number;
    minutes: number;
    useTwelveHourFormat: boolean;
    labels: InclusivekTimesPickerLabels;
    labelsSrOnly: boolean;
    disabled: boolean;
    elementClassName: string;
    internalHours: number;
    internalMinutes: number;
    period: "AM" | "PM";
    timeChanged: EventEmitter<TimeValue>;
    watchHours(newValue: number): void;
    watchMinutes(newValue: number): void;
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
    private emitTimeChange;
    private padZero;
    render(): any;
}
