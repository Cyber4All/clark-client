import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { ParticlesModule } from 'angular-particle';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  loading: boolean = false;
  returnUrl: string;
  error: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) { }

  /* Particles.js */
  myStyle: object = {};
  myParams: object = {};
  width: number = 100;
  height: number = 100;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    //Particles.js settings
    this.myStyle = {
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'z-index': -1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };

    this.myParams = {
      "particles": {
        "number": {
          "value": 160,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#ffffff"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 1,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 4,
            "size_min": 0.3,
            "sync": false
          }
        },
        "line_linked": {
          "enable": false,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 600
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": false,
            "mode": "bubble"
          },
          "onclick": {
            "enable": false,
            "mode": "repulse"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 250,
            "size": 0,
            "duration": 2,
            "opacity": 0,
            "speed": 3
          },
          "repulse": {
            "distance": 400,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    }
  };

  /**
   * Registers user if username is available, logs new user in and naviagtes to dashboard
   * 
   * @param {NgForm} form 
   * @returns {void} 
   * @memberof RegisterComponent
   */
  register(form: NgForm): void {
    if (!form.valid) return;
    let username = form.value.username;
    let password = form.value.password;
    let firstname = form.value.firstname;
    let lastname = form.value.lastname;
    let email = form.value.email;

    this.loading = true;
    this.authenticationService.register(username, password, firstname, lastname, email)
      .then(
      user => {
        this.router.navigate(['dashboard']);
      },
      error => {
        switch (error.status) {
          case 400:
            //handle account taken
            this.error = 'That username is already in use.';
            break;
          case 420:
            //email already in use
            this.error = 'That email is already registered to an account.';
            break;
          case 500:
            //handle server error
            this.error = 'Server Error. Please try again later.';
            break;
        }
        this.loading = false;
      });
  }

  /**
   * Navigates back to login page
   * 
   * @memberof RegisterComponent
   */
  login(): void {
    this.router.navigate(['login'], { queryParams: { returnUrl: this.returnUrl } });
  }

}
