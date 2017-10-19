import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import { Button } from './button';
//to use the button class within this file, we must import it from the button.ts file
 
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
/*
  Component class for initialization of buttons
  The button class is implemented for populting buttons.
*/
export class ButtonComponent {
  selectedButton: Button = new Button(1, 'Describe risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of human security');
  buttons = [
     new Button(1, 'Describe risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of human security' ),
     new Button(2, 'Identify risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of enterprise security' ),
     new Button(3, 'Define risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of system security' ),
     new Button(4, 'Identify risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of software security'),
     new Button(5, 'Recognize risks, vulnerabilities, and possible solutions to cybersecurity issues in the area of societal security')
  ]
}
