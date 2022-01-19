import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPageComponent } from './generic-page.component';

describe('GenericPageComponent', () => {
  let component: GenericPageComponent;
  let fixture: ComponentFixture<GenericPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [GenericPageComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
