import { EventEmitter } from "../../stencil-public-runtime";
import "@a11y/focus-trap";
import { Placement } from "@popperjs/core";
/**
 * @slot slot - The dialog content
 */
export declare class TabworthyDatesModal {
    label: string;
    inline?: boolean;
    /** Preferred placement of the dropdown (Popper.js placement) */
    placement: Placement;
    /** Offset from the trigger element [skidding, distance] */
    offset: [number, number];
    /**
     * Element to append the dropdown to. Use "body" to append to document.body,
     * or pass a CSS selector or HTMLElement. When set, the dropdown will be
     * portaled to escape overflow:hidden containers.
     */
    appendTo?: string | HTMLElement;
    closing: boolean;
    showing: boolean;
    positioned: boolean;
    opened: EventEmitter;
    closed: EventEmitter;
    hostElement: HTMLElement;
    private triggerElement;
    private el;
    private bodyRef;
    private originalParent;
    private originalNextSibling;
    private isMovingPortal;
    private undo;
    private popperInstance;
    watchShowing(newValue: boolean): void;
    private getAppendToElement;
    private setupPortal;
    private cleanupPortal;
    private createPopperInstance;
    private destroyPopperInstance;
    /**
     * Open the dialog.
     */
    open(): Promise<void>;
    /**
     * Close the dialog.
     */
    close(): Promise<void>;
    disconnectedCallback(): void;
    getState(): Promise<boolean>;
    setTriggerElement(element: HTMLElement): Promise<void>;
    /** Force update the popper position */
    updatePosition(): Promise<void>;
    onKeyDown: (event: KeyboardEvent) => void;
    handleClick(event: MouseEvent): void;
    render(): any;
}
