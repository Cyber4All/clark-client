import { RecaptchaValidator } from './recaptcha-validator.service';
import { ElementRef, Injector, NgZone } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Input } from '@angular/core';
import { Directive } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';

export interface ReCaptchaConfig {
  theme?: 'dark' | 'light';
  type?: 'audio' | 'image';
  size?: 'compact' | 'normal';
  tabindex?: number;
}
declare const grecaptcha: any;

declare global {
  interface Window {
    grecaptcha: any;
    reCaptchaLoad: () => void
  }
}

@Directive({
  selector: '[ngRecaptcha]',
  providers: [RecaptchaValidator]
})
export class RecaptchaDirective implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() key: string;
  @Input() config: ReCaptchaConfig = {};
  @Input() lang: string;
  private control: FormControl;

  private onChange: (value: string) => void;
  private onTouched: (value: string) => void;

  private widgetId: number;

  constructor(private element: ElementRef, private ngZone: NgZone, private injector: Injector, private validator: RecaptchaValidator) { }

  ngOnInit() {
    this.registerReCaptchaCallback();
    this.addScript();
  }
  ngAfterViewInit() {
    this.control = this.injector.get(NgControl).control;
    this.setValidator();
  }

  private setValidator() {
    this.control.setValidators(Validators.required);
    this.control.updateValueAndValidity();
  }

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerReCaptchaCallback() {
    window.reCaptchaLoad = () => {
      const config = {
        ...this.config,
        'sitekey': this.key,
        'callback': this.onSuccess.bind(this),
        'expired-callback': this.onExpired.bind(this)
      };
      this.widgetId = this.render(this.element.nativeElement, config);
    };
  }

  private render(element: HTMLElement, config): number {
    return grecaptcha.render(element, config);
  }

  addScript() {
    let script = document.createElement('script');
    const lang = this.lang ? '&hl=' + this.lang : '';
    script.src = `https://www.google.com/recaptcha/api.js?onload=reCaptchaLoad&render=explicit${lang}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
  onExpired() {
    this.ngZone.run(() => {
      this.onChange(null);
      this.onTouched(null);
    });
  }

  onSuccess(token: string) {
    this.ngZone.run(() => {
      this.verifyToken(token);
      this.onChange(token);
      this.onTouched(token);
    });
  }

  verifyToken(token: string) {
    this.control.setAsyncValidators(this.reCaptchaAsyncValidator.validateToken(token))
    this.control.updateValueAndValidity();
  }

}