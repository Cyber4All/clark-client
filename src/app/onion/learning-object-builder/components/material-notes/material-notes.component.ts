import { Component, Input } from '@angular/core';

@Component({
  selector: 'clark-material-notes',
  templateUrl: './material-notes.component.html',
  styleUrls: ['./material-notes.component.scss']
})
export class MaterialNotesComponent {

  open = false;
  @Input() note: {title: string, content: string };

  constructor() { }

  openNote(): void {
    this.open = !this.open;
  }

}
