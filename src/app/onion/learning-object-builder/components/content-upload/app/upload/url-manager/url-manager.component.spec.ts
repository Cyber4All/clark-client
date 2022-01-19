import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlManagerComponent } from './url-manager.component';

describe('UrlManagerComponent', () => {
  let component: UrlManagerComponent;
  let fixture: ComponentFixture<UrlManagerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UrlManagerComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
