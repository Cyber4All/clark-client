import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Organization } from '@entity';

@Component({
    selector: 'clark-delete-confirmation',
    templateUrl: './delete-confirmation.component.html',
    styleUrls: ['./delete-confirmation.component.scss'],
})
export class DeleteConfirmationComponent {
    @Input() display = false;
    @Input() organization: Organization | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();

    onClose(): void {
        this.closed.emit();
    }

    onConfirm(): void {
        this.confirm.emit();
    }
}
