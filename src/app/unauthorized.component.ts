import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  statusCode: string;
  redirectUrl: string;
  constructor(private route: ActivatedRoute, private auth: AuthService) { }

  ngOnInit() {
    this.statusCode = this.route.snapshot.paramMap.get('code');
    this.redirectUrl = this.route.snapshot.paramMap.get('redirect');
  }

}
