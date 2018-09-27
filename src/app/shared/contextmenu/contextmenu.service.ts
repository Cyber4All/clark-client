import {
  Injectable,
  ElementRef,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  OnDestroy,
  ViewRef,
  EmbeddedViewRef,
  EventEmitter,
  HostListener
} from '@angular/core';
import { ContextMenuViewerComponent } from './context-menu-viewer/context-menu-viewer.component';
import { Subject } from 'rxjs';
import { runInThisContext } from 'vm';

@Injectable()
export class ContextMenuService implements OnDestroy {
  private menus: Map<string, ViewRef> = new Map();
  private destroyed$: Subject<void> = new Subject();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  /**
   * Creates a new ContextMenuViewerComponent, set's the components instance variables, and stores it in a map for later
   * @param el {ElementRef} the HTML content of the context menu
   * @param anchor {}
   */
  register(el: ElementRef): [string, EventEmitter<string>] {
    // generate unique id for context menu
    const id = this.genId();

    // create a new ContextMenuViewerComponent and project our content into it
    const viewer = this.componentFactoryResolver
      .resolveComponentFactory(ContextMenuViewerComponent)
      .create(this.injector, [[el.nativeElement]]);

    // give the parent component the id we generated so that when it's destroyed we know which menu to remove here
    viewer.instance.id = id;

    const closeSub = viewer.instance.close;

    // listen for the viewer to signal a close event and clean up here
    closeSub.takeUntil(this.destroyed$)
      .subscribe((menuId: string) => {
        this.destroy(menuId);
      });

    // add hostview to map keyed by id to be destroyed later
    this.menus.set(id, viewer.hostView);

    // we return the closeSub to the initiating component so that when a menu is destroyed
    // the event can bubble and be caught in the initiating component
    return [id, closeSub];
  }

  /**
   * Opens the context menu with the corresponding id by adding it to the component tree and the DOM
   * @param id {string}
   */
  open(id: string, anchor?: HTMLElement, offset?: {top: number, left: number}) {
    const viewer = this.menus.get(id);

    // detect changes in hostview for :enter animations
    viewer.detectChanges();

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(viewer);

    // append viewer element to DOM
    const domElem = (viewer as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // calculate the position if an anchor element was given
    if (anchor) {
      const [top, left] = this.calculatePosition(anchor, offset);
      domElem.style.top = top + 'px';
      domElem.style.left = left + 'px';

      const contextElement = (domElem.querySelector('.context-menu')as HTMLElement);

      contextElement.style.top = top + 'px';
      contextElement.style.left = left + 'px';

      // hide the element before appending so that we can calculate it's width and move it if necessary
      contextElement.style.visibility = 'hidden';

      // add the element to the DOM
      document.body.appendChild(domElem);

      // check width
      if (left + contextElement.offsetWidth >= window.innerWidth) {
        contextElement.style.left = (left - contextElement.offsetWidth) + anchor.offsetWidth - (offset.left * 2) + 'px';
      }

      // check height
      if (top + contextElement.offsetHeight >= window.innerHeight + window.scrollY) {
        contextElement.style.top = (top - contextElement.offsetHeight) - anchor.offsetHeight - (offset.top) + 'px';
      }

      domElem.remove();
      contextElement.style.visibility = 'visible';
      document.body.appendChild(domElem);
    }
  }

  /**
   * Destroys a context menu and removes it from storage
   * @param id {string} the id of the menu to destroy
   * @param shutdown {boolean} if this is true, deletes ViewRef to contextmenu from storage
   */
  destroy(id: string, shutdown?: boolean) {
    const menu = this.menus.get(id);

    // remove from component tree and destroy component
    this.appRef.detachView(menu);

    // remove ViewRef to component from storage
    if (shutdown) {
      this.menus.delete(id);
      menu.destroy();
    }
  }

  /**
   * Iterate over all stored menus and destroy them
   * @param shutdown {boolean} if this is true, for each stored menu, delete the reference to it from storage
   */
  private destroyAll(shutdown?: boolean) {
    this.menus.forEach((_, key) => this.destroy(key));
  }

  /**
   * Generate a unique id for each context menu
   */
  private genId() {
    const S4 = function() {
      // tslint:disable-next-line:no-bitwise
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    );
  }

  /**
   * Calculates position for context menu when anchored near an element by the elements position and the offset parameter
   * @param anchor {HTMLElement} the element that this context menu should be positioned near
   * @param offset {top: number, left: number} object containing distance (in pixels) menu should be from element for top and left
   */
  private calculatePosition(anchor: HTMLElement,  offset: {top: number, left: number} = {top: 10, left: 10}): [number, number] {
    const boundingBox = anchor.getBoundingClientRect();
    return [boundingBox.bottom + offset.top, boundingBox.left + offset.left];
  }

  ngOnDestroy() {
    this.destroyAll(true);
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
