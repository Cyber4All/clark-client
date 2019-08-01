import { NgModule, ModuleWithProviders } from '@angular/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuViewerComponent } from './context-menu-viewer/context-menu-viewer.component';

@NgModule({
  declarations: [ContextMenuComponent, ContextMenuViewerComponent],
  exports: [ContextMenuComponent, ContextMenuViewerComponent],
  entryComponents: [ContextMenuViewerComponent]
})
export class ContextMenuModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ContextMenuModule,
    };
  }
}
