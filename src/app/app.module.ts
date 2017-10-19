import { LearningObjectService } from './learning-object.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';

@NgModule({
  declarations: [
    AppComponent,
    CurriculumGroupComponent
],
  imports: [
    BrowserModule,
    HttpModule,
  ],
  providers: [
    LearningObjectService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
