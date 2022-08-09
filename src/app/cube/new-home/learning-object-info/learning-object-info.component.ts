import { Component, Directive, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'clark-learning-object-info',
  templateUrl: './learning-object-info.component.html',
  styleUrls: ['./learning-object-info.component.scss']
})
export class LearningObjectInfoComponent implements OnInit {
  currentComponent: "learning-object" | "learning-outcomes" | "hierarchies" | "collections";
  constructor() { }

  ngOnInit(): void {
  }
}
