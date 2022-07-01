import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  @Input() notes: string;

  constructor() { }

  ngOnInit() {
    if (!this.notes) {
      this.notes = 'This Learning Object does not have any notes';
    }
  }
}
