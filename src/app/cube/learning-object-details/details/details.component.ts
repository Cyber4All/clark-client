import { CartV2Service } from '../../../core/cartv2.service';
import { ModalService } from '../../../shared/modals';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot
} from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LearningGoal } from '@cyber4all/clark-entity/dist/learning-goal';
import { AuthService } from '../../../core/auth.service';
import { NgClass } from '@angular/common';
import { environment } from '@env/environment';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private sub: any;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;

  particleParams: any;
  height = 100;
  width = 100;
  myStyle: object = {};
  returnUrl: string;
  saved = false;

  canDownload = false;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
    });

    this.fetchLearningObject();

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];

    this.myStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      'z-index': 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };

    this.particleParams = {
      particles: {
        number: {
          value: 180,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: '#ffffff'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },
          polygon: {
            nb_sides: 5
          },
          image: {
            src: 'img/github.svg',
            width: 100,
            height: 100
          }
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 0,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: false,
            mode: 'repulse'
          },
          onclick: {
            enable: false,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    };
  }

  // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist: string[] = object.whitelist;
      if (whitelist.includes(this.learningObject.author.username)) {
        this.canDownload = true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async fetchLearningObject() {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.author,
        this.learningObjectName
      );

      // FIXME: Hotfix for whitlisting. Remove if functionallity is extended or removed
      if (environment.production) {
        this.checkWhitelist();
      } else {
        this.canDownload = true;
      }
    } catch (e) {
      console.log(e);
    }
    this.saved = this.cartService.has(this.learningObject);
  }

  async addToCart(download?: boolean) {
    const val = await this.cartService.addToCart(
      this.author,
      this.learningObjectName
    );
    this.saved = this.cartService.has(this.learningObject);
    if (download) {
      try {
        await this.download(this.author, this.learningObjectName);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async clearCart() {
    try {
      await this.cartService.clearCart();
    } catch (e) {
      console.log(e);
    }
  }

  async download(author: string, learningObjectName: string) {
    this.cartService.downloadLearningObject(author, learningObjectName);
  }

  removeFromCart() {
    this.cartService.removeFromCart(this.author, this.learningObjectName);
  }

  reportThisObject() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
