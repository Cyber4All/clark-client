import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'clark-material-notes',
    templateUrl: './material-notes.component.html',
    styleUrls: ['./material-notes.component.scss'],
    standalone: true,
    imports: [NgClass]
})
export class MaterialNotesComponent {

  open = false;
  @Input() note: {title: string, content: string };

  openNote(): void {
    this.open = !this.open;
  }

}
