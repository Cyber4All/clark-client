
import { ModalService } from './modal.service';
import { Output, Input, EventEmitter, Directive, AfterViewChecked, DoCheck, OnDestroy } from '@angular/core';

@Directive({
    selector: '[modal]'
  })
export abstract class ModalDirective implements AfterViewChecked, DoCheck, OnDestroy {
    protected name: string;
    protected x: number;
    protected y: number;
    protected type: string;

    public show: boolean;

    @Input() content: any = {};
    @Output() action: EventEmitter<string> = this.modalService.action;

    protected justCreated = true;
    protected firstLoad = true;
    protected preventClose = false;

    constructor(protected modalService: ModalService) { }

    ngDoCheck(): void {
        this.name = this.content.name;
        this.show = (Object.keys(this.content).length > 0);
    }

    ngAfterViewChecked() {
        if (!this.show && this.type !== 'dialog') {
            this.justCreated = true;
        }
    }

    optionClick(event, msg: string, checkbox: boolean = false) {
        event.stopPropagation();
        this.sendEvent(msg);

        if (checkbox && msg !== null) {
            this.preventClose = true;
        }
        if (!this.preventClose) {
            this.close();
        }
        if (this.preventClose) {
            this.preventClose = false;
        }
    }

    /**
     * Uses the @Output to send a string message back to it's parent component
     * @param msg
     */
    sendEvent(msg) {
        this.action.next(JSON.stringify({name: this.name, message: msg}));
    }

    tryClose(event) {
        if (!this.justCreated) {
            this.close();
        } else {
            this.justCreated = false;
        }
    }

    close() {
        this.sendEvent('closed');
        this.modalService.close(this.type);
        this.justCreated = true;
    }

    ngOnDestroy() {
        // close menues when navigating away
        this.close();
    }
}
