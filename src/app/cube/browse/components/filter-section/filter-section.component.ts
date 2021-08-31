import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent implements OnInit {
  collapsed: boolean;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.collapsed = true;
  }

  toggleCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
    this.cd.detectChanges();
  }

}
