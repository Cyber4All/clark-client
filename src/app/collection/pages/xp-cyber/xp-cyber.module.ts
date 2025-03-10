import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { FooterComponent } from './components/footer/footer.component';
import { XPCyberComponent } from './xp-cyber.component';
import { IncludedModule } from '../../shared/included/included.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    HeaderComponent,
    PhilosophyComponent,
    FooterComponent,
    XPCyberComponent,
  ],
  imports: [
    IncludedModule,
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    XPCyberComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class XPCyberModule { }
