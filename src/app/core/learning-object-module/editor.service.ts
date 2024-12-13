import { Injectable } from '@angular/core';
import { LEARNING_OBJECT_ROUTES } from '../learning-object-module/learning-object/learning-object.routes';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private http: HttpClient) { }
}
