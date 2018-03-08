import {Directive, ElementRef, Input, Output, EventEmitter, OnChanges} from "@angular/core";

@Directive({
    selector: '[contenteditableModel]',
    host: {
        '(blur)': 'onEdit()',
        '(keyup)': 'onEdit()'
    }
})

export class ContentEditableDirective implements OnChanges {
    @Input('contenteditableModel') model: any;
    @Output('contenteditableModelChange') update = new EventEmitter();

    constructor(
        private elementRef: ElementRef
    ) {
    }

    ngOnChanges(changes) {
        if (changes.model.isFirstChange())
            this.refreshView();
    }

    onEdit() {
        var value = this.elementRef.nativeElement.innerText;
        this.update.emit(value);
    }

    private refreshView() {
        this.elementRef.nativeElement.textContent = this.model;
    }
}