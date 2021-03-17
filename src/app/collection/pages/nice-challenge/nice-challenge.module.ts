import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { FooterComponent } from './components/footer/footer.component';
import { NiceChallengeComponent } from './nice-challenge.component';
import { IncludedModule } from '../../../collection/shared/included/included.module';

@NgModule({
  declarations: [
    HeaderComponent,
    PhilosophyComponent,
    FooterComponent,
    NiceChallengeComponent,
  ],
  imports: [
    IncludedModule,
    CommonModule,
  ],
  exports: [
    NiceChallengeComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class NiceChallengeModule { }
