import { ModalService } from './modal.service';
import { ComponentRef, Output, EventEmitter, Input, Injector } from '@angular/core';

export abstract class Modal {
    protected name: string;
    protected x: number;
    protected y: number;
    protected show: boolean;
    protected type: string; 

    @Input() content: any = {};
    @Output() action: EventEmitter<string> = this.modalService.action;

    protected justCreated: boolean = true;
    protected firstLoad: boolean = true;

    constructor(protected modalService: ModalService) { }

    ngDoCheck(): void {
        this.name = this.content.name;
        this.show = (Object.keys(this.content).length > 0);
        if (this.show) {
            console.log('showing ' + this.name);
        }
    }

    ngAfterViewChecked() {
        if (!this.show) {
            this.justCreated = true;
        }
    }

    optionClick(msg) {
        if (!this.justCreated) this.sendEvent(msg);
        this.close();
    }

    /**
     * Uses the @Output to send a string message back to it's parent component
     * @param msg
     */
    sendEvent(msg) {
        this.action.emit(JSON.stringify({name: this.name, message: msg}));
    }

    close() {
        if (!this.justCreated) {
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