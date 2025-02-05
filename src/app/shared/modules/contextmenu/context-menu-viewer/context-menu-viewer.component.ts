import { Component, EventEmitter, Input, HostListener, Renderer2, 
  ElementRef, ChangeDetectorRef, AfterViewInit, SimpleChanges, AfterViewChecked } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * This component is simply a wrapper for any content projected into it (from the original ContextMenuComponent).
 * It signals click away and escape-key closes to the component, but all other functionality is  managed
 * directly from it's controller component.
 */
@Component({
  selector: 'clark-context-menu-viewer',
  template: `
    <div class="full-screen">
      <div (activate)="activateClose()" [@contextMenu] class="context-menu"><ng-content></ng-content></div>
    </div>
  `,
  styleUrls: ['context-menu-viewer.component.scss'],
  animations: [
    trigger('contextMenu', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(0px) scale(1, 0' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px) scale(1, 1)' }))
      ]),
    ])
  ]
})
export class ContextMenuViewerComponent implements AfterViewInit {

  private mouseX = 0;
  private mouseY = 0;
  private isMouseOverElement = false;
  private element: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef) {}


  @Input() close: EventEmitter<void> = new EventEmitter();

  @HostListener('window:keyup', ['$event']) handleKeyPress(
    event: KeyboardEvent
  ) {
    if (event.code === 'Escape') {
      this.activateClose();
    }
  }

  // ngAfterViewChecked(){
  //   console.log("ng after view checked!!!");
  //   this.element = document.querySelector('clark-context-menu-viewer') as HTMLElement;
  //     if (this.element) {
  //       console.log('Element found:', this.element);

  //       // Ensure the element is visible
  //       if (this.element.offsetWidth > 0 && this.element.offsetHeight > 0) {
  //         // Listen for mouse enter and leave events
  //         this.renderer.listen(this.element, 'mouseenter', () => {
  //           console.log('Mouse entered the element.');
  //           this.isMouseOverElement = true;
  //         });

  //         this.renderer.listen(this.element, 'mouseleave', () => {
  //           console.log('Mouse left the element.');
  //           this.isMouseOverElement = false;
  //           this.activateClose();
  //         });
  //       } else {
  //         console.log('Element is not visible or not yet rendered');
  //       }
  //     }
  // }


  ngAfterViewInit(){
    console.log('after view init!!');
    setTimeout(() => {
      this.cdr.detectChanges();

      this.element = document.querySelector('clark-context-menu-viewer') as HTMLElement;
      if (this.element) {
        console.log('Element found:', this.element);

        const rect = this.element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
          // Element is visible and rendered
          console.log('Element is visible and rendered');
        } else {
          console.log('Element is not visible or not yet rendered');
        }

        // // Ensure the element is visible
        // if (this.element.offsetWidth > 0 && this.element.offsetHeight > 0) {
        //   // Listen for mouse enter and leave events
        //   this.renderer.listen(this.element, 'mouseenter', () => {
        //     console.log('Mouse entered the element.');
        //     this.isMouseOverElement = true;
        //   });

        //   this.renderer.listen(this.element, 'mouseleave', () => {
        //     console.log('Mouse left the element.');
        //     this.isMouseOverElement = false;
        //     this.activateClose();
        //   });
        // } else {
        //   console.log('Element is not visible or not yet rendered');
        // }
      }
    }, 100);
  }





  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event){
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event){
    if (this.element) {
      const rect = this.element.getBoundingClientRect();

      // Check if the rect is not zero, indicating the element is positioned correctly
      if (rect.width > 0 && rect.height > 0) {
        const isMouseOver = (
          this.mouseX >= rect.left &&
          this.mouseX <= rect.right &&
          this.mouseY >= rect.top &&
          this.mouseY <= rect.bottom
        );

        if (isMouseOver && !this.isMouseOverElement) {
          console.log('Mouse entered the element');
          this.isMouseOverElement = true;
        } else if (!isMouseOver && this.isMouseOverElement) {
          console.log('Mouse left the element');
          this.isMouseOverElement = false;
          this.activateClose();
        }
      } else {
        console.log('Element is not yet rendered properly');
      }
    }
  }

  checkIfMouseIsOver(element: HTMLElement) {
    this.renderer.listen(element, 'mouseenter', () => {
      console.log('Mouse entered the element.');
    });

    this.renderer.listen(element, 'mouseleave', () => {
      console.log('Mouse left the element.');
      this.activateClose();
    });
  }

  /**
   * Send a close event up to the master component
   */
  activateClose() {
    this.close.emit();
  }
}
