import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  statusCode: string;
  redirectUrl: string;
  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) { }

  ngOnInit() {
    this.statusCode = this.route.snapshot.paramMap.get('code');
    this.redirectUrl = this.route.snapshot.paramMap.get('redirect');
  }

  login() {
    this.router.navigate(['auth/login', { queryParams: { redirectUrl: this.redirectUrl }}]);
  }

}
