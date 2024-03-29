import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlRowComponent } from './url-row.component';

describe('UrlRowComponent', () => {
  let component: UrlRowComponent;
  let fixture: ComponentFixture<UrlRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UrlRowComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
