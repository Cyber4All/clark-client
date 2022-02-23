import { Component, NgModule, OnInit } from '@angular/core';
import { sections } from './copy';

@Component({
  selector: 'clark-editorial-process',
  templateUrl: './editorial-process.component.html',
  styleUrls: ['./editorial-process.component.scss']
})
export class EditorialProcessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {}

  title = 'Editorial Process';

  get tabs(){
    return Object.values(sections);
  }
}
