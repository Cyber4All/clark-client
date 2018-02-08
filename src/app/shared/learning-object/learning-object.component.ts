import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'learning-object-component',
    templateUrl: 'learning-object.component.html',
    styleUrls: ['./learning-object.component.scss']
})
export class LearningObjectListingComponent implements OnInit {
    @Input() learningObject;
    @Input() link;
    
    public particleParams: any;
    myStyle: object = {};
    public width: number = 100;
    public height: number = 100;

    constructor() { }

    ngOnInit() {

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
            "particles": {
                "number": {
                "value": 170,
                "density": {
                    "enable": true,
                    "value_area": 300
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
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
                },
                "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
                },
                "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
                },
                "move": {
                "enable": false,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                "onhover": {
                    "enable": false,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": false,
                    "mode": "push"
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
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
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
        };
    }

    get goals() {
        let goalsArray = this.learningObject.goals.map(g => g.text);
        if (goalsArray.length > 1) goalsArray[goalsArray.length - 1] = ' and ' + goalsArray[goalsArray.length - 1];
        let goalsString = goalsArray.join(', ').toLowerCase();
        goalsString = goalsString.replace(/\.$/gm, '');
        return goalsString.charAt(0).toUpperCase() + goalsString.substring(1) + '.';
    }

    get date() {
        return new Date(parseInt(this.learningObject.date));
    }
}
