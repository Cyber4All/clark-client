import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-unsupported',
  templateUrl: './unsupported.component.html',
  styles: [`
  .warning {
    text-align:center;
    background-color: lightpink;
    border: 1px solid red;
    padding: 100px;
    margin: 100px;
   }
   `]
})
export class UnsupportedComponent {
  isSupported: boolean;
  constructor(private router: Router) {
    this.isSupported = !(/msie\s|trident\/|edge\//i.test(window.navigator.userAgent));
    this.isSupported ? this.router.navigate(['/**']) : console.log('Unsupported Browser: We do not support IE or Edge');
   }
}
