import { LearningObjectService } from '../../../shared/services/learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FileStorageService } from '../services/file-storage.service';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';


describe('CreateComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpModule,
        FormsModule,
      ],
      declarations: [
        UploadComponent,
      ],
      providers: [
        LearningObjectService,
        FileStorageService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
