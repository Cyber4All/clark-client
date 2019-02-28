import { take } from 'rxjs/operators';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  Renderer2
} from '@angular/core';
import { CartV2Service } from '../../core/cartv2.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { AuthService, DOWNLOAD_STATUS } from '../../core/auth.service';
import { CollectionService } from '../../core/collection.service';
import { TitleCasePipe } from '@angular/common';

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

  collections = new Map<string, string>();

  canDownload = false;
  showDownloadModal = false;

  contributors: string;
  contributorsDisplay: string;

  constructor(
    private hostEl: ElementRef,
    private renderer: Renderer2,
    private cart: CartV2Service,
    public auth: AuthService,
    private collectionService: CollectionService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading) {
      if (changes.loading.currentValue) {
        this.renderer.addClass(this.hostEl.nativeElement, 'loading');
      } else {
        this.renderer.removeClass(this.hostEl.nativeElement, 'loading');
      }
    }

    if (changes.learningObject) {
      this.makeContributors();
    }
  }

  ngOnInit() {
    this.auth.isLoggedIn.subscribe(() => {
      this.auth.userCanDownload(this.learningObject).then(isAuthorized => {
        this.canDownload = isAuthorized === DOWNLOAD_STATUS.CAN_DOWNLOAD;
      });
    });

    this.collectionService.getCollections().then(collections => {
      this.collections = new Map(
        collections.map(c => [c.abvName, c.name] as [string, string])
      );
    });
  }

  goals() {
    const punc = ['.', '!', '?'];
    const descriptionString = this.learningObject.description;
    const final = this.truncateText(
      descriptionString.charAt(0).toUpperCase() +
        descriptionString.substring(1),
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
    // The top regex is used for matching tags such as <br />
    // The bottom regex will catch tags such as </p>
    str = str.replace(/<[0-z\s\'\"=]*[\/]+>/gi, ' ');
    return str.replace(/<[\/]*[0-z\s\'\"=]+>/gi, ' ');
  }

  get date() {
    // tslint:disable-next-line:radix
    return new Date(parseInt(this.learningObject.date));
  }

  /**
   * Create a contributors string to be rendered on the list item when an object is passed
   *  in to the component. Also sets contributorsDisplay property if the number of contributors is too
   *  long to display in the author span. In that case, the contributorsDisplay property is used in the authors
   *  span and the complete contributors string is set as a tooltip.
   *
   * @memberof LearningObjectListingComponent
   */
  makeContributors() {
    const titleCase = new TitleCasePipe();
    // short circuit the logic if there aren't any contributors
    if (
      !this.learningObject.contributors ||
      !this.learningObject.contributors.length
    ) {
      this.contributors = titleCase.transform(this.learningObject.author.name);
      return;
    }

    const contributors = [
      titleCase.transform(this.learningObject.author.name)
    ].concat(
      this.learningObject.contributors.map(c => titleCase.transform(c.name))
    );

    if (contributors.length === 2) {
      // special case, should read 'a and b'
      this.contributors = contributors.join(' and ');
    } else {
      // join everything on comma space, then replace the last instance with ' and '
      const tempResult = contributors.join(', ');
      const lastIndex = tempResult.lastIndexOf(', ');
      this.contributors =
        tempResult.substring(0, lastIndex) +
        ' and ' +
        tempResult.substring(lastIndex + 1);
      // we know we'll need a tooltip here, so we'll create the contributors string as normal but also set the contributorsDisplay property
      // with a truncated version to be used instead. The contributors string here will be rendered in a tooltip instead.
      this.contributorsDisplay =
        contributors.slice(0, 2).join(', ') +
        ' and ' +
        (contributors.length - 2) +
        ` other${contributors.length - 2 > 1 ? 's' : ''}`;
    }
  }

  download(e) {
    // Stop the event propagation so that the routerLink of the parent doesn't trigger
    e.stopPropagation();
    this.cart
      .downloadLearningObject(
        this.learningObject.author.username,
        this.learningObject.name
      )
      .pipe(take(1));

    this.toggleDownloadModal(true);
  }

  toggleDownloadModal(val?: boolean) {
    if (!val) {
      this.showDownloadModal = val;
    } else if (!localStorage.getItem('downloadWarning')) {
      this.showDownloadModal = val;
      localStorage.setItem('downloadWarning', 'true');
    }
  }
}
