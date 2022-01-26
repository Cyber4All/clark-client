import { NgModule, ModuleWithProviders } from '@angular/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuViewerComponent } from './context-menu-viewer/context-menu-viewer.component';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';

@NgModule({
  imports: [SharedDirectivesModule],
  declarations: [ContextMenuComponent, ContextMenuViewerComponent],
  exports: [ContextMenuComponent, ContextMenuViewerComponent],
})
export class ContextMenuModule {
  static forRoot(): ModuleWithProviders<ContextMenuModule> {
    return {
      ngModule: ContextMenuModule,
    };
  }
}
