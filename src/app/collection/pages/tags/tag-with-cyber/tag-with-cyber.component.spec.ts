import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagWithCyberComponent } from './tag-with-cyber.component';

describe('TagWithCyberComponent', () => {
  let component: TagWithCyberComponent;
  let fixture: ComponentFixture<TagWithCyberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagWithCyberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagWithCyberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
