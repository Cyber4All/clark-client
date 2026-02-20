import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Organization } from 'app/core/organization-module/organization.types';

@Component({
  selector: 'clark-organization-delete-modal',
  templateUrl: './organization-delete-modal.component.html',
  styleUrls: ['./organization-delete-modal.component.scss'],
})
export class OrganizationDeleteModalComponent {
  @Input() isVisible = false;
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
