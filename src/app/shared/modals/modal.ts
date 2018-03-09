import { StaticInjector } from '@angular/core/src/di/injector';
import { ModalService } from './modal.service';
import { ComponentRef, Output, Input, Injector, EventEmitter } from '@angular/core';

export abstract class Modal {
    protected name: string;
    protected x: number;
    protected y: number;
    protected type: string; 
    
    public show: boolean;

    @Input() content: any = {};
    @Output() action: EventEmitter<string> = this.modalService.action;

    protected justCreated: boolean = true;
    protected firstLoad: boolean = true;
    protected preventClose: boolean = false;

    constructor(protected modalService: ModalService) { }

    ngDoCheck(): void {
        this.name = this.content.name;
        this.show = (Object.keys(this.content).length > 0);
    }

    ngAfterViewChecked() {
        if (!this.show) {
            this.justCreated = true;
        }
    }

    optionClick(msg: string, checkbox: boolean = false) {
        if (!this.justCreated) this.sendEvent(msg);

        if (checkbox && msg !== null) this.preventClose = true;
        if (!this.preventClose) this.close();
        if (this.preventClose) this.preventClose = false;
    }

    /**
     * Uses the @Output to send a string message back to it's parent component
     * @param msg
     */
    sendEvent(msg) {
        this.action.next(JSON.stringify({name: this.name, message: msg}));
    }

    close() {
        if (!this.justCreated) {
            this.sendEvent('closed');
            this.modalService.close(this.type);
            this.justCreated = true;
        }
        else this.justCreated = false;
    }

    ngOnDestroy() {
        // close menues when navigating away
        this.close();
    }
}