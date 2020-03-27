import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  statusCode: string;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) { }

  ngOnInit() {
    this.statusCode = this.route.snapshot.paramMap.get('code');
  }

  login() {
    this.router.navigate(['auth'], { queryParams: { redirectUrl: this.redirectUrl } });
  }

}
