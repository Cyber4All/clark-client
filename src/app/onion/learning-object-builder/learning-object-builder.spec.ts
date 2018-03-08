/*import { LearningObjectServiceMock } from './../mocks/learning-object.service.mock';
import { ConfigService } from './../services/config.service';
import { DndModule } from 'ng2-dnd';
import { HttpModule } from '@angular/http';
import { SuggestionModule } from './../suggestion/suggestion.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';

import { ContentEditableDirective } from './contenteditable-model.directive';
import { LearningObjectService } from '../learning-object.service';

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';



// TODO some remove these imports

describe('LearningObjectBuilderComponent', () => {
    let component: LearningObjectBuilderComponent;
    let fixture: ComponentFixture<LearningObjectBuilderComponent>;
    //let dataStub: DataStub;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                LearningObjectBuilderComponent,
                ContentEditableDirective
            ],
            imports: [
                CommonModule,
                FormsModule,
                SuggestionModule,
                ReactiveFormsModule,
                HttpModule,
                DndModule.forRoot()
            ]
        }).overrideComponent(LearningObjectBuilderComponent, { // These needs to be mocked out
            set: {
                providers: [{ provide: LearningObjectService, useClass: LearningObjectServiceMock }, 
                    { provide: ConfigService, useClass: ConfigService }, {provide: ActivatedRoute, useClass: ActivatedRoute }],
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectBuilderComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should do nothing', () => {
        expect(true).toEqual(true);
    });
});

*/