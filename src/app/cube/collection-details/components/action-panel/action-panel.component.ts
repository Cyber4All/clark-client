import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'collection-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit {
  @Input() collectionName: string;
  @Input() collectionAbv: string;
  @Input() showContribute = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  contribute() {
    this.router.navigate(['onion/dashboard']);
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collectionAbv, currPage: 1 }});
  }

}
