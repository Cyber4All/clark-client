import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodePreviewComponent } from './code-preview.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarkdownModule } from 'ngx-markdown';
import { of } from 'rxjs';

describe('CodePreviewComponent', () => {
  let component: CodePreviewComponent;
  let fixture: ComponentFixture<CodePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodePreviewComponent],
      imports: [HttpClientTestingModule, MarkdownModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              url: 'test-url',
              language: 'javascript',
              filename: 'test.js',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CodePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
