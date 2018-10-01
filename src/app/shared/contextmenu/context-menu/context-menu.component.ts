import {
  Component,
  ElementRef,
  AfterViewInit,
  ContentChild,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { ContextMenuService } from '../contextmenu.service';
import { Subject } from 'rxjs';

/**
 * The purpose of this component is to wrap the content of a context menu and provide an interface
 * between it's parent component (the controller) and the service, This component is never shown
 * on the screen.
 */
@Component({
  selector: 'clark-context-menu',
  template: '',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent
  implements OnChanges, AfterViewInit, OnDestroy {
  @ContentChild('contextMenu')
  menuElement: ElementRef;
  @Input()
  open: boolean;

  @Output()
  id: EventEmitter<string> = new EventEmitter();
  @Output()
  close: EventEmitter<void> = new EventEmitter();

  destroyed$: Subject<void> = new Subject();

  menuId: string;

  /**
   * Close context menu on scroll
   * @param event {WindowScrollEvent}
   */
  @HostListener('window:scroll', ['$event']) handleScroll() {
    this.contextMenuService.destroy(this.menuId);
    this.close.emit();
  }

  /**
   * Close context menu on window resize
   * @param event {WindowEvent}
   */
  @HostListener('window:resize', ['$event']) handleResize() {
    this.contextMenuService.destroy(this.menuId);
    this.close.emit();
  }

  /**
   * Close context menu on escape key
   * @param event {KeyboardEvent}
   */
  @HostListener('window:keyup', ['$event']) handleEscape(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.contextMenuService.destroy(this.menuId);
      this.close.emit();
    }
  }


  constructor(private contextMenuService: ContextMenuService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.open && changes.open.currentValue && this.menuId) {
      this.contextMenuService.open(this.menuId);
    }
  }

  ngAfterViewInit() {
    // register context menus with service
    let sub: EventEmitter<string>;
    [this.menuId, sub] = this.contextMenuService.register(this.menuElement);

    // listen for the service to close this context menu and emit an event to parent component
    sub.takeUntil(this.destroyed$).subscribe(() => {
      this.close.emit();
    });

    // send id to parent component for use if needed
    this.id.emit(this.menuId);

    if (this.open) {
      this.contextMenuService.open(this.menuId);
    }
  }

  ngOnDestroy() {
    this.contextMenuService.destroy(this.menuId);
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
