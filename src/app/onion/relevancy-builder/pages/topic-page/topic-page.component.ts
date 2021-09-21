import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-topic-page',
  templateUrl: './topic-page.component.html',
  styleUrls: ['./topic-page.component.scss']
})
export class TopicPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Function to send email for topic tool tip
   */
  sendEmail() {
    const mail = document.createElement('a');
    mail.href = `mailto:info@secured.team?subject=CLARK Learning Object Topic Suggestion`;
    mail.click();
  }

}
