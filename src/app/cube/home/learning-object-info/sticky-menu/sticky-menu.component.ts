import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleTagService } from '../../google-tag.service';
import { LEARNING_OBJECT_INFO_STATES } from '../learning-object-info.component';

@Component({
  selector: 'clark-sticky-menu',
  templateUrl: './sticky-menu.component.html',
  styleUrls: ['./sticky-menu.component.scss'],
  animations: [
    trigger('isHighlighed', [
      state('highlighted', style({
        backgroundColor: '#E9F0FE',
        color: '#376ED6',
        fontWeight: 600,
      })),
      state('notHighlighted', style({
        color: '#AAAAAA'
      })),
      transition('isHighlighted => notHighlighted', [
        animate('4s')
      ]),
      transition('notHightlighted => isHighlighted', [
        animate('4s')
      ])
    ])
  ]
})
export class StickyMenuComponent implements OnInit {
  isHighlighted = {
    learningObjects: true, // LearningObjects starts highlighted
    learningOutcomes: false,
    hierarchies: false,
    collections: false,
  };
  isMobileView = false;
  responsiveThreshold = 825;
  windowWidth: number;
  mobileDropdown = false;
  currentMobile = 'Learning Objects';

  /* The component that will be highlighted when in view */
  @Input() currentComponentInView: LEARNING_OBJECT_INFO_STATES;

  constructor(
    private router: Router,
    public googleTagService: GoogleTagService
    ) {
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {

  }

  /**
   * Listening for scrolling event and updates the menu when the
   * currentComponentInView changes
   */
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.setFields(this.currentComponentInView);
  }

  /**
   * Sets IsMobileView to true after a threshold has been passed
   *
   * @param event The Host listener event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView = this.responsiveThreshold > event.target.innerWidth;
  }

  /**
   * Handles when the user clicks on an option of the menu
   * Brings the user to the top of that div using scrollIntoView, this will
   * call the @hostListener function which will set the proper fields
   *
   * @param choice The choice to go to
   */
  async changeSelection(choice: LEARNING_OBJECT_INFO_STATES) {
    const el = document.getElementById(choice);
    setTimeout(() => {
      el.scrollIntoView({ 'behavior': 'smooth' });
    });
  }

  /**
   * Sets all fields. The one field that matches the selection will be set to true and highlighted
   * All other fields will be set to false.
   */
  setFields(selection: string) {
    this.isHighlighted.learningObjects = LEARNING_OBJECT_INFO_STATES.LEARNING_OBJECT === selection;
    this.isHighlighted.learningOutcomes = LEARNING_OBJECT_INFO_STATES.LEARNING_OUTCOMES === selection;
    this.isHighlighted.hierarchies = LEARNING_OBJECT_INFO_STATES.HIERARCHIES === selection;
    this.isHighlighted.collections = LEARNING_OBJECT_INFO_STATES.COLLECTIONS === selection;
  }

  /**
   * Checks to see if any of the values are set to true (highlighted)
   *
   * @returns True if one of the values is highlighted (set to true)
   */
  isOtherChoiceSelected() {
    return Object.values(this.isHighlighted).every((isSelected) => !isSelected);
  }

  public get LearningObjectInfoState(): typeof LEARNING_OBJECT_INFO_STATES {
    return LEARNING_OBJECT_INFO_STATES;
  }

  /**
   * Toggles mobile dropdown
   *
   * @param isOpen
   */
  toggleDropdown(isOpen = false) {
    this.mobileDropdown = isOpen;
  }
}

