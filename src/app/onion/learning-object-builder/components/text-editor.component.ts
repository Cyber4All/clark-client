import { Input, Output, EventEmitter, Component, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'text-editor',
  template: `
  <div *ngIf="showBox">
    <ckeditor
        [(ngModel)]="editorContent"
        [config]="config"
        [readonly]="false"
        (change)="onChange($event)"
        (focus)="onFocus($event)"
        (blur)="onBlur($event)"
        debounce="500"
        >
    </ckeditor>
  </div>
  <!-- <div class="btn-group to-right"><div class = "button neutral on-white" (click)="toggleBox()">{{buttonText}}</div></div>-->

  `,
  styles: ['#cke_bottom_detail, .cke_bottom { display: none; }']
})
export class TextEditorComponent implements OnInit, OnChanges{
  @Output() textOutput: EventEmitter<String> = new EventEmitter<String>();
  @Input() savedContent: String;
  @Input() editorPlaceholder: String;
  editorContent: String;
  buttonText: String;

  showBox: Boolean = true;
  config: any;

  constructor() {

  }
  ngOnChanges(changes: SimpleChanges) {
    this.editorContent = this.savedContent;
  }
  ngOnInit() {
    this.config = {
      uiColor: '',
      extraPlugins: 'confighelper',
      placeholder: this.editorPlaceholder,
      removePlugins: 'elementspath,wsc,scayt',
      autoGrow_onStartup: true,
      entities: false
    };
    if (this.savedContent) {
      //this.editorContent = this.savedContent;
      this.buttonText = 'Show Content';
      // this.toggleBox();
    } else {
      this.buttonText = 'Add Content';

    }
  }
  onFocus(event) {
  }
  onBlur(event) {
  }
  onChange(editorContent) {
    console.log(this.editorContent);
    this.textOutput.emit(this.editorContent);
  }

  toggleBox() {
    this.showBox = !this.showBox;
    if (this.showBox === false && !this.savedContent) {
      this.buttonText = 'Add Content';
    } else if (this.showBox === false && this.savedContent) {
      this.buttonText = 'Show Content';
    } else {
      this.buttonText = 'Hide Content';
    }
  }
}
