import { NgModule, ModuleWithProviders } from '@angular/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuViewerComponent } from './context-menu-viewer/context-menu-viewer.component';


@NgModule({
    imports: [ContextMenuComponent, ContextMenuViewerComponent],
    exports: [ContextMenuComponent, ContextMenuViewerComponent],
})
export class ContextMenuModule {
  static forRoot(): ModuleWithProviders<ContextMenuModule> {
    return {
      ngModule: ContextMenuModule,
    };
  }
}
