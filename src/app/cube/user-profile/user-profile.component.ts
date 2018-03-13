import { USER_ROUTES } from '../../../environments/route';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../../core/auth.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { UserInformationComponent } from '../user-information/user-information.component';
import { UserEditInformationComponent } from './../user-edit-information/user-edit-information.component';
import { ModalService, ModalListElement } from '../../shared/modals';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User;
  self: boolean = false;
  myStyle;
  particleParams;
  height: number = 100;
  width: number = 100;

  editContent: boolean = false;

  constructor(
    private service: LearningObjectService,
    private auth: AuthService,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // get data from resolve
    this.route.data.subscribe(val => {
      this.user = val.user;
      this.self = this.user.username === this.auth.username;
    });
    
    // particle config
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
          value: 200,
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
          value: 0.1,
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
          opacity: 0.1,
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
            distance: 50,
            size: 10,
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

  closeEdit(changed: boolean = false) {
    this.editContent = false;
    if (changed) {
      this.user = this.auth.user;
    }
  }
}
