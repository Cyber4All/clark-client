import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
  Output,
  EventEmitter,
  AfterViewChecked,
  Input,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'clark-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('optionOneSwitch') optionOneSwitch: ElementRef;
  @ViewChild('optionTwoSwitch') optionTwoSwitch: ElementRef;

  @Input() focus: Subject<any>;

  @Output() close: EventEmitter<string> = new EventEmitter();

  subs: Subscription[] = [];

  selected = 1;
  selectedSource: string;
  toggled = true;

  // This is passed to the mappings-filter component, which will subscribe to it. On event, the component will close all dropdowns
  closeMappingsDropdown: Subject<string> = new Subject();

  // This is passed to the mappings-filter component, which will subscribe to it. On event, component will focus the input
  focusMappingsFilter: Subject<string> = new Subject();

  descriptionText = (this.selected === 1) ? 'Search for learning objects by organization, user, or keyword/phrase.' :
    'Search for learning objects by mapped standard outcomes';

  constructor(private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
    if (this.focus) {
      this.subs.push(this.focus.subscribe(() => {
        this.performFocus();
      }));
    }
  }

  toggle(active: number) {
    // do nothing if same number
    if (active !== this.selected) {
      const next = active === 1 ? this.optionOneSwitch : this.optionTwoSwitch;
      const current = this.selected === 1 ? this.optionOneSwitch : this.optionTwoSwitch;

      next.nativeElement.style.transitionDelay = '0.2s';
      current.nativeElement.style.transitionDelay = '0s';

      this.selected = active;
      this.toggled = true;
    }
  }

  ngAfterViewChecked() {
    if (this.toggled) {
      this.toggled = false;
      this.performFocus();
    }
  }

  performFocus() {
    console.log(this.selected);
    if (this.selected === 1) {
      this.searchInput.nativeElement.focus();
    } else {
      this.focusMappingsFilter.next();
    }
  }

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   * @param searchbar reference to input
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const query = searchbar.value;
    if (query.length) {
      this.router.navigate(['/browse', { query }]);
    }

    this.close.emit();
  }

  /**
   * Takes am outcome id and passes it to the browse component as a query parameter
   * @param outcomeId id of outcome
   */
  performOutcomeSearch(outcomeId) {
    this.closeMappingsDropdown.next();
    this.router.navigate(['/browse', { standardOutcomes: outcomeId }]);
  }

  toggleMappingsFilterSource(sourceName: string) {
    if (sourceName === this.selectedSource) {
      // we're toggling it off
      this.selectedSource = undefined;
    } else {
      // we're changing it
      this.selectedSource = sourceName;
    }
  }

  ngOnDestroy() {
    if (this.subs.length) {
      for (let i = 0, l = this.subs.length; i < l; i++) {
        this.subs[i].unsubscribe();
      }

      this.subs = [];
    }
  }

}
