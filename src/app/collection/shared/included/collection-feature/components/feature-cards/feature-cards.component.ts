import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { AttributeService } from '../../attribute.service';

@Component({
  selector: 'clark-collection-feature-cards',
  templateUrl: './feature-cards.component.html',
  styleUrls: ['./feature-cards.component.scss']
})
export class FeatureCardsComponent implements OnInit {

  @Input() learningObject: any;
  @Input () primaryColor: string;

  hslVal;
  parents;
  children;
  hierarchyTag = '';

  constructor(
    private attributeService: AttributeService,
    private collectionService: CollectionService
    ) { }

  async ngOnInit() {
    this.setColorScheme();
    const hierarchy = await this.attributeService.getHierarchy(
      this.learningObject.author.username,
      this.learningObject.id
    );
    this.parents = hierarchy.parents;
    this.children = hierarchy.children;

    this.setHierarchy();
    this.setDescription();

    this.learningObject.collection = await (await this.collectionService.getCollection(this.learningObject.collectionName)).name;
  }

  setColorScheme() {
    this.convertHexToHSL(this.primaryColor);
  }

  setDescription() {
    this.learningObject.description =  this.learningObject.description.slice(0, 260);
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
