import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth-module/auth.service';

@Component({
  selector: 'clark-collection-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit {
  @Input() collectionName: string;
  @Input() collectionAbv: string;
  @Input() showContribute = false;
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  contribute() {
    this.router.navigate(['onion/dashboard']);
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collectionAbv, currPage: 1 }});
  }

  navigateToDashboard() {
    this.router.navigate(['collections/cyberskills2work/dashboard']);
  }

  showCyberSkillsDashboardButton() {
    const accessGroups = this.authService.accessGroups;
      return this.collectionAbv === 'cyberskills2work' && (
        accessGroups.includes('admin') ||
        accessGroups.includes('editor') ||
        accessGroups.includes('curator@cyberskills2work') ||
        accessGroups.includes('reviewer@cyberskills2work')
      );
  }

}
