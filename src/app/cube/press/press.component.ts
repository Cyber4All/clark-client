import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


// Structure of the Mention objecticon: string;
export class Mention {
  constructor(public title: string, public link: string, public icon: string) { }
}

@Component({
  selector: 'clark-press',
  templateUrl: './press.component.html',
  styleUrls: ['./press.component.scss']
})
export class PressComponent implements OnInit {

  mentions: Mention[];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.httpClient.get('assets/images/press/mentions.json', { responseType: 'json' }).toPromise().then((data: Mention[]) => {
      this.mentions = data;
    });
  }

}
