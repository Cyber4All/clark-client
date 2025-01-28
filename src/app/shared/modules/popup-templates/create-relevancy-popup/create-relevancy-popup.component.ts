import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { EditorialService } from '../../../../core/learning-object-module/editorial.service';
import {
  BOLD_BUTTON,
  ITALIC_BUTTON,
  LINK_INPUT,
  ORDERED_LIST_BUTTON,
  REDO_BUTTON,
  REMOVE_FORMAT_BUTTON,
  UNDERLINE_BUTTON,
  UNDO_BUTTON,
  UNORDERED_LIST_BUTTON,
  SEPARATOR,
} from 'ngx-simple-text-editor';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'clark-create-relevancy-popup',
  templateUrl: './create-relevancy-popup.component.html',
  styleUrls: ['./create-relevancy-popup.component.scss'],
})
export class CreateRelevancyPopupComponent implements OnInit {
  constructor(private editorialService: EditorialService) {}

  editorNotes = '';

  @Output() createStory: EventEmitter<string> = new EventEmitter();
  @Output() closeModal: EventEmitter<void> = new EventEmitter();

  textBoxConfig = {
    placeholder: 'Enter your notes here...',
    buttons: [
      UNDO_BUTTON,
      REDO_BUTTON,
      SEPARATOR,
      BOLD_BUTTON,
      ITALIC_BUTTON,
      UNDERLINE_BUTTON,
      SEPARATOR,
      REMOVE_FORMAT_BUTTON,
      SEPARATOR,
      ORDERED_LIST_BUTTON,
      UNORDERED_LIST_BUTTON,
      SEPARATOR,
      LINK_INPUT,
    ],
  };

  ngOnInit(): void {}

  // Submit the relevancy story by emitting the event.
  submit() {
    this.createStory.emit(this.editorNotes);
  }
}
