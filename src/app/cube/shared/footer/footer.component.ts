
import {filter} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { COPY } from './footer.copy';
import { environment } from '@env/environment';
import { SubscriptionAgreementService } from 'app/core/subscription-agreement.service';

@Component({
  selector: 'cube-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  copy = COPY;
  hideFooter = false;
  experimental: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private subscriptionService: SubscriptionAgreementService) { }

  ngOnInit() {
    this.experimental = environment.experimental;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const root: ActivatedRoute = this.route.root;
      this.hideFooter = root.children[0].snapshot.data.hideNavbar;
    });
  }

  // Toggle to activate newsletter subscription banner
  toggleNewsletterBanner() {
    this.subscriptionService.setShowSubscriptionBanner(true);
  }
}
