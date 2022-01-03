import { NgModule } from '@angular/core';
import { ToastrOvenComponent } from './notification/notification.component';
import { CrustComponent } from './crust/crust.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ ToastrOvenComponent, CrustComponent ],
})
export class ToasterModule { }
