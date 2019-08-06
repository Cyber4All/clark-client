export class ModalListElement {
  text: string;
  func: string;
  classes: string;
  checkbox = false;

  constructor(text: string, func: string, classes?: string, checkbox?: boolean) {
    this.text = text;
    this.func = func;

    if (checkbox) {
      this.checkbox = checkbox;
    }

    if (classes) {
      this.classes = classes;
    }
  }
}
