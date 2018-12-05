import { Input, Output, EventEmitter, Component, OnChanges, SimpleChanges, OnInit } from '@angular/core';

@Component({
  selector: 'clark-text-editor',
  template: `
  <div *ngIf="showBox">
    <ckeditor
        [(ngModel)]="editorContent"
        [config]="config"
        [readonly]="false"
        (change)="onChange($event)"
        (focus)="touched.emit()"
        >
    </ckeditor>
  </div>
  `,
  styles: ['#cke_bottom_detail, .cke_bottom { display: none; }']
})
export class TextEditorComponent implements OnInit, OnChanges {
  @Input() savedContent: string;
  @Input() editorPlaceholder: string;

  @Output() textOutput: EventEmitter<string> = new EventEmitter();
  @Output() touched: EventEmitter<void> = new EventEmitter();

  editorContent: string;
  counter: any;
  buttonText: string;

  showBox: Boolean = true;
  config: any;

  constructor() {

  }
  ngOnChanges(changes: SimpleChanges) {
    this.editorContent = this.savedContent;
  }

  ngOnInit() {
    this.counter = {
      showParagraphs: false,
      showWordCount: false,
      showCharCount: true,
      countSpacesAsChars: false,
      countHTML: false,
      maxWordCount: -1,
      maxCharCount: 1000,
    };

    this.config = {
      uiColor: '',
      extraPlugins: 'confighelper,wordcount,notification',
      placeholder: this.editorPlaceholder,
      removePlugins: 'elementspath,wsc,scayt',
      autoGrow_onStartup: true,
      entities: false,
      wordcount: this.counter
    };
    if (this.savedContent) {
      // this.editorContent = this.savedContent;
      this.buttonText = 'Show Content';
      // this.toggleBox();
    } else {
      this.buttonText = 'Add Content';

    }
  }

  onChange() {
    this.textOutput.emit(this.editorContent || '');
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
