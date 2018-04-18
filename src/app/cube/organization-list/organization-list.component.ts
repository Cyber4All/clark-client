import { User } from '@cyber4all/clark-entity';
import { Http } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'clark-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organization;
  members: Array<User>;
  width = 100;
  height = 100;
  myStyle;
  particleParams;


  constructor(private route: ActivatedRoute, private http: Http, private userService: UserService) { }

  ngOnInit() {
    this.initParticles();
    this.route.params.subscribe(params => {
      params['query'] ? this.organization = params['query'] : this.organization = '';
    });
    this.fetchMembers();
  }

  async fetchMembers() {
    this.members = await this.userService.getOrganizationMembers(this.organization);
    // sorts by last name
    this.members.sort(function (a, b) {
      const first = a.name.substr(a.name.indexOf(' ') + 1).toUpperCase();
      const second = b.name.substr(b.name.indexOf(' ') + 1).toUpperCase();
      return (first < second) ? -1 : (first > second) ? 1 : 0;
    });
  }

  initParticles() {
    this.myStyle = {
      'position': 'absolute',
      'width': '100%',
      'height': '100%',
      'z-index': 0,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };

    this.particleParams = {
      'particles': {
        'number': {
          'value': 180,
          'density': {
            'enable': true,
            'value_area': 900
          }
        },
        'color': {
          'value': '#ffffff'
        },
        'shape': {
          'type': 'circle',
          'stroke': {
            'width': 0,
            'color': '#000000'
          },
          'polygon': {
            'nb_sides': 5
          },
          'image': {
            'src': 'img/github.svg',
            'width': 100,
            'height': 100
          }
        },
        'opacity': {
          'value': 0.5,
          'random': false,
          'anim': {
            'enable': false,
            'speed': 1,
            'opacity_min': 0.1,
            'sync': false
          }
        },
        'size': {
          'value': 3,
          'random': true,
          'anim': {
            'enable': false,
            'speed': 40,
            'size_min': 0.1,
            'sync': false
          }
        },
        'line_linked': {
          'enable': true,
          'distance': 150,
          'color': '#ffffff',
          'opacity': 0.4,
          'width': 1
        },
        'move': {
          'enable': true,
          'speed': 0,
          'direction': 'none',
          'random': false,
          'straight': false,
          'out_mode': 'out',
          'bounce': false,
          'attract': {
            'enable': false,
            'rotateX': 600,
            'rotateY': 1200
          }
        }
      },
      'interactivity': {
        'detect_on': 'canvas',
        'events': {
          'onhover': {
            'enable': false,
            'mode': 'repulse'
          },
          'onclick': {
            'enable': false,
            'mode': 'push'
          },
          'resize': true
        },
        'modes': {
          'grab': {
            'distance': 400,
            'line_linked': {
              'opacity': 1
            }
          },
          'bubble': {
            'distance': 400,
            'size': 40,
            'duration': 2,
            'opacity': 8,
            'speed': 3
          },
          'repulse': {
            'distance': 200,
            'duration': 0.4
          },
          'push': {
            'particles_nb': 4
          },
          'remove': {
            'particles_nb': 2
          }
        }
      },
      'retina_detect': true
    };
  }
}
