import { Injectable, EventEmitter, Inject, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { CrustComponent } from './crust/crust.component';

@Injectable({
  providedIn: 'root'
})
export class ToastrOvenService {
  private _position: {x: string, y: string} = {x: 'left', y: 'bottom'};
  private _positionSet = false;
  public emitter = new EventEmitter<ToastrOven>();

  private factoryResolver: ComponentFactoryResolver;
  private rootViewContainer: ViewContainerRef;

  constructor( @Inject(ComponentFactoryResolver) factoryResolver) {
    this.factoryResolver = factoryResolver;
  }

  private notify(title: string, text: string, classes: string): void {
    this.emitter.emit({title: title, text: text, classes: classes});
  }


  public success(title: string, text: string): void {
    this.notify(title, text, 'success');
  }

  public error(title: string, text: string): void {
    this.notify(title, text, 'error');
  }

  public alert(title: string, text: string): void {
    this.notify(title, text, 'alert');
  }

  public default(title: string, text: string) {
    this.notify(title, text, '');
  }

  public warning(title: string, text: string) {
    this.notify(title, text, 'warning');
  }

  public setPosition(pos: {x: string, y: string}) {
    if (!this._positionSet) {
      if (!['left', 'right'].includes(pos.x)) {
        console.error(`Error! ${pos.x} is not a valid option! x value must be one of [left | right]`);
        return;
      } else if (!['top', 'bottom'].includes(pos.y)) {
        console.error(`Error! ${pos.y} is not a valid option! x value must be one of [top | bottom]`);
        return;
      }
    } else {
      console.error('You can only set the position of toastr notifications once!');
      return;
    }

    this._position = pos;
    this._positionSet = true;
  }

  public init(viewContainerRef: ViewContainerRef) {
    this.rootViewContainer = viewContainerRef;

    const factory = this.factoryResolver.resolveComponentFactory(CrustComponent);
    const component = factory.create(this.rootViewContainer.injector);
    this.rootViewContainer.insert(component.hostView);
  }

  get position(): {x: string, y: string} {
    return this._position;
  }
}

export interface ToastrOven {
  title: string;
  text: string;
  classes: string;
  icon?: string;
}
