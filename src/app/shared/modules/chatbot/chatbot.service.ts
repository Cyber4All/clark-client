import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  constructor() { }

  toggleChatbot(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  openChatbot(): void {
    this.isOpenSubject.next(true);
  }

  closeChatbot(): void {
    this.isOpenSubject.next(false);
  }

  getIsOpen(): boolean {
    return this.isOpenSubject.value;
  }
}
