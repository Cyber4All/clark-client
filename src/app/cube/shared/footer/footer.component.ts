
import {filter} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { COPY } from './footer.copy';
import { environment } from '../../../../environments/environment';
import { SubscriptionAgreementService } from '../../../core/subscription-agreement.service';
import { ToastrOvenService } from '../../../shared/modules/toaster/notification.service';

@Component({
  selector: 'cube-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  copy = COPY;
  hideFooter = false;
  experimental: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionAgreementService,
    private toaster: ToastrOvenService) { }

  ngOnInit() {
    this.experimental = environment.experimental;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const root: ActivatedRoute = this.route.root;
      this.hideFooter = root.children[0].snapshot.data.hideNavbar;
    });
  }

  // Toggle to activate newsletter subscription banner
  toggleNewsletterBanner() {
    if (window.screen.width < 600) {
      this.toaster.warning(`Action unavailable!`, `Please check out CLARK on a desktop computer to sign up!`);
    } else {
      this.subscriptionService.setShowSubscriptionBanner(true);
    }
  }
}
