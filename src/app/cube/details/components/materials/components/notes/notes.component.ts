import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  @Input() notes: string;

  constructor() { }

  ngOnInit() { }
}
