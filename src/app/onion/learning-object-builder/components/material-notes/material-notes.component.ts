import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-material-notes',
  templateUrl: './material-notes.component.html',
  styleUrls: ['./material-notes.component.scss']
})
export class MaterialNotesComponent implements OnInit {

  open = false;
  @Input() note: {title: string, content: string };

  constructor() { }

  ngOnInit(): void {
  }

  openNote(): void {
    this.open = !this.open;
  }

}
