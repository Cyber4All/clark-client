import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { CartV2Service } from '../../core/cartv2.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'learning-object-component',
  templateUrl: 'learning-object.component.html',
  styleUrls: ['./learning-object.component.scss']
})
export class LearningObjectListingComponent implements OnInit, OnChanges {
  @Input() learningObject: LearningObject;
  @Input() link;
  @Input() loading: boolean;
  @Input() owned? = false;

  constructor(private hostEl: ElementRef, private renderer: Renderer2, private cart: CartV2Service, public auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading) {
      if (changes.loading.currentValue) {
        this.renderer.addClass(this.hostEl.nativeElement, 'loading');
      } else {
        this.renderer.removeClass(this.hostEl.nativeElement, 'loading');
      }
    }
  }

  ngOnInit() {}

  goals() {
    const punc = ['.', '!', '?'];
    // convert goals to an array of strings containing the goal text
    // let goalsArray = this.learningObject.goals.map(g => g.text);

    // // insert an 'and' before the last goal if there's more than one
    // if (goalsArray.length > 1) {
    //     goalsArray[goalsArray.length - 1] = ' and ' + goalsArray[goalsArray.length - 1];
    // }

    // replace all sentence-ending periods (only remove periods at the end of goals)
    // goalsArray = goalsArray.map(g => g.replace(/\.+\s*$/gm, ''));

    // join all of the formatted goals with a comma and a space and convert to lower case;
    // const goalsString = goalsArray.join(', ');
    // return newly formatted string with the first character capitalized and a period at the end
    const goalsString = this.learningObject.goals[0].text;
    const final = this.truncateText(
      goalsString.charAt(0).toUpperCase() + goalsString.substring(1),
      150
    );

    if (punc.includes(final.charAt(final.length - 1))) {
      return final;
    } else {
      return final + '.';
    }
  }

  // truncates and appends an ellipsis to block of text based on maximum number of characters
  truncateText(text: string, max: number = 150, margin: number = 10): string {
    // remove any HTML characters from text
    text = this.stripHtml(text);

    // check to see if we need to truncate, IE is the text shorter than max + margin
    if (text.length <= max + margin) {
      return text.trim();
    }

    // ok now we know we need to truncate text
    let outcome = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + outcome.length; // first space before the truncation index
    const spaceBefore = outcome.lastIndexOf(' '); // first space after the truncation index
    const punc = ['.', '!', '?'];

    // if we've truncated such that the last char is a space or a natural punctuation, just return
    if (punc.includes(outcome.charAt(outcome.length - 1))) {
      outcome = outcome.trim();
    } else if (outcome.charAt(outcome.length - 1) === ' ') {
      outcome = outcome.substring(0, outcome.length - 1).trim() + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - outcome.length <= margin) {
      outcome = text.substring(0, spaceAfter + 1).trim();
    } else {
      outcome = text.substring(0, spaceBefore + 1).trim();
    }

    return outcome.trim() + '...';
  }

  stripHtml(str: string): string {
    return str.replace(/<[\/]*[0-z\s\'\"=]+>/gi, ' ');
  }

  get date() {
    // tslint:disable-next-line:radix
    return new Date(parseInt(this.learningObject.date));
  }

  download(e) {
    // Stop the event propagation so that the routerLink of the parent doesn't trigger
    e.stopPropagation();
    this.cart.downloadLearningObject(this.learningObject.author.username, this.learningObject.name)
      .take(1);
  }
}
