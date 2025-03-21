import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from '../../../../../../core/collection-module/collections.service';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';

@Component({
  selector: 'clark-collection-feature-cards',
  templateUrl: './feature-cards.component.html',
  styleUrls: ['./feature-cards.component.scss']
})
export class FeatureCardsComponent implements OnInit {

  @Input()collection: string;
  @Input()learningObject: any;
  @Input()primaryColor: string;

  hslVal;
  parents;
  children;
  hierarchyTag = '';
  loading = true;

  constructor(
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService,
    ) { }

  async ngOnInit() {
    this.loading = true;
    this.setColorScheme();

    this.parents = await this.learningObjectService.getLearningObjectParents(this.learningObject.id);
    this.children = await this.learningObjectService.getLearningObjectChildren(this.learningObject.id);

    this.setHierarchy();
    this.setDescription();

    this.learningObject.collection = await (await this.collectionService.getCollection(this.collection)).name;
    this.loading = false;
  }

  /**
   * Sets colors for fonts and background colors
   */
  setColorScheme() {
    this.convertHexToHSL(this.primaryColor);
  }

  setDescription() {
    this.learningObject.description =
      this.learningObject.description.slice(0, 220) + (this.learningObject.description.length > 220 ? ' ...' : '');
  }

  /**
   * Sets the string to display for the hierarchy
   */
  setHierarchy() {
    if (this.parents !== undefined && this.parents.length === 1) {
      this.hierarchyTag = this.parents.length + ' Parent';
    }
    if (this.parents !== undefined && this.parents.length > 1) {
      this.hierarchyTag = this.parents.length + ' Parents';
    }

    if (this.children !== undefined && this.children.length === 1) {
      if (this.parents.length !== 0) {
        this.hierarchyTag = this.hierarchyTag + ', ' + this.children.length + ' Child';
      } else {
        this.hierarchyTag = this.children.length + ' Child';
      }
    }
    if (this.children !== undefined && this.children.length > 1) {
      if (this.parents.length !== 0) {
        this.hierarchyTag = this.hierarchyTag + ', ' + this.children.length + ' Children';
      } else {
        this.hierarchyTag = this.children.length + ' Children';
      }
    }
  }

  /**
   * This function is necessary in order to get the colored overlay for the cards
   *
   * @param H The hex value that is being converted
   * @returns hsl of the hex with the right saturation and light values for the opaque look
   */
  private convertHexToHSL(H) {
    // Convert hex to RGB first
    let r: any = 0, g: any = 0, b: any = 0;
    if (H.length === 4) {
      r = '0x' + H[1] + H[1];
      g = '0x' + H[2] + H[2];
      b = '0x' + H[3] + H[3];
    } else if (H.length === 7) {
      r = '0x' + H[1] + H[2];
      g = '0x' + H[3] + H[4];
      b = '0x' + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0;

    if (delta === 0) {
      h = 0;
    } else if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
      h += 360;
    }

    this.hslVal = 'hsl(' + h + ',' + '27%,' + '45%)';
  }
}
