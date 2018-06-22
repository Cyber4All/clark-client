import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectMetadataComponent } from '../metadata/metadata.component';
import { LearningObjectErrorStoreService } from '../../../errorStore';
import { UserService } from '../../../../../core/user.service';
import { AuthService } from '../../../../../core/auth.service';
import { Http, HttpModule } from '@angular/http';
import { ConnectionBackend, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterComponent } from '../../../../../cube/shared/breadcrumb/router.component';
import { expect } from 'chai';
import { BrowserDynamicTestingModule,
  platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe(' LearningObjectMetadataComponent', () => {
  let component: LearningObjectMetadataComponent;
  let fixture: ComponentFixture<LearningObjectMetadataComponent>;

  beforeEach(async(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule,
      platformBrowserDynamicTesting());
    TestBed.configureTestingModule({
      providers: [ LearningObjectErrorStoreService, UserService, AuthService, Http, ConnectionBackend, RequestOptions ],
      declarations: [ LearningObjectMetadataComponent ],
      imports: [ FormsModule, HttpModule ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(LearningObjectMetadataComponent);
    component = fixture.componentInstance;
    console.log(component);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).to.be.true;
  });

  // describe('search', () => {
  //   it('should change value of "arrayOfUsers"', done => {
  //       const expectedLength  = 10;
  //       // First, we need to entry a value into the search query.
  //       // component.query.text = 'n';
  //       const div = fixture.nativeElement.querySelector('div');
  //       // Now, we search for this text.
  //       console.log(div);
  //       // LearningObjectMetadataComponent.prototype.search();
  //       expect(LearningObjectMetadataComponent.prototype.arrayOfUsers.length).to.be(expectedLength);
  //   });
  // });
});

// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { LearningObjectMetadataComponent } from '../metadata/metadata.component';

// describe('LearningObjectMetadataComponent', () => {
//   let component: LearningObjectMetadataComponent;
//   let fixture: ComponentFixture<LearningObjectMetadataComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ LearningObjectMetadataComponent ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LearningObjectMetadataComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
