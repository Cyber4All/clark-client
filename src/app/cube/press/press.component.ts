import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mention } from '../../../entity/mention/mention';
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
