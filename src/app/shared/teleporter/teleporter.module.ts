// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TeleporterComponent } from './teleporter.component';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [],
  declarations: [
    TeleporterComponent
  ],
  exports: [
    TeleporterComponent
  ],
  entryComponents: [
    TeleporterComponent
  ]
})
export class TeleporterModule {}
