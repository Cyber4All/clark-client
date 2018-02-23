import { LearningObjectService } from './learning-object.service';
import { Component, OnInit } from '@angular/core';
import { ModalService, Position, ModalListElement } from '@cyber4all/clark-modal';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  activeContentSwitcher = 'search';
  hideTopbar: any = false;
  filterButton = false;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      const root: ActivatedRoute = this.route.root;
      this.hideTopbar = root.children[0].snapshot.data.hideTopbar;
    });
  }

  /**
   * Manages click events for the button for switching between contributing and searching (onion and cube)
   * @param event
   */
  contentSwitchClick(event) {
    const el = event.target;
    const h = document.getElementsByClassName('content-switch')[0];
    if (el.classList.contains('contribute') && this.activeContentSwitcher !== 'contribute') {
      h.classList.remove('right');
      h.classList.add('left');
      this.activeContentSwitcher = 'contribute';

      setTimeout(() => {
        window.location.href = 'http://onion.clark.center';
      }, 250);
    } else if (el.classList.contains('search') && this.activeContentSwitcher !== 'search') {
      h.classList.remove('left');
      h.classList.add('right');
      this.activeContentSwitcher = 'search';
    }
  }

  filterButtonClick() {
    this.filterButton = !this.filterButton;
  }

  filterButtonClickAway() {
    if (this.filterButton) {
      this.filterButtonClick();
    }
  }

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   * @param query
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const query = searchbar.value;
    if (query.length) {
      this.router.navigate(['/browse', { query }]);
    }
  }
}
